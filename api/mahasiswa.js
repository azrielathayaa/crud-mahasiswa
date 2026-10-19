import {randomUUID,timingSafeEqual} from 'node:crypto';
import {database} from '../lib/db.js';
import {validate} from '../lib/validation.js';
export default async function handler(req,res) {
 res.setHeader('Cache-Control','no-store');
 const send=(code,data)=>res.status(code).json(data);
 const demo=process.env.DEMO_MODE==='true'&&!process.env.VERCEL;
 if(!demo) {
   if(!process.env.ADMIN_PASSWORD) return send(503,{error:'Kata sandi admin belum dikonfigurasi.'});
   const token=String(req.headers.authorization||'').replace(/^Bearer /,'');
   const a=Buffer.from(token),b=Buffer.from(process.env.ADMIN_PASSWORD);
   if(a.length!==b.length||!timingSafeEqual(a,b)) return send(401,{error:'Kata sandi admin salah.'});
 }
 if(!['GET','POST','PUT','DELETE'].includes(req.method)) {res.setHeader('Allow','GET, POST, PUT, DELETE');return send(405,{error:'Metode tidak didukung.'});}
 const id=req.query?.id;
 if(['PUT','DELETE'].includes(req.method)&&!(/^[0-9a-f-]{36}$/i.test(id||''))) return send(400,{error:'ID tidak valid.'});
 let data;
 if(['POST','PUT'].includes(req.method)) {
  try {data=validate(req.body);}catch(e){return send(400,{error:e.message});}
 }
 try {
   const db=await database();
   if(req.method==='GET') return send(200,{data:(await db.query('SELECT * FROM mahasiswa ORDER BY created_at DESC')).rows});
   if(req.method==='POST') {
    const row=await db.query('INSERT INTO mahasiswa (id,nim,nama,email,jurusan,angkatan,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',[randomUUID(),data.nim,data.nama,data.email,data.jurusan,data.angkatan,new Date().toISOString()]);
    return send(201,{data:row.rows[0]});
   }
   const result=req.method==='PUT'
    ?await db.query('UPDATE mahasiswa SET nim=$1,nama=$2,email=$3,jurusan=$4,angkatan=$5 WHERE id=$6 RETURNING *',[data.nim,data.nama,data.email,data.jurusan,data.angkatan,id])
    :await db.query('DELETE FROM mahasiswa WHERE id=$1 RETURNING id',[id]);
   if(!result.rows.length) return send(404,{error:'Data tidak ditemukan.'});
   return send(200,{data:result.rows[0]});
 }catch(e){
   if(e.code==='23505'||/UNIQUE constraint/.test(e.message)) return send(409,{error:'NIM sudah terdaftar.'});
   console.error('Database request failed:',e.code||'CONFIG_OR_CONNECTION');
   return send(503,{error:'Database belum siap. Periksa konfigurasi dan jalankan npm run db:init.'});
 }
}
