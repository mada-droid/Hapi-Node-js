"use strict";
const Hapi = require('@hapi/hapi');

module.exports = {
  swagger: {
    "documentationPath": "/docs",
    "info": {
      "title": "HAPI - FILE SYSTEM",
      "description": "Api REST",
      "termsOfService": "© Copyright Giuffré Francis Lefreve - Tutti i diritti riservati",
      "version": "1.0.0"
    },
    grouping: 'tags',
    securityDefinitions:{
      jwt: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header'
      }
    },
    security:[{jwt: []}],
    schemes: ['http','https']
  },
  server: {
    port: 3000,
    dir_path: "C:\\tmp",
  },
  JWT : {
    "SECRET_KEY": "e67ACpwCLAsbEtGpJSzrO4FIELXtGJzi",
    "ALG" :"HS256",
    "EXPIRATION": 36000,
    "TOKEN_HEADER_KEY": "gfg_token_header_key"
  },
  "knex": {
    client: "pg",
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
  },
};
