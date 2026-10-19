export function validate(input) {
  const data = Object.fromEntries(['nim','nama','email','jurusan','angkatan'].map(k=>[k,String(input?.[k]??'').trim()]));
  if (!/^\d{6,20}$/.test(data.nim)) throw new Error('NIM harus terdiri dari 6–20 angka.');
  if(data.nama.length<2||data.nama.length>100) throw new Error('Nama harus 2–100 karakter.');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)||data.email.length>150) throw new Error('Email tidak valid.');
  if(data.jurusan.length<2||data.jurusan.length>100) throw new Error('Jurusan harus 2–100 karakter.');
  const year=Number(data.angkatan);
  if(!Number.isInteger(year)||year<2000||year>new Date().getFullYear()+1) throw new Error('Tahun angkatan tidak valid.');
  return {...data,angkatan:year};
}
