/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('list_dokumentasi', function(table){
    table.increments()
    table.text('path')

    table.integer('kegiatan_id').unsigned()
    table.foreign('kegiatan_id').references('kegiatan.id').onDelete('CASCADE')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('list_dokumentasi')
};
