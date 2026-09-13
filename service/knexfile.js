require("dotenv").config()
// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'postgres',
      password: process.env.DB_PASS || '',
      user: process.env.DB_USER || 'localhost'
    },
    migrations: {
      directory: './migration'
    },
    seeds: {
      directory: './seeder'
    }
  },

};
