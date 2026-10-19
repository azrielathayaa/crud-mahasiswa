import http from 'node:http';
import {readFile} from 'node:fs/promises';
import handler from './api/mahasiswa.js';
const assets={'/':['index.html','text/html'],'/app.js':['app.js','text/javascript'],'/style.css':['style.css','text/css']};
http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/api/mahasiswa') {
  let body='';
  for await(const chunk of req){body+=chunk;if(body.length>16384){res.writeHead(413).end();return;}}
  try{req.body=body?JSON.parse(body):{};}catch{res.writeHead(400,{'Content-Type':'application/json'}).end(JSON.stringify({error:'JSON tidak valid.'}));return;}
  req.query=Object.fromEntries(url.searchParams);
  res.status=code=>{res.statusCode=code;return res;};res.json=data=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};
  await handler(req,res);return;
 }
 const asset=assets[url.pathname];
 if(!asset){res.writeHead(404).end('Tidak ditemukan');return;}
 res.setHeader('Content-Type',asset[1]);res.end(await readFile(new URL('./public/'+asset[0],import.meta.url)));
}).listen(process.env.PORT||3000,()=>console.log('Buka http://localhost:'+(process.env.PORT||3000)));
