/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('peminjaman_ruang', function(table){
        table.increments()
        table.integer('ruang_id').unsigned()
        table.text('description')
        table.string('peminjam')
        table.enum('status', ['Kosong', 'Diajukan', 'Penuh'])
        table.timestamp('waktu_peminjaman')
        
        table.foreign('ruang_id').references('ruang.id').onDelete('CASCADE')
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('peminjaman_ruang')
};
