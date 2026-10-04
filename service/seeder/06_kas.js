/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('kas_transcation').del()

  const ekskuls = await knex('ekskul').select('id', 'name')
  const ekskulId = Object.fromEntries(ekskuls.map((ekskul) => [ekskul.name, ekskul.id]))
  if (!ekskulId['IT Club'] || !ekskulId['Futsal']) {
    throw new Error('Seed kas membutuhkan data ekskul IT Club dan Futsal')
  }

  await knex('kas_transcation').insert([
    { ekskul_id: ekskulId['IT Club'], amount: 500000, jenis: 'masuk', keterangan: 'Iuran anggota IT Club bulan September 2026', waktu: '2026-09-01T08:00:00.000Z' },
    { ekskul_id: ekskulId['IT Club'], amount: 250000, jenis: 'masuk', keterangan: 'Dana pembinaan sekolah', waktu: '2026-09-03T08:00:00.000Z' },
    { ekskul_id: ekskulId['IT Club'], amount: 175000, jenis: 'keluar', keterangan: 'Pembelian kabel dan adaptor jaringan', waktu: '2026-09-06T10:00:00.000Z' },
    { ekskul_id: ekskulId['IT Club'], amount: 100000, jenis: 'keluar', keterangan: 'Konsumsi kegiatan pelatihan', waktu: '2026-09-07T10:00:00.000Z' },
    { ekskul_id: ekskulId['Futsal'], amount: 300000, jenis: 'masuk', keterangan: 'Iuran anggota Futsal bulan September 2026', waktu: '2026-09-08T08:00:00.000Z' },
    { ekskul_id: ekskulId['Futsal'], amount: 150000, jenis: 'keluar', keterangan: 'Sewa lapangan latihan', waktu: '2026-09-12T16:00:00.000Z' }
  ])
}