/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  //truncate all existing tables
  await knex.raw('TRUNCATE TABLE "user" CASCADE')
  // Deletes ALL existing entries
  await knex('user').insert([
    {id: 1,
      name: 'Mada',
      password: '1234'},

    {id: 2,
      name: 'Bage',
      password: '1234'},

    {id: 3,
      name: 'Gfranco',
      password: '12345'}
  ]);

};
