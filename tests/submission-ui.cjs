// Optional headless UI smoke test. Install playwright locally, or set PENGIEE_PLAYWRIGHT_PATH.
// Renders the real page components with Liquid URL substitutions; this is not a full Jekyll build.
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PENGIEE_PLAYWRIGHT_PATH || 'playwright');
const root = path.resolve(__dirname, '..');
const api = 'https://api.example.test';
async function main() {
  const server = http.createServer((req,res) => {
    const pathname = new URL(req.url,'http://localhost').pathname;
    if (/^\/assets\/[a-z-]+\.(css|js)$/.test(pathname)) {
      res.setHeader('Content-Type',pathname.endsWith('.js') ? 'text/javascript' : 'text/css');
      return res.end(fs.readFileSync(path.join(root,pathname)));
    }
    const file = {'/account/':'account.md','/submit/':'submit.md','/admin/':'admin.md'}[pathname];
    if (!file) { res.statusCode=404; return res.end(); }
    const html = fs.readFileSync(path.join(root,file),'utf8').replace(/^---[\s\S]*?---/,'')
      .replace(/\{\{\s*'([^']+)'\s*\|\s*relative_url\s*\}\}/g,'$1');
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.end('<!doctype html><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="/assets/site.css"><body data-submission-endpoint="'+api+'"><main style="max-width:880px;margin:24px auto;padding:16px">'+html+'</main>');
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true,...(process.env.PENGIEE_BROWSER_CHANNEL ? {channel:process.env.PENGIEE_BROWSER_CHANNEL} : {})});
  try {
    const page=await browser.newPage({viewport:{width:1100,height:950}});
    const errors=[]; page.on('pageerror',error=>errors.push(error.message));
    let user=null, uploads=0, revoked=0, downloads=0;
    const records=[{id:'12345678-1234-1234-1234-123456789abc',title:'<img src=x onerror=alert(1)>',
      email:'user@example.com',category:'硬件基础与电源',level:'基础',file_size:12,file_name:'资料.txt',
      description:'私人内容',source:'本人原创',created_at:new Date().toISOString(),status:'pending'}];
    await page.route(api+'/**',async route=>{
      const request=route.request(),url=new URL(request.url());
      let status=200, data={};
      if (url.pathname==='/api/health') data={status:'ready',max_upload_bytes:4194304};
      else if (url.pathname==='/api/auth/register') { user={id:'user',email:'user@example.com',role:'user'}; data={token:'a'.repeat(64),user}; }
      else if (url.pathname==='/api/auth/me') {status=user?200:401;data=user?{user}:{error:{message:'请登录'}};}
      else if (url.pathname==='/api/auth/logout') {user=null;revoked++;data={ok:true};}
      else if (url.pathname==='/api/auth/login') {user={id:'admin',email:'admin@example.com',role:'admin'};data={token:'b'.repeat(64),user};}
      else if (url.pathname==='/api/submissions') {uploads++;data={submission:{id:'receipt-123'}};status=201;}
      else if (url.pathname==='/api/admin/submissions') data={submissions:records,next_offset:null};
      else if (url.pathname.endsWith('/download')) { downloads++; return route.fulfill({status:200,body:'private',contentType:'application/octet-stream'}); }
      else data={ok:true};
      await route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
    });
    const base='http://127.0.0.1:'+server.address().port;
    await page.goto(base+'/submit/');
    await page.waitForFunction(()=>!document.querySelector('[data-login-form] button').disabled);
    assert.equal(await page.locator('[data-submit-form]').isVisible(),false);
    await page.click('[data-show-register]');
    await page.fill('[data-register-form] [name=email]','user@example.com');
    await page.fill('[data-register-form] [name=password]','test-password-123');
    await page.fill('[data-register-form] [name=passwordConfirm]','not-the-same-password');
    await page.click('[data-register-form] button[type=submit]');
    assert.match(await page.locator('[data-register-form] [data-auth-status]').textContent(),/不一致/);
    await page.fill('[data-register-form] [name=passwordConfirm]','test-password-123');
    await page.click('[data-register-form] button[type=submit]');
    await page.waitForSelector('[data-submit-form]',{state:'visible'});
    assert.equal(await page.locator('[data-admin-link]').isVisible(),false);
    await page.fill('[name=title]','电容资料');
    await page.selectOption('[name=category]',{label:'硬件基础与电源'});
    await page.selectOption('[name=level]',{label:'基础'});
    await page.fill('[name=description]','测试资料');
    await page.fill('[name=source]','本人原创');
    await page.setInputFiles('[name=file]',{name:'资料.txt',mimeType:'text/plain',buffer:Buffer.from('private note')});
    await page.click('[data-submit-form] button[type=submit]');
    await page.waitForFunction(()=>document.querySelector('[data-submit-status]').textContent.includes('receipt-123'));
    assert.equal(uploads,1);
    await page.click('[data-logout]');
    await page.waitForSelector('[data-login-form]',{state:'visible'});
    assert.equal(revoked,1); assert.equal(await page.locator('[data-submit-form]').isVisible(),false);
    await page.fill('[data-login-form] [name=email]','admin@example.com');
    await page.fill('[data-login-form] [name=password]','test-password-123');
    await page.click('[data-login-form] button[type=submit]');
    await page.waitForSelector('[data-admin-link]',{state:'visible'});
    await page.click('[data-admin-link]');
    await page.waitForSelector('.admin-item');
    assert.equal(await page.locator('.admin-item img').count(),0);
    assert.match(await page.locator('.admin-item strong').textContent(),/<img/);
    await page.locator('.admin-item button').first().click();
    await page.waitForTimeout(100);
    assert.equal(downloads,1);
    await page.goto(base+'/account/');
    await page.waitForSelector('[data-password-form]',{state:'visible'});
    await page.setViewportSize({width:390,height:844});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
    await page.screenshot({path:path.join(root,'tmp','account-mobile.png'),fullPage:true});
    assert.deepEqual(errors,[]);
    // Unconfigured/unreachable services must not expose an enabled signup/upload form.
    await page.unroute(api+'/**');
    await page.route(api+'/**',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:{message:'服务未配置'}})}));
    await page.goto(base+'/submit/');
    await page.waitForFunction(()=>document.querySelector('[data-service-status]').textContent.includes('未配置'));
    assert.equal(await page.locator('[data-login-form] button[type=submit]').isDisabled(),true);
    assert.equal(await page.locator('[data-submit-form]').isVisible(),false);
    console.log('UI smoke passed: register, password mismatch, login, upload, logout, admin access/download, escaping, mobile layout and unconfigured state.');
  } finally {
    await browser.close();
    server.closeAllConnections();
    await new Promise(resolve=>server.close(resolve));
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
