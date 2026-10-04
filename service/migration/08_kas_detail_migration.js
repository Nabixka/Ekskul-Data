/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  if (!await knex.schema.hasColumn('kas_transcation', 'ekskul_id')) {
    await knex.schema.alterTable('kas_transcation', function(table) {
      table.integer('ekskul_id').unsigned().nullable()
      table.foreign('ekskul_id').references('ekskul.id').onDelete('CASCADE')
    })
  }

  if (!await knex.schema.hasColumn('kas_transcation', 'member_ekskul_id')) {
    await knex.schema.alterTable('kas_transcation', function(table) {
      table.integer('member_ekskul_id').unsigned().nullable()
      table.foreign('member_ekskul_id').references('member_ekskul.id').onDelete('SET NULL')
    })
  }

  if (!await knex.schema.hasColumn('kas_transcation', 'waktu')) {
    await knex.schema.alterTable('kas_transcation', function(table) {
      table.timestamp('waktu').nullable()
    })
    if (await knex.schema.hasColumn('kas_transcation', 'created_at')) {
      await knex('kas_transcation').whereNull('waktu').update({ waktu: knex.ref('created_at') })
    }
    await knex('kas_transcation').whereNull('waktu').update({ waktu: knex.fn.now() })
    await knex.schema.alterTable('kas_transcation', function(table) {
      table.timestamp('waktu').notNullable().alter()
    })
  }

  for (const ekskulName of ['IT Club', 'Futsal']) {
    const ekskul = await knex('ekskul').select('id').where({ name: ekskulName }).first()
    if (ekskul) {
      await knex('kas_transcation')
        .whereNull('ekskul_id')
        .andWhere('keterangan', 'like', `%${ekskulName}%`)
        .update({ ekskul_id: ekskul.id })
    }
  }

  await knex.schema.alterTable('kas_transcation', function(table) {
    table.index(['ekskul_id', 'waktu'], 'kas_transcation_ekskul_waktu_idx')
    table.index(['member_ekskul_id', 'waktu'], 'kas_transcation_member_waktu_idx')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.alterTable('kas_transcation', function(table) {
    table.dropIndex(['ekskul_id', 'waktu'], 'kas_transcation_ekskul_waktu_idx')
    table.dropIndex(['member_ekskul_id', 'waktu'], 'kas_transcation_member_waktu_idx')
    table.dropForeign(['ekskul_id'])
    table.dropForeign(['member_ekskul_id'])
    table.dropColumn('ekskul_id')
    table.dropColumn('member_ekskul_id')
    table.dropColumn('waktu')
  })
}
