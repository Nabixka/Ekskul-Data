<h1 align="center">Ekskul Data</h1>

<p align="center">
  Aplikasi untuk mengelola ekstrakurikuler, anggota, kegiatan, dokumentasi, dan kas dalam satu tempat.
</p>

## Description

Ekskul Data adalah aplikasi web dengan frontend Vue 3 dan backend NestJS. Backend menyediakan REST API dengan autentikasi JWT dan PostgreSQL sebagai database.

Fitur utama:

- Daftar dan detail ekstrakurikuler beserta keanggotaan.
- Pengelolaan agenda kegiatan dan dokumentasi gambar.
- Informasi kas ekstrakurikuler.
- Pengelolaan ekstrakurikuler melalui dashboard admin.

## Tech stack

- [NestJS](https://nestjs.com/) dan TypeScript — REST API.
- [Vue 3](https://vuejs.org/) dan [Vite](https://vite.dev/) — aplikasi web.
- [PostgreSQL](https://www.postgresql.org/) — database.
- [Knex.js](https://knexjs.org/) — migrasi, seeder, dan query database.
- [Tailwind CSS](https://tailwindcss.com/) — styling.

## Project setup

Pastikan [Node.js](https://nodejs.org/) dan PostgreSQL sudah terpasang dan database sudah dibuat.

Install dependency backend:

```bash
cd service
npm install
```

Install dependency frontend di terminal terpisah:

```bash
cd application
npm install
```

## Configuration

Buat file `service/.env` berdasarkan `service/.env.example`, lalu isi konfigurasi database dan tambahkan `JWT_SECRET`:

```env
DB_NAME=nama_database
DB_HOST=localhost
DB_PORT=5432
DB_PASS=password_database
DB_USER=postgres
PORT=3000
JWT_SECRET=ganti_dengan_secret_yang_aman
```

Buat file `application/.env` untuk alamat backend:

```env
VITE_API_URL=http://localhost:3000
```

Jangan commit file `.env` atau nilai secret ke repository.

Backend perlu memuat variabel dari `.env` saat dijalankan. Perintah di bagian berikutnya menggunakan `dotenv` untuk memuat `service/.env`.

## Database setup

Jalankan migrasi dari direktori `service`:

```bash
npx knex migrate:latest --knexfile knexfile.js
```

Untuk mengisi database dengan data awal:

```bash
npx knex seed:run --knexfile knexfile.js
```

## Compile and run the project

Jalankan backend dalam mode development dari direktori `service`:

```bash
node -r dotenv/config ./node_modules/@nestjs/cli/bin/nest.js start --watch
```

Jalankan frontend dalam terminal terpisah dari direktori `application`:

```bash
npm run dev
```

Vite akan menampilkan alamat lokal frontend di terminal (umumnya `http://localhost:5173`). Backend menggunakan port `3000` secara default, atau port yang ditentukan oleh `PORT`.

Build frontend untuk production:

```bash
cd application
npm run build
```

Build dan jalankan backend untuk production:

```bash
cd service
npm run build
node -r dotenv/config dist/main
```

## Run tests

Jalankan test backend dari direktori `service`:

```bash
npm test
```

## Project structure

```text
.
├── application/   # Frontend Vue 3 dan Vite
└── service/       # Backend NestJS, migrasi, dan seeder
```

## Resources

- [Dokumentasi NestJS](https://docs.nestjs.com/)
- [Dokumentasi Vue](https://vuejs.org/guide/)
- [Dokumentasi Vite](https://vite.dev/guide/)
- [Dokumentasi Knex.js](https://knexjs.org/guide/)