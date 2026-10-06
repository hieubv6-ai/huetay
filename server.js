const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { readDb, saveDb, usingFirestore, usingPostgres } = require('./db');

const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'data', 'content.json');
const PORT = Number(process.env.PORT || 4173);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me-now';
const sessions = new Map();
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};

function send(res,status,body,type='application/json'){ res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}); res.end(Buffer.isBuffer(body)||typeof body === 'string' ? body : JSON.stringify(body)); }
function body(req){ return new Promise((resolve,reject)=>{let raw='';req.on('data',c=>{raw+=c;if(raw.length>1e6) req.destroy();});req.on('end',()=>{try{resolve(raw?JSON.parse(raw):{})}catch(e){reject(e)}});req.on('error',reject)}) }
function auth(req){ const token=(req.headers.authorization||'').replace(/^Bearer\s+/,''); return token && sessions.has(token); }
function slug(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
function id(prefix){ return prefix+'-'+crypto.randomBytes(5).toString('hex'); }
function publicDb(db){ return {projects:db.projects,articles:db.articles,settings:db.settings}; }
async function api(req,res,url){
  if(req.method==='POST' && url.pathname==='/api/admin/login'){ const data=await body(req); if(data.password!==ADMIN_PASSWORD) return send(res,401,{error:'Mật khẩu quản trị không đúng'}); const token=crypto.randomBytes(24).toString('hex'); sessions.set(token,Date.now()); return send(res,200,{token}); }
  if(url.pathname==='/api/site' && req.method==='GET') return send(res,200,publicDb(await readDb()));
  if(!url.pathname.startsWith('/api/admin/')) return send(res,404,{error:'Not found'});
  if(!auth(req)) return send(res,401,{error:'Cần đăng nhập quản trị'});
  const db=await readDb();
  if(req.method==='GET' && url.pathname==='/api/admin/content') return send(res,200,db);
  if(req.method==='PUT' && url.pathname==='/api/admin/settings'){ db.settings={...db.settings,...await body(req)}; await saveDb(db); return send(res,200,db.settings); }
  if(req.method==='POST' && url.pathname==='/api/admin/projects'){ const d=await body(req); const p={id:id('project'),name:d.name||'Dự án mới',slug:d.slug||slug(d.name),location:d.location||'',status:d.status||'Đang cập nhật',cover:d.cover||'',summary:d.summary||'',description:d.description||'',featured:Boolean(d.featured),units:Array.isArray(d.units)?d.units:[]}; db.projects.unshift(p); await saveDb(db); return send(res,201,p); }
  const pm=url.pathname.match(/^\/api\/admin\/projects\/([^/]+)$/);
  if(pm){ const i=db.projects.findIndex(x=>x.id===pm[1]); if(i<0)return send(res,404,{error:'Không tìm thấy dự án'}); if(req.method==='PUT'){db.projects[i]={...db.projects[i],...(await body(req))};await saveDb(db);return send(res,200,db.projects[i])} if(req.method==='DELETE'){db.projects.splice(i,1);await saveDb(db);return send(res,200,{ok:true})} }
  const um=url.pathname.match(/^\/api\/admin\/projects\/([^/]+)\/units$/);
  if(um && req.method==='POST'){ const p=db.projects.find(x=>x.id===um[1]); if(!p)return send(res,404,{error:'Không tìm thấy dự án'}); const d=await body(req);const u={id:id('unit'),code:d.code||'',type:d.type||'Căn hộ',area:d.area||'',price:d.price||'Liên hệ',status:d.status||'Đang bán',note:d.note||''};p.units=p.units||[];p.units.unshift(u);await saveDb(db);return send(res,201,u); }
  if(req.method==='POST' && url.pathname==='/api/admin/articles'){ const d=await body(req);const a={id:id('article'),title:d.title||'Bài viết mới',slug:d.slug||slug(d.title),category:d.category||'Kinh nghiệm',excerpt:d.excerpt||'',content:d.content||'',publishedAt:d.publishedAt||new Date().toISOString().slice(0,10),status:d.status||'draft'};db.articles.unshift(a);await saveDb(db);return send(res,201,a); }
  const am=url.pathname.match(/^\/api\/admin\/articles\/([^/]+)$/);
  if(am){const i=db.articles.findIndex(x=>x.id===am[1]);if(i<0)return send(res,404,{error:'Không tìm thấy bài viết'});if(req.method==='PUT'){db.articles[i]={...db.articles[i],...(await body(req))};await saveDb(db);return send(res,200,db.articles[i])}if(req.method==='DELETE'){db.articles.splice(i,1);await saveDb(db);return send(res,200,{ok:true})}}
  return send(res,404,{error:'API không tồn tại'});
}
function serve(req,res){ const clean=decodeURIComponent(new URL(req.url,'http://localhost').pathname); const requested=clean==='/'?'/index.html':clean; const file=path.normalize(path.join(ROOT,requested)); if(!file.startsWith(ROOT)||!fs.existsSync(file)||fs.statSync(file).isDirectory()) return send(res,404,'Not found','text/plain; charset=utf-8'); send(res,200,fs.readFileSync(file),mime[path.extname(file).toLowerCase()]||'application/octet-stream'); }
const server=http.createServer(async(req,res)=>{const url=new URL(req.url,'http://localhost');try{if(url.pathname.startsWith('/api/')) await api(req,res,url); else serve(req,res)}catch(e){console.error(e);send(res,500,{error:'Lỗi máy chủ'})}});
server.listen(PORT,'0.0.0.0',()=>console.log(`Huệ Tây CMS listening on http://0.0.0.0:${PORT} (${usingFirestore ? 'Firebase Firestore' : usingPostgres ? 'PostgreSQL' : 'JSON offline fallback'})`));
