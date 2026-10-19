const $=s=>document.querySelector(s);
let students=[],editing=null,deleting=null,password='';
function notice(message){$('#notice').textContent=message;$('#notice').hidden=!message;}
async function api(method='GET',body,id){
 const response=await fetch('/api/mahasiswa'+(id?'?id='+encodeURIComponent(id):''),{method,headers:{'Content-Type':'application/json',Authorization:'Bearer '+password},...(body?{body:JSON.stringify(body)}:{})});
 const result=await response.json();
 if(!response.ok){if(response.status===401)$('#auth').showModal();throw new Error(result.error||'Permintaan gagal.');}
 return result.data;
}
async function load(){
 $('#refresh').disabled=true;
 try{students=await api();notice('');render();}catch(e){notice(e.message);$('#count').textContent='Data belum dimuat';$('#rows').replaceChildren();const row=$('#rows').insertRow();const cell=row.insertCell();cell.colSpan=5;cell.className='empty';cell.textContent='Belum dapat memuat data. Periksa akses admin atau koneksi database.';}
 finally{$('#refresh').disabled=false;}
}
function node(tag,text,className){const el=document.createElement(tag);el.textContent=text;if(className)el.className=className;return el;}
function render(){
 $('#total').textContent=students.length;const departments=[...new Set(students.map(s=>s.jurusan))].sort();$('#programs').textContent=departments.length;$('#latest').textContent=students.length?Math.max(...students.map(s=>s.angkatan)):'—';
 const selected=$('#department').value;$('#department').replaceChildren(new Option('Semua jurusan',''),...departments.map(d=>new Option(d,d)));$('#department').value=selected;
 const search=$('#search').value.toLowerCase();const filtered=students.filter(s=>(s.nama+' '+s.nim+' '+s.email).toLowerCase().includes(search)&&(!selected||s.jurusan===selected));$('#rows').replaceChildren();
 for(const s of filtered){const row=$('#rows').insertRow();const info=node('div','','person');info.append(node('span',s.nama.split(' ').map(x=>x[0]).slice(0,2).join(''),'avatar'));const name=node('div',s.nama);name.append(node('small',s.email));info.append(name);row.insertCell().append(info);row.insertCell().textContent=s.nim;row.insertCell().textContent=s.jurusan;row.insertCell().append(node('span',s.angkatan,'badge'));const actions=row.insertCell();const edit=node('button','Ubah','row-action');edit.onclick=()=>openEditor(s);const remove=node('button','Hapus','row-action delete');remove.onclick=()=>{deleting=s.id;$('#delete-text').textContent=s.nama+' · '+s.nim;$('#delete-dialog').showModal();};actions.append(edit,remove);}
 if(!filtered.length){const cell=$('#rows').insertRow().insertCell();cell.colSpan=5;cell.className='empty';cell.textContent=students.length?'Tidak ada mahasiswa yang sesuai pencarian.':'Belum ada mahasiswa. Tambahkan data pertama kamu.';}
 $('#count').textContent=`Menampilkan ${filtered.length} dari ${students.length} mahasiswa`;
}
function openEditor(student){editing=student?.id||null;$('#form').reset();$('#form-error').textContent='';$('#form-title').textContent=editing?'Ubah mahasiswa':'Tambah mahasiswa';$('#form').elements.angkatan.max=new Date().getFullYear()+1;if(student)for(const key of ['nama','nim','email','jurusan','angkatan'])$('#form').elements[key].value=student[key];$('#editor').showModal();}
$('#add').onclick=()=>openEditor();$('.close').onclick=()=>$('#editor').close();document.querySelectorAll('#editor .close').forEach(b=>b.onclick=()=>$('#editor').close());
$('#form').onsubmit=async e=>{e.preventDefault();$('#save').disabled=true;try{await api(editing?'PUT':'POST',Object.fromEntries(new FormData(e.target)),editing);$('#editor').close();await load();}catch(err){$('#form-error').textContent=err.message;}finally{$('#save').disabled=false;}};
$('#confirm-delete').onclick=async()=>{$('#confirm-delete').disabled=true;try{await api('DELETE',null,deleting);$('#delete-dialog').close();await load();}catch(e){$('#delete-dialog').close();notice(e.message);}finally{$('#confirm-delete').disabled=false;}};
$('#cancel-delete').onclick=()=>$('#delete-dialog').close();$('#search').oninput=render;$('#department').onchange=render;$('#refresh').onclick=load;$('#login').onclick=()=>$('#auth').showModal();$('#auth-close').onclick=()=>$('#auth').close();$('#auth-form').onsubmit=e=>{e.preventDefault();password=e.target.elements.password.value;e.target.reset();$('#auth').close();load();};load();
