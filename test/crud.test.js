import {test} from 'node:test';import assert from 'node:assert/strict';
process.env.DEMO_MODE='true';
const {default:handler}=await import('../api/mahasiswa.js');
const valid={nim:'2026999999',nama:'Mahasiswa Uji',email:'uji@example.com',jurusan:'Informatika',angkatan:2026};
async function call(method,body={},id){let status=200,payload;await handler({method,body,query:{id},headers:{}},{setHeader(){},status(s){status=s;return this;},json(data){payload=data;}});return {status,...payload};}
test('CRUD: create, duplicate, read, update, delete, not found',async()=>{
 const created=await call('POST',valid);assert.equal(created.status,201);const id=created.data.id;
 try{assert.equal((await call('POST',valid)).status,409);assert.ok((await call('GET')).data.some(x=>x.id===id));assert.equal((await call('PUT',{...valid,nama:'Nama Baru'},id)).data.nama,'Nama Baru');}finally{assert.equal((await call('DELETE',{},id)).status,200);}
 assert.equal((await call('DELETE',{},id)).status,404);
});
test('validation rejects malformed input and id',async()=>{assert.equal((await call('POST',{...valid,nim:'abc'})).status,400);assert.equal((await call('DELETE',{},'bad-id')).status,400);});
test('production requires admin password',async()=>{process.env.DEMO_MODE='false';process.env.ADMIN_PASSWORD='test-password-only';assert.equal((await call('GET')).status,401);process.env.DEMO_MODE='true';});
