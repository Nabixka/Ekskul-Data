/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('ekskul', function(table){
    table.increments()
    table.string('name')
    table.text('banner')
    table.enum('bidang', ['Ketuhanan', 'Bela Negara', 'Teknologi', 'PJOK', 'Seni', 'Pendidikan'])
    table.text('about')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('ekskul')
};
