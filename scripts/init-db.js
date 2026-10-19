import {database,initialize} from '../lib/db.js';
const db=await database();
try {await initialize(db);console.log('Tabel mahasiswa siap.');}finally {await db.end?.();}
