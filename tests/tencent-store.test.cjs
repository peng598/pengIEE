const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createStore } = require('../serverless/tencent-scf/submission-store');
const env = { COS_BUCKET:'test-123456', COS_REGION:'ap-guangzhou', TENCENTCLOUD_SECRETID:'role-id',
  TENCENTCLOUD_SECRETKEY:'role-secret',TENCENTCLOUD_SESSIONTOKEN:'role-token' };
function mock() {
  const calls=[];
  let acl={Grants:[]}, policy={Statement:[]};
  const connection={
    beginTransaction:async()=>calls.push('begin'),
    commit:async()=>calls.push('commit'),
    rollback:async()=>calls.push('rollback'),
    release:()=>calls.push('release'),
    execute:async(sql,args)=>{
      calls.push({sql,args});
      if(sql.includes('COUNT(*)')) return [[{count:0,bytes:0}]];
      if(sql.startsWith('SELECT password_hash')) return [[{password_hash:'hash',disabled:false}]];
      return [[]];
    }
  };
  const pool={execute:async(sql,args)=>{calls.push({sql,args}); return [{affectedRows:1}];},end:async()=>{},getConnection:async()=>connection};
  let options;
  class COS {
    constructor(o){ options=o; }
    static getAuthorization(value){calls.push({sign:value});return 'signature';}
    async getBucketAcl(){return acl;}
    async getBucketPolicy(){if(policy instanceof Error) throw policy;return {Policy:policy};}
    async putObject(value){calls.push({put:value});}
    async getObject(){return {Body:Buffer.from('data')};}
    async deleteObject(value){calls.push({delete:value});}
  }
  const store=createStore({...env},{mysql:{createPool:()=>pool},COS});
  return {store,calls,connection,options,setAcl:v=>{acl=v;},setPolicy:v=>{policy=v;}};
}
test('private COS bucket ACL and bucket policies fail closed; missing policy is allowed',async()=>{
  const app=mock();
  await app.store.health();
  app.setAcl({Grants:[{Grantee:{URI:'http://cam.qcloud.com/groups/global/AllUsers'},Permission:'READ'}]});
  await assert.rejects(()=>app.store.health());
  app.setAcl({Grants:[]});
  app.setPolicy({Statement:[{Effect:'Allow',Principal:'*',Action:'cos:GetObject'}]});
  await assert.rejects(()=>app.store.health());
  const missing=new Error();missing.code='NoSuchBucketPolicy';app.setPolicy(missing);
  await app.store.health();
  app.setPolicy(new Error('unknown failure'));
  await assert.rejects(()=>app.store.health());
});
test('COS signing uses role credentials only; every object explicitly private and opaque',async()=>{
  const app=mock(); let auth;
  app.options.getAuthorization({Method:'PUT',Pathname:'/private/id',Query:{},Headers:{}},value=>{auth=value;});
  assert.equal(auth.Authorization,'signature');assert.equal(auth.SecurityToken,'role-token');
  assert.equal(app.calls.find(x=>x.sign).sign.SecretKey,'role-secret');
  await app.store.putObject('private/id',Buffer.from('data'));
  const put=app.calls.find(x=>x.put).put;
  assert.equal(put.ACL,'private');assert.equal(put.ContentType,'application/octet-stream');
  assert.equal(put.Key,'private/id');assert.equal((await app.store.getObject('private/id')).toString(),'data');
});
test('quota reservation locks owner and parameterizes untrusted metadata in transaction',async()=>{
  const app=mock();
  const row={id:'id',user_id:'user',title:"' OR 1=1",category:'category',level:'level',description:'description',source:'source',object_key:'key',file_name:'file.txt',file_size:10};
  await app.store.reserveSubmission(row,100,2);
  assert.equal(app.calls[0],'begin');
  assert.match(app.calls[1].sql,/FOR UPDATE/);
  const insert=app.calls.find(x=>x.sql?.startsWith('INSERT'));
  assert.ok(!insert.sql.includes(row.title));assert.ok(insert.args.includes(row.title));
  assert.deepEqual(app.calls.slice(-2),['commit','release']);
});
test('quota rejection rolls back; session creation and password change serialize against user',async()=>{
  const app=mock();
  await assert.rejects(()=>app.store.reserveSubmission({user_id:'user',file_size:100},10,2),{code:'QUOTA'});
  assert.deepEqual(app.calls.slice(-2),['rollback','release']);
  await app.store.addSession('token-hash','user',1000,'hash');
  const session=app.calls.find(x=>x.sql?.startsWith('INSERT INTO sessions'));
  assert.deepEqual(session.args,['token-hash','user',1000]);
  await assert.rejects(()=>app.store.addSession('token-hash','user',1000,'old-hash'));
  await app.store.changePassword('user','new-hash','hash');
  assert.ok(app.calls.some(x=>x.sql==='DELETE FROM sessions WHERE user_id=?'));
});
