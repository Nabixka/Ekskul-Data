/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('kegiatan', function(table){
    table.increments()
    table.string('title').notNullable()
    table.text('description').notNullable()
    table.string('location').notNullable()
    table.timestamp('waktu')
    table.integer('ekskul_id').unsigned()
    
    table.foreign('ekskul_id').references('ekskul.id').onDelete('CASCADE')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('kegiatan')
};
