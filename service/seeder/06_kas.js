/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('kas_transcation').del()

  await knex('kas_transcation').insert([
    { amount: 500000, jenis: 'masuk', keterangan: 'Iuran anggota IT Club bulan September 2026', created_at: '2026-09-01T08:00:00.000Z', updated_at: '2026-09-01T08:00:00.000Z' },
    { amount: 250000, jenis: 'masuk', keterangan: 'Dana pembinaan sekolah', created_at: '2026-09-03T08:00:00.000Z', updated_at: '2026-09-03T08:00:00.000Z' },
    { amount: 175000, jenis: 'keluar', keterangan: 'Pembelian kabel dan adaptor jaringan', created_at: '2026-09-06T10:00:00.000Z', updated_at: '2026-09-06T10:00:00.000Z' },
    { amount: 100000, jenis: 'keluar', keterangan: 'Konsumsi kegiatan pelatihan', created_at: '2026-09-07T10:00:00.000Z', updated_at: '2026-09-07T10:00:00.000Z' },
    { amount: 300000, jenis: 'masuk', keterangan: 'Iuran anggota Futsal bulan September 2026', created_at: '2026-09-08T08:00:00.000Z', updated_at: '2026-09-08T08:00:00.000Z' },
    { amount: 150000, jenis: 'keluar', keterangan: 'Sewa lapangan latihan', created_at: '2026-09-12T16:00:00.000Z', updated_at: '2026-09-12T16:00:00.000Z' }
  ])
}