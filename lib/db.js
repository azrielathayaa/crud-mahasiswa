let pool;
export async function database() {
  if(pool) return pool;
  if(process.env.DEMO_MODE==='true' && !process.env.VERCEL) {
    const {DatabaseSync}=await import('node:sqlite');
    const db=new DatabaseSync('demo.sqlite');
    pool={async query(sql,params=[]) {
      sql=sql.replace(/\$\d+/g,'?');
      if(/^CREATE/i.test(sql.trim())) {db.exec(sql);return {rows:[]};}
      return {rows:db.prepare(sql).all(...params)};
    }};
    await initialize(pool);return pool;
  }
  if(!process.env.DATABASE_URL||!process.env.DATABASE_CA) throw new Error('Database belum dikonfigurasi.');
  const {Pool}=await import('pg');
  const url=new URL(process.env.DATABASE_URL);
  ['sslmode','sslcert','sslkey','sslrootcert'].forEach(k=>url.searchParams.delete(k));
  pool=new Pool({connectionString:url.toString(),max:3,connectionTimeoutMillis:8000,idleTimeoutMillis:10000,ssl:{rejectUnauthorized:true,ca:process.env.DATABASE_CA.replace(/\\n/g,'\n')}});
  pool.on('error',()=>console.error('Koneksi database terputus.'));
  return pool;
}
export async function initialize(db) {
  await db.query(`CREATE TABLE IF NOT EXISTS mahasiswa (
    id TEXT PRIMARY KEY, nim TEXT NOT NULL UNIQUE, nama TEXT NOT NULL,
    email TEXT NOT NULL, jurusan TEXT NOT NULL, angkatan INTEGER NOT NULL,
    created_at TEXT NOT NULL
  )`);
}
