/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('member_ekskul').del()

  const users = await knex('users').select('nis', 'name')
  const ekskuls = await knex('ekskul').select('id', 'name')
  const nis = Object.fromEntries(users.map((user) => [user.name, user.nis]))
  const ekskulId = Object.fromEntries(ekskuls.map((ekskul) => [ekskul.name, ekskul.id]))

  await knex('member_ekskul').insert([
    { nis_user: nis['Ahmad Fauzan'], ekskul_id: ekskulId['IT Club'], role: 'Pembina' },
    { nis_user: nis['Eka Putri'], ekskul_id: ekskulId['IT Club'], role: 'Pembina' },
    { nis_user: nis['Siti Aisyah'], ekskul_id: ekskulId['IT Club'], role: 'Ketua' },
    { nis_user: nis['Budi Santoso'], ekskul_id: ekskulId['IT Club'], role: 'Humas' },
    { nis_user: nis['Citra Lestari'], ekskul_id: ekskulId['IT Club'], role: 'Bendahara' },
    { nis_user: nis['Dimas Pratama'], ekskul_id: ekskulId['IT Club'], role: 'Member' },
    { nis_user: nis['Eka Putri'], ekskul_id: ekskulId['IT Club'], role: 'Member' },
    { nis_user: nis['Ahmad Fauzan'], ekskul_id: ekskulId['Futsal'], role: 'Ketua' },
    { nis_user: nis['Siti Aisyah'], ekskul_id: ekskulId['Futsal'], role: 'Sekretaris' },
    { nis_user: nis['Budi Santoso'], ekskul_id: ekskulId['Futsal'], role: 'Member' },
    { nis_user: nis['Citra Lestari'], ekskul_id: ekskulId['Futsal'], role: 'Member' },
    { nis_user: nis['Dimas Pratama'], ekskul_id: ekskulId['Futsal'], role: 'Member' },
    { nis_user: nis['Eka Putri'], ekskul_id: ekskulId['Futsal'], role: 'Member' },
    { nis_user: nis['Siti Aisyah'], ekskul_id: ekskulId['ROHIS'], role: 'Ketua' },
    { nis_user: nis['Eka Putri'], ekskul_id: ekskulId['ROHIS'], role: 'Member' }
  ])
};
