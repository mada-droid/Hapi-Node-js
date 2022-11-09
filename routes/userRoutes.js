const userMethods = require('../controllers/userMethods');
const Joi = require('joi');


module.exports = [{
    method: 'GET',
    path: '/api/users/{id}',
    options: {
        handler: userMethods.getUser,
        tags: ['api','UserApi'],
        validate :{
            params: Joi.object({
                id: Joi.number()
            })
        }
    }
},
    {
        method: 'PUT',
        path: '/api/users/{id}/update/name',
        options: {
            handler: userMethods.updateUserName,
            tags: ['api','UserApi'],
            validate :{
                params: Joi.object({
                    id: Joi.number(),
                }),
                payload :Joi.object({
                    name: Joi.string(),
                })
            }
        }
    },
    {
        method: 'PUT',
        path: '/api/users/{id}/update/password',
        options: {
            handler: userMethods.updateUserPassword,
            tags: ['api','UserApi'],
            validate :{
                params: Joi.object({
                    id: Joi.number(),
                }),
                payload :Joi.object({
                    password: Joi.string(),
                })
            }
        }
    },
    {
        method: 'GET',
        path: '/api/users',
        options: {
            handler: userMethods.getAllUsers,
            tags: ['api','UserApi'],
        }
    },

    {
        method: 'POST',
        path: '/api/register',
        options: {
            handler: userMethods.saveUser,
            tags: ['api','UserApi'],
            validate: {
                payload :Joi.object({
                    name: Joi.string(),
                    email: Joi.string(),
                    password: Joi.string()
                })
            },
            auth: false
        }
    },

    {
        method: 'POST',
        path: '/api/login',
        options: {
            handler: userMethods.login,
            tags: ['api','UserApi','TokenGeneration'],
            validate: {
                payload :Joi.object({
                    name: Joi.string(),
                    password: Joi.string()
                })
            },
            auth: false
        }
    },
    {
        method: 'GET',
        path: '/api/view',
        options: {
            handler: userMethods.getView,
            tags: ['api','view'],
            auth: false
        }
    },
    // {
    //     method: 'GET',
    //     path: '/api/get/login',
    //     options: {
    //         handler: userMethods.getLogin,
    //         tags: ['api','view'],
    //         auth: false
    //     }
    // },

    {
        method: 'GET',
        path: '/api/user/details',
        options: {
            handler: userMethods.userDetails,
            tags: ['api','UserApi'],
        }
    },
    {
        method: 'DELETE',
        path: '/api/users/{id}/delete',
        options: {
            handler: userMethods.deleteUser,
            tags: ['api','UserApi'],
            validate :{
                params: Joi.object({
                    id: Joi.number()
                })
            }
        }
    },

]