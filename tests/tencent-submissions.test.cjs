'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createServer } = require('../serverless/tencent-scf/server');
const reference = require('../serverless/tencent-scf/reference-catalog');

const origin = 'https://peng598.github.io';
const password = 'test-only-password-123';
const env = { SUBMISSIONS_ENABLED:'true', AUTH_SECRET:'test-only-secret-'.repeat(4), ADMIN_EMAIL:'owner@example.com' };
class MemoryStore {
  users = new Map(); sessions = new Map(); records = new Map(); objects = new Map(); rates = new Map();
  async health() {}
  async findUser(email) { return this.users.get(email); }
  async createUser(user) {
    if (this.users.has(user.email)) { const e = new Error(); e.code='ER_DUP_ENTRY'; throw e; }
    this.users.set(user.email,{ ...user, role:'user', disabled:false });
  }
  async addSession(hash,id,expires,passwordHash) {
    const user = [...this.users.values()].find(u => u.id === id);
    assert.equal(passwordHash,user.password_hash);
    this.sessions.set(hash,{ id, expires });
  }
  async sessionUser(hash,now) {
    const session = this.sessions.get(hash);
    if (!session || session.expires <= now) return null;
    const user = [...this.users.values()].find(u => u.id === session.id);
    if (!user || user.disabled) return null;
    return { id:user.id, email:user.email, role:user.role };
  }
  async revokeSession(hash) { this.sessions.delete(hash); }
  async changePassword(id,hash,previousHash) {
    const user = [...this.users.values()].find(u => u.id === id);
    assert.equal(user.password_hash,previousHash);
    user.password_hash=hash;
    for (const [key,value] of this.sessions) if (value.id === id) this.sessions.delete(key);
  }
  async consumeRate(key,limit) {
    const hits=this.rates.get(key)||0;
    if (hits>=limit) return false;
    this.rates.set(key,hits+1); return true;
  }
  async reserveSubmission(row,maxBytes,maxCount) {
    const existing=[...this.records.values()].filter(r=>r.user_id===row.user_id);
    if (existing.length>=maxCount || existing.reduce((n,r)=>n+r.file_size,0)+row.file_size>maxBytes) {
      const error=new Error(); error.code='QUOTA'; throw error;
    }
    this.records.set(row.id,{ ...row,status:'uploading',created_at:new Date().toISOString() });
  }
  async completeSubmission(id) { this.records.get(id).status='pending'; }
  async discardSubmission(id) { this.records.delete(id); }
  async putObject(key,data) { this.objects.set(key,data); }
  async deleteObject(key) { this.objects.delete(key); }
  async getObject(key) { return this.objects.get(key); }
  async getReferenceObject(key, range) {
    const body = Buffer.from('%PDF-1.7\nreference');
    const start = range ? Number(/^bytes=(\d+)-/.exec(range)[1]) : 0;
    const end = range ? Math.min(body.length - 1, Number((/^bytes=\d+-(\d+)$/.exec(range) || [])[1] || body.length - 1)) : body.length - 1;
    const chunk = body.subarray(start, end + 1);
    return { body:chunk, contentLength:chunk.length, contentRange:range ? `bytes ${start}-${end}/${body.length}` : '', contentType:'application/pdf', etag:'"reference"' };
  }
  async headReferenceObject() { return { contentLength:17, contentType:'application/pdf', etag:'"reference"' }; }
  async submission(id) { const row=this.records.get(id); return row?.status !== 'uploading' ? row : null; }
  async listSubmissions(offset) {
    const rows=[...this.records.values()].filter(r=>r.status !=='uploading').slice(offset,offset+21).map(r=>({ ...r, email:[...this.users.values()].find(u=>u.id===r.user_id).email }));
    return { submissions:rows.slice(0,20),next_offset:rows.length>20?offset+20:null };
  }
  async review(id) {
    const row=await this.submission(id); if (!row) return false;
    row.status='reviewed'; return true;
  }
}
async function fixture(t,extra={}) {
  const store=new MemoryStore();
  const clock={ value:Date.now() };
  const server=createServer({ env:{...env,...extra.env},submissionStore:store,now:()=>clock.value });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>{ server.close(resolve); server.closeAllConnections(); }));
  const base='http://127.0.0.1:'+server.address().port;
  const request=(path,{token,method='GET',body,headers={},...rest}={})=>{
    const h={ Origin:origin,...headers };
    if(token) h.Authorization='Bearer '+token;
    if(body && !(body instanceof FormData) && typeof body !=='string') { h['Content-Type']='application/json'; body=JSON.stringify(body); }
    return fetch(base+path,{method,headers:h,body,...rest});
  };
  const register=async(email='user@example.com')=>{
    const res=await request('/api/auth/register',{method:'POST',body:{email,password}});
    assert.equal(res.status,201); return res.json();
  };
  return {store,clock,base,request,register};
}
function form(name='电容笔记.txt',content='private note',overrides={}) {
  const data=new FormData();
  for(const [key,value] of Object.entries({title:'私有笔记',category:'硬件基础与电源',level:'基础',description:'仅管理员可见',source:'本人原创',...overrides})) data.set(key,value);
  data.set('file',new Blob([content]),name); return data;
}
const upload=(app,token,body=form())=>app.request('/api/submissions',{token,method:'POST',body});

