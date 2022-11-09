"use strict";

const api = require('../controllers/main');
const Joi = require('joi');

module.exports = [{
    method: 'GET',
    path: '/api/list',
    options: {
        handler: api.list,
        tags: ['api'],
        auth: false
    }
},
    {
        method: 'GET',
        path: '/api/token',
        options: {
            handler: api.sign,
            tags: ['api','TokenGeneration'],
            auth: false
        }
    },
    {

        method: 'POST',
        path: '/api/info',
        options: {
            handler: api.info,
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    path: Joi.string()
                })
            }
        }

    },
    {
        method: 'POST',
        path: '/api/rename',
        options: {
            handler: api.rename,
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    path: Joi.string(),
                    new: Joi.string()
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/api/delete',
        options: {
            handler: api.delete,
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    path: Joi.string()
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/api/download',
        options: {
            handler: api.download,
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    path: Joi.string()
                })
            },
            cors: {origin: ['*']},
            auth: false,
        }
    },
    {
        method: 'POST',
        path: '/api/upload',
        options: {
            handler: api.upload,
            payload: {
                parse: true,
                output: 'stream',
                multipart: true
            },
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    file: Joi.object()
                })
            },
        }
    },
];