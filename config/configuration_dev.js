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
    }
  },
  server: {
    port: 3001,
    dir_path: "/mnt/test",
  },
};