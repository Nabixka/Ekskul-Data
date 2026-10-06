/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  
  await knex('ruang').del()
  for(let i = 1; i <= 16; i++){
    await knex('ruang').insert([
      { ruang_name: `Ruang Teori ${i}` }
    ])
  }
};
