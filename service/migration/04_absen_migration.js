/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('absen', function(table){
    table.increments()
    table.enum('keterangan', ['hadir', 'alpha', 'sakit', 'izin'])

    table.integer('kegiatan_id').unsigned()
    table.foreign('kegiatan_id').references('kegiatan.id').onDelete('CASCADE')

    table.integer('member_ekskul_id').unsigned()
    table.foreign('member_ekskul_id').references('member_ekskul.id').onDelete('CASCADE')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('absen')
};
