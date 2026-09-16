/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('kas_transcation', function(table){
    table.increments()
    table.integer('amount'),
    table.enum('jenis', ['masuk', 'keluar'])
    table.text('keterangan')
    table.timestamps('waktu')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('kas_transcation')
};
