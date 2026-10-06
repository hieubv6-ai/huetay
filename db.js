const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const DATA_FILE = path.join(__dirname, 'data', 'content.json');

function readFileDb(){ return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
function writeFileDb(db){ fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2) + '\n'); }

function firebaseCredential(){
  if(process.env.FIREBASE_SERVICE_ACCOUNT_JSON){
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }
  if(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY){
    return {projectId:process.env.FIREBASE_PROJECT_ID, clientEmail:process.env.FIREBASE_CLIENT_EMAIL, privateKey:process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g,'\n')};
  }
  return null;
}
let firestore = null;
if(firebaseCredential()){
  const { initializeApp, cert, getApps } = require('firebase-admin/app');
  const { getFirestore } = require('firebase-admin/firestore');
  const app = getApps().length ? getApps()[0] : initializeApp({credential:cert(firebaseCredential())});
  firestore = getFirestore(app);
}
const pool = !firestore && process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }, max: 5 }) : null;

async function readFirestore(){
  const [projectsSnap, articlesSnap, settingsSnap] = await Promise.all([
    firestore.collection('projects').get(),
    firestore.collection('articles').get(),
    firestore.collection('site_settings').doc('public').get()
  ]);
  const projects = await Promise.all(projectsSnap.docs.map(async doc=>{
    const p={id:doc.id,...doc.data()};
    const unitsSnap=await firestore.collection('projects').doc(doc.id).collection('units').get();
    p.units=unitsSnap.docs.map(u=>({id:u.id,...u.data()}));
    return p;
  }));
  const articles=articlesSnap.docs.map(doc=>({id:doc.id,...doc.data()}));
  return {projects, articles, settings:settingsSnap.exists ? (settingsSnap.data().value||{}) : {}};
}
async function saveFirestore(db){
  const batch=firestore.batch();
  const oldProjects=await firestore.collection('projects').get();
  const projectIds=new Set(db.projects.map(p=>p.id));
  oldProjects.docs.filter(d=>!projectIds.has(d.id)).forEach(d=>batch.delete(d.ref));
  for(const p of db.projects){
    const ref=firestore.collection('projects').doc(p.id);
    const {units=[],...project}=p;
    batch.set(ref,project,{merge:true});
    const oldUnits=await ref.collection('units').get();
    const unitIds=new Set(units.map(u=>u.id));
    oldUnits.docs.filter(d=>!unitIds.has(d.id)).forEach(d=>batch.delete(d.ref));
    units.forEach(u=>{const {id,...data}=u;batch.set(ref.collection('units').doc(id),data,{merge:true})});
  }
  const oldArticles=await firestore.collection('articles').get();
  const articleIds=new Set(db.articles.map(a=>a.id));
  oldArticles.docs.filter(d=>!articleIds.has(d.id)).forEach(d=>batch.delete(d.ref));
  db.articles.forEach(a=>{const {id,...data}=a;batch.set(firestore.collection('articles').doc(id),data,{merge:true})});
  batch.set(firestore.collection('site_settings').doc('public'),{value:db.settings||{}},{merge:true});
  await batch.commit();
}
async function readPostgres(){
  const [projects, units, articles, settings] = await Promise.all([
    pool.query('select id,name,slug,location,status,cover,summary,description,featured from projects order by featured desc, created_at desc'),
    pool.query('select id,project_id,code,type,area,price,status,note from units order by created_at desc'),
    pool.query("select id,title,slug,category,excerpt,content,to_char(published_at,'YYYY-MM-DD') as \"publishedAt\",status from articles order by published_at desc, created_at desc"),
    pool.query("select value from site_settings where key='public' limit 1")
  ]);
  const byProject = new Map();
  units.rows.forEach(u=>{if(!byProject.has(u.project_id))byProject.set(u.project_id,[]);byProject.get(u.project_id).push({id:u.id,code:u.code,type:u.type,area:u.area,price:u.price,status:u.status,note:u.note})});
  return {projects:projects.rows.map(p=>({...p,featured:Boolean(p.featured),units:byProject.get(p.id)||[]})),articles:articles.rows,settings:settings.rows[0]?.value||{}};
}
async function savePostgres(db){
  const client=await pool.connect();
  try{await client.query('begin');
    for(const p of db.projects){await client.query(`insert into projects(id,name,slug,location,status,cover,summary,description,featured) values($1,$2,$3,$4,$5,$6,$7,$8,$9) on conflict(id) do update set name=excluded.name,slug=excluded.slug,location=excluded.location,status=excluded.status,cover=excluded.cover,summary=excluded.summary,description=excluded.description,featured=excluded.featured,updated_at=now()`,[p.id,p.name,p.slug,p.location,p.status,p.cover,p.summary,p.description,Boolean(p.featured)]);for(const u of(p.units||[]))await client.query(`insert into units(id,project_id,code,type,area,price,status,note) values($1,$2,$3,$4,$5,$6,$7,$8) on conflict(id) do update set code=excluded.code,type=excluded.type,area=excluded.area,price=excluded.price,status=excluded.status,note=excluded.note`,[u.id,p.id,u.code,u.type,u.area,u.price,u.status,u.note||''])}
    await client.query('delete from projects where id <> all($1::text[])',[db.projects.map(p=>p.id)]);const allUnits=db.projects.flatMap(p=>(p.units||[]).map(u=>u.id));if(allUnits.length)await client.query('delete from units where id <> all($1::text[])',[allUnits]);
    for(const a of db.articles)await client.query(`insert into articles(id,title,slug,category,excerpt,content,published_at,status) values($1,$2,$3,$4,$5,$6,$7,$8) on conflict(id) do update set title=excluded.title,slug=excluded.slug,category=excluded.category,excerpt=excluded.excerpt,content=excluded.content,published_at=excluded.published_at,status=excluded.status,updated_at=now()`,[a.id,a.title,a.slug,a.category,a.excerpt,a.content||'',a.publishedAt||new Date().toISOString().slice(0,10),a.status]);
    await client.query('delete from articles where id <> all($1::text[])',[db.articles.map(a=>a.id)]);await client.query(`insert into site_settings(key,value) values('public',$1::jsonb) on conflict(key) do update set value=excluded.value,updated_at=now()`,[JSON.stringify(db.settings||{})]);await client.query('commit');
  }catch(e){await client.query('rollback');throw e}finally{client.release()}
}
async function readDb(){if(firestore)return readFirestore();if(pool)return readPostgres();return readFileDb()}
async function saveDb(db){if(firestore)return saveFirestore(db);if(pool)return savePostgres(db);return writeFileDb(db)}
async function seed(){const db=readFileDb();if(firestore){await saveFirestore(db)}else if(pool){await savePostgres(db)}else throw new Error('Set Firebase credentials or DATABASE_URL before seeding');console.log(`Seeded ${db.projects.length} projects and ${db.articles.length} articles`)}
module.exports={readDb,saveDb,seed,usingFirestore:Boolean(firestore),usingPostgres:Boolean(pool)};