test('reference reading is available through protected API and only admins receive download response',async t=>{
  const app=await fixture(t);
  const catalog=require('../assets/reference-library.json');
  const file=catalog.files.find(item=>item.published);
  assert.ok(file && reference.findReference(file.id));
  const read=await app.request('/api/reference/'+file.id+'/read',{headers:{Origin:origin,Range:'bytes=0-5'}});
  assert.equal(read.status,206);
  assert.equal(read.headers.get('content-type'),'application/pdf');
  assert.equal(read.headers.get('content-disposition').startsWith('inline'),true);
  assert.equal(await read.text(),'%PDF-1');
  const anonymous=await app.request('/api/admin/reference/'+file.id+'/download');
  assert.equal(anonymous.status,401);
  const admin=await app.register('admin-reference@example.com');
  app.store.users.get('admin-reference@example.com').role='admin';
  const download=await app.request('/api/admin/reference/'+file.id+'/download',{token:admin.token});
  assert.equal(download.status,200);
  assert.match(download.headers.get('content-disposition'),/^attachment/);
  assert.equal(await download.text(),'%PDF-1.7\nreference');
});

test('register normalizes email, hashes password, ignores claimed role and ADMIN_EMAIL; login/logout',async t=>{
  const app=await fixture(t);
  const response=await app.request('/api/auth/register',{method:'POST',body:{email:' Owner@Example.com ',password,role:'admin'}});
  assert.equal(response.status,201);
  const result=await response.json();
  assert.equal(result.user.email,'owner@example.com'); assert.equal(result.user.role,'user');
  assert.match(result.token,/^[a-f0-9]{64}$/);
  const stored=app.store.users.get('owner@example.com');
  assert.match(stored.password_hash,/^scrypt-v1\$/); assert.ok(!stored.password_hash.includes(password));
  assert.ok(!JSON.stringify(result).includes('password_hash'));
  assert.ok(![...app.store.sessions.keys()].includes(result.token));
  assert.equal((await app.request('/api/auth/register',{method:'POST',body:{email:'owner@example.com',password}})).status,409);
  assert.equal((await app.request('/api/auth/me',{token:result.token})).status,200);
  assert.equal((await app.request('/api/auth/logout',{token:result.token,method:'POST'})).status,200);
  assert.equal((await app.request('/api/auth/me',{token:result.token})).status,401);
  assert.equal((await app.request('/api/auth/login',{method:'POST',body:{email:'owner@example.com',password:'wrong-password'}})).status,401);
  assert.equal((await app.request('/api/auth/login',{method:'POST',body:{email:'owner@example.com',password}})).status,200);
});

