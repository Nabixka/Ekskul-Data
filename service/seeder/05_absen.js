/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('absen').del()

  const kegiatan = await knex('kegiatan').select('id', 'title')
  const members = await knex('member_ekskul')
    .join('users', 'users.nis', 'member_ekskul.nis_user')
    .join('ekskul', 'ekskul.id', 'member_ekskul.ekskul_id')
    .select('member_ekskul.id', 'users.name', 'ekskul.name as ekskul_name')

  const kegiatanId = Object.fromEntries(kegiatan.map((item) => [item.title, item.id]))
  const memberId = (ekskulName, userName) => members.find(
    (member) => member.ekskul_name === ekskulName && member.name === userName
  ).id

  await knex('absen').insert([
    { kegiatan_id: kegiatanId['Pelatihan Dasar Git dan GitHub'], member_ekskul_id: memberId('IT Club', 'Siti Aisyah'), keterangan: 'hadir' },
    { kegiatan_id: kegiatanId['Pelatihan Dasar Git dan GitHub'], member_ekskul_id: memberId('IT Club', 'Budi Santoso'), keterangan: 'hadir' },
    { kegiatan_id: kegiatanId['Pelatihan Dasar Git dan GitHub'], member_ekskul_id: memberId('IT Club', 'Dimas Pratama'), keterangan: 'izin' },
    { kegiatan_id: kegiatanId['Pelatihan Dasar Git dan GitHub'], member_ekskul_id: memberId('IT Club', 'Eka Putri'), keterangan: 'sakit' },
    { kegiatan_id: kegiatanId['Latihan Rutin Mingguan'], member_ekskul_id: memberId('Futsal', 'Ahmad Fauzan'), keterangan: 'hadir' },
    { kegiatan_id: kegiatanId['Latihan Rutin Mingguan'], member_ekskul_id: memberId('Futsal', 'Siti Aisyah'), keterangan: 'alpha' },
    { kegiatan_id: kegiatanId['Latihan Rutin Mingguan'], member_ekskul_id: memberId('Futsal', 'Budi Santoso'), keterangan: 'hadir' },
    { kegiatan_id: kegiatanId['Latihan Rutin Mingguan'], member_ekskul_id: memberId('Futsal', 'Citra Lestari'), keterangan: 'sakit' },
    { kegiatan_id: kegiatanId['Kajian Akhlak dan Kepemimpinan'], member_ekskul_id: memberId('ROHIS', 'Siti Aisyah'), keterangan: 'hadir' },
    { kegiatan_id: kegiatanId['Kajian Akhlak dan Kepemimpinan'], member_ekskul_id: memberId('ROHIS', 'Eka Putri'), keterangan: 'izin' }
  ])
};
