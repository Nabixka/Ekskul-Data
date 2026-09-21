/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('list_dokumentasi').del()

  const kegiatan = await knex('kegiatan').select('id', 'title')
  const kegiatanId = Object.fromEntries(kegiatan.map((item) => [item.title, item.id]))

  await knex('list_dokumentasi').insert([
    { kegiatan_id: kegiatanId['Pelatihan Dasar Git dan GitHub'], path: '/uploads/kegiatan/dokumentasi/git-dan-github-01.jpg' },
    { kegiatan_id: kegiatanId['Pelatihan Dasar Git dan GitHub'], path: '/uploads/kegiatan/dokumentasi/git-dan-github-02.jpg' },
    { kegiatan_id: kegiatanId['Latihan Rutin Mingguan'], path: '/uploads/kegiatan/dokumentasi/futsal-latihan-01.jpg' },
    { kegiatan_id: kegiatanId['Kajian Akhlak dan Kepemimpinan'], path: '/uploads/kegiatan/dokumentasi/kajian-akhlak-01.jpg' }
  ])
}