test('anonymous, uploader and other user cannot list, fetch metadata or download; admin can',async t=>{
  const app=await fixture(t);
  const a=await app.register(), b=await app.register('other@example.com'), admin=await app.register('admin@example.com');
  app.store.users.get('admin@example.com').role='admin';
  assert.equal((await upload(app)).status,401);
  const response=await upload(app,a.token);
  assert.equal(response.status,201); const result=await response.json();
  assert.ok(!JSON.stringify(result).includes('object_key'));
  const path='/api/admin/submissions/'+result.submission.id;
  for(const token of [undefined,a.token,b.token]) {
    const denied=token?403:401;
    assert.equal((await app.request('/api/admin/submissions',{token})).status,denied);
    assert.equal((await app.request(path+'/download',{token})).status,denied);
    assert.equal((await app.request(path+'/review',{token,method:'POST'})).status,denied);
  }
  assert.equal((await app.request('/api/submissions',{token:a.token})).status,404);
  assert.equal((await app.request('/private/'+result.submission.id,{token:b.token})).status,404);
  const list=await app.request('/api/admin/submissions',{token:admin.token});
  assert.equal(list.status,200); assert.equal((await list.json()).submissions.length,1);
  const file=await app.request(path+'/download',{token:admin.token});
  assert.equal(file.status,200); assert.equal(await file.text(),'private note');
  assert.equal(file.headers.get('cache-control'),'no-store');
  assert.equal(file.headers.get('content-type'),'application/octet-stream');
  assert.match(file.headers.get('content-disposition'),/filename\*=UTF-8''%/);
  assert.equal(file.headers.get('x-content-type-options'),'nosniff');
  assert.equal((await app.request(path+'/review',{token:admin.token,method:'POST'})).status,200);
  assert.equal(app.store.records.get(result.submission.id).status,'reviewed');
  app.store.users.get('admin@example.com').role='user';
  assert.equal((await app.request(path+'/download',{token:admin.token})).status,403);
});

test('expired, malformed and disabled sessions fail closed; password change revokes every session',async t=>{
  const app=await fixture(t); const user=await app.register();
  const login=await app.request('/api/auth/login',{method:'POST',body:{email:user.user.email,password}});
  const second=await login.json();
  for(const token of ['fake','x'.repeat(64),user.token.slice(1)]) assert.equal((await app.request('/api/auth/me',{token})).status,401);
  app.store.users.get(user.user.email).disabled=true;
  assert.equal((await upload(app,user.token)).status,401);
  app.store.users.get(user.user.email).disabled=false;
  assert.equal((await app.request('/api/auth/password',{token:user.token,method:'POST',body:{current_password:'wrong-password',new_password:'replacement-password'}})).status,400);
  assert.equal((await app.request('/api/auth/password',{token:user.token,method:'POST',body:{current_password:password,new_password:'replacement-password'}})).status,200);
  for(const token of [user.token,second.token]) assert.equal((await app.request('/api/auth/me',{token})).status,401);
  assert.equal((await app.request('/api/auth/login',{method:'POST',body:{email:user.user.email,password}})).status,401);
  const newer=await app.request('/api/auth/login',{method:'POST',body:{email:user.user.email,password:'replacement-password'}});
  assert.equal(newer.status,200);
  const {token}=await newer.json(); app.clock.value+=13*3600000;
  assert.equal((await app.request('/api/auth/me',{token})).status,401);
});

test('missing configuration, database/storage outage and unsafe bucket never accept files',async t=>{
  for(const e of [{SUBMISSIONS_ENABLED:'false'},{AUTH_SECRET:'short'}]) {
    const app=await fixture(t,{env:e});
    assert.equal((await app.request('/api/health')).status,503);
    assert.equal((await app.request('/api/auth/register',{method:'POST',body:{email:'x@y.com',password}})).status,503);
  }
  const app=await fixture(t); app.store.health=async()=>{throw new Error('private bucket/database credential');};
  const res=await app.request('/api/health');
  assert.equal(res.status,503); assert.doesNotMatch(await res.text(),/credential/);
});

