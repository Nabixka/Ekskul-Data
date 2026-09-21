/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('kegiatan').del()

  const ekskuls = await knex('ekskul').select('id', 'name')
  const ekskulId = Object.fromEntries(ekskuls.map((ekskul) => [ekskul.name, ekskul.id]))

  await knex('kegiatan').insert([
    {
      ekskul_id: ekskulId['IT Club'],
      title: 'Pelatihan Dasar Git dan GitHub',
      description: 'Belajar version control, branch, pull request, dan kolaborasi proyek.',
      location: 'Lab Komputer 1',
      waktu: '2026-09-05T08:00:00.000Z'
    },
    {
      ekskul_id: ekskulId['IT Club'],
      title: 'Workshop Membuat API',
      description: 'Praktik membuat REST API sederhana menggunakan NestJS dan PostgreSQL.',
      location: 'Lab Komputer 1',
      waktu: '2026-10-10T08:00:00.000Z'
    },
    {
      ekskul_id: ekskulId['Futsal'],
      title: 'Latihan Rutin Mingguan',
      description: 'Latihan teknik dasar, passing, dan strategi permainan futsal.',
      location: 'Lapangan Futsal Sekolah',
      waktu: '2026-09-12T15:30:00.000Z'
    },
    {
      ekskul_id: ekskulId['Futsal'],
      title: 'Seleksi Tim Antar Sekolah',
      description: 'Seleksi pemain untuk persiapan kompetisi futsal tingkat kota.',
      location: 'GOR Kecamatan',
      waktu: '2026-10-17T08:00:00.000Z'
    },
    {
      ekskul_id: ekskulId['ROHIS'],
      title: 'Kajian Akhlak dan Kepemimpinan',
      description: 'Kajian rutin dan diskusi kepemimpinan untuk anggota ROHIS.',
      location: 'Masjid Sekolah',
      waktu: '2026-09-19T09:00:00.000Z'
    }
  ])
};
