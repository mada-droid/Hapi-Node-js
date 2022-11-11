// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
const {knexSnakeCaseMappers} = require('objection');

module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      database: 'objection_tutorial',
      user:     'postgres',
      password: '*********'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds',
    },
    ...knexSnakeCaseMappers,

  }
};
