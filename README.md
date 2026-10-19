# Kampus — CRUD Mahasiswa

Aplikasi tugas CRUD: tambah, daftar, cari, filter, ubah, dan hapus mahasiswa. Frontend HTML/CSS/JavaScript; backend Node.js REST API; database PostgreSQL Aiven; deployment frontend dan API di Vercel. Aiven menjadi layanan database, bukan hosting kode API.

## Jalankan lokal

Gunakan Node.js 22.13+ atau 24.

```sh
npm install
cp .env.example .env
npm start
```

Buka http://localhost:3000. Mode demo menyimpan data dalam SQLite lokal (`demo.sqlite`), bukan data sementara di browser. Database demo tidak dikirim ke GitHub. Untuk menguji API: `npm test` (memakai SQLite lokal dan membersihkan record uji).

## Aiven PostgreSQL

1. Buat service PostgreSQL di akun Aiven, pilih paket yang kamu setujui dan tunggu service aktif.
2. Salin Service URI dan unduh CA certificate dari halaman service.
3. Di `.env`, ubah `DEMO_MODE=false`, isi `DATABASE_URL`, `DATABASE_CA` (isi ca.pem, bisa satu baris dengan literal `\n`), dan `ADMIN_PASSWORD` dengan kata sandi panjang unik.
4. Jalankan `npm run db:init` untuk membuat tabel. Kemudian `npm start`.
5. Klik Akses admin dan masukkan ADMIN_PASSWORD. Kata sandi hanya ditahan di memori tab; refresh meminta login lagi.

Koneksi memakai TLS dengan verifikasi sertifikat. Jangan commit `.env`, ca.pem, token, atau kata sandi. Aplikasi mengembalikan pesan kesalahan umum agar konfigurasi rahasia tidak bocor. Ini aplikasi tugas dengan akses admin tunggal, belum sistem multiuser.

## Push GitHub

Buat repository kosong `crud-mahasiswa` pada akunmu, lalu dari folder ini:

```sh
git init -b main
git add .
git commit -m "Build student CRUD app"
git remote add origin https://github.com/USERNAME/crud-mahasiswa.git
git push -u origin main
```

Ganti USERNAME sesuai akun GitHub. Jangan masukkan token ke URL remote.

## Deploy Vercel

1. Import repository GitHub di Vercel.
2. Pilih framework **Other**, root folder proyek ini, output directory `public`, install command `npm install`, tanpa build command.
3. Tambahkan Environment Variables `DATABASE_URL`, `DATABASE_CA`, `ADMIN_PASSWORD` untuk environment Production. Jangan aktifkan DEMO_MODE.
4. Pastikan `npm run db:init` sudah berhasil terhadap database Aiven tersebut.
5. Deploy. Folder `api` otomatis menjadi Vercel Functions; frontend menggunakan `/api/mahasiswa` pada domain yang sama.
6. Masuk sebagai admin lalu uji tambah → muat ulang → ubah → hapus untuk memastikan persistensi Aiven. Git push berikutnya memicu deployment Vercel bila integrasi Git sudah aktif.

## API

Semua endpoint memerlukan header `Authorization: Bearer ADMIN_PASSWORD` kecuali mode demo lokal.

| Metode | URL | Fungsi |
|---|---|---|
| GET | /api/mahasiswa | Daftar mahasiswa |
| POST | /api/mahasiswa | Tambah mahasiswa |
| PUT | /api/mahasiswa?id=UUID | Ubah mahasiswa |
| DELETE | /api/mahasiswa?id=UUID | Hapus mahasiswa |

Body POST/PUT: `nim`, `nama`, `email`, `jurusan`, `angkatan`. NIM unik; query SQL memakai parameter.