test('actual multipart byte limit, empty/forged files and invalid metadata are rejected',async t=>{
  const app=await fixture(t,{env:{MAX_UPLOAD_BYTES:'64'}}); const {token}=await app.register();
  for(const [body,status] of [[form('a.txt',''),400],[form('a.exe','abc'),415],[form('a.pdf','not PDF'),415],[form('a.txt','a'.repeat(65)),413],[form('a.txt','abc',{category:'<script>'}),400]]) {
    assert.equal((await upload(app,token,body)).status,status);
    app.clock.value+=60000;
  }
  const chunked=await new Promise((resolve,reject)=>{
    const req=http.request(app.base+'/api/submissions',{method:'POST',headers:{Origin:origin,Authorization:'Bearer '+token,'Content-Type':'multipart/form-data; boundary=test'}},res=>{res.resume();res.on('end',()=>resolve(res.statusCode));});
    req.on('error',reject); req.write('x'.repeat(40000)); req.end('x'.repeat(40000));
  });
  assert.equal(chunked,413);
  assert.equal(app.store.records.size,0); assert.equal(app.store.objects.size,0);
});

test('private quota and rate limits are enforced server-side',async t=>{
  const app=await fixture(t,{env:{MAX_USER_FILES:'1'}}); const {token}=await app.register();
  assert.equal((await upload(app,token)).status,201);
  assert.equal((await upload(app,token)).status,413);
  assert.equal(app.store.records.size,1);
  const limited=await fixture(t);
  const bad={email:'none@example.com',password:'invalid-password'};
  for(let i=0;i<10;i++) assert.equal((await limited.request('/api/auth/login',{method:'POST',body:bad})).status,401);
  const res=await limited.request('/api/auth/login',{method:'POST',body:bad});
  assert.equal(res.status,429); assert.equal(res.headers.get('retry-after'),'60');
  limited.clock.value+=15*60000;
  assert.equal((await limited.request('/api/auth/login',{method:'POST',body:bad})).status,401);
});

test('COS/DB failures roll back uploads, retain failed cleanup reservations, hide internal errors',async t=>{
  const app=await fixture(t); const {token}=await app.register();
  app.store.completeSubmission=async()=>{throw new Error('DB_PASSWORD=secret');};
  const res=await upload(app,token);
  assert.equal(res.status,503); assert.doesNotMatch(await res.text(),/DB_PASSWORD|secret/);
  assert.equal(app.store.objects.size,0); assert.equal(app.store.records.size,0);
  app.store.deleteObject=async()=>{throw new Error('COS failure');};
  assert.equal((await upload(app,token)).status,503);
  assert.equal(app.store.records.size,1); assert.equal([...app.store.records.values()][0].status,'uploading');
  app.store.users.get('user@example.com').role='admin';
  assert.equal((await (await app.request('/api/admin/submissions',{token})).json()).submissions.length,0);
});

test('CORS, missing Origin, preflight and response errors are safe',async t=>{
  const app=await fixture(t); const {token}=await app.register();
  const preflight=await app.request('/api/submissions',{method:'OPTIONS',headers:{'Access-Control-Request-Headers':'Authorization,Content-Type'}});
  assert.equal(preflight.status,204);
  assert.match(preflight.headers.get('access-control-allow-headers'),/Authorization/);
  for(const source of ['','https://evil.example']) {
    const res=await app.request('/api/auth/me',{token,headers:{Origin:source}});
    assert.equal(res.status,403);
  }
  assert.equal((await app.request('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:'{broken'})).status,400);
  assert.equal((await app.request('/api/auth/register',{method:'POST',body:{email:'bad',password:'short'}})).status,400);
});

test('admin lists paginate beyond 20 and reject invalid offsets',async t=>{
  const app=await fixture(t); const {token,user}=await app.register();
  app.store.users.get(user.email).role='admin';
  for(let i=0;i<21;i++) app.store.records.set(String(i),{id:String(i),user_id:user.id,status:'pending'});
  const page=await (await app.request('/api/admin/submissions',{token})).json();
  assert.equal(page.submissions.length,20); assert.equal(page.next_offset,20);
  const last=await (await app.request('/api/admin/submissions?offset=20',{token})).json();
  assert.equal(last.submissions.length,1); assert.equal(last.next_offset,null);
  assert.equal((await app.request('/api/admin/submissions?offset=-1',{token})).status,400);
});
