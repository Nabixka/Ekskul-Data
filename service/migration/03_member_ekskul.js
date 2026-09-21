/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('member_ekskul', function(table){
    table.increments()
    table.integer('nis_user').unsigned()
    table.integer('ekskul_id').unsigned()
    table.enum('role', ['Pembina', 'Ketua', 'Wakil Ketua', 'Bendahara', 'Sekretaris', 'Humas', 'Member'])

    table.foreign('nis_user').references('users.nis').onDelete('CASCADE')
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
