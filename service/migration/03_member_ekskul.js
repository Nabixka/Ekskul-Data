/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('member_ekskul', function(table){
    table.increments()
    table.integer('user_id').unsigned()
    table.integer('ekskul_id').unsigned()
    table.enum('role', ['Pembina', 'Ketua', 'Wakil Ketua', 'Bendahara', 'Sekretaris', 'Humas', 'Member'])

    table.foreign('user_id').references('users.id').onDelete('CASCADE')
    table.foreign('ekskul_id').references('ekskul.id').onDelete('CASCADE')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('member_ekskul')
};
