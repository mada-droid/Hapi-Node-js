const knex = require('knex');
const knexfile = require('./../dbase/knexfile');
const {Model} = require('objection')

function setupDb(){
    const db = knex(knexfile.development);
    Model.knex(db);
}

module.exports = setupDb;