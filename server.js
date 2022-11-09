'use strict';

const Hapi = require('@hapi/hapi');
const fs = require('fs');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const HapiSwagger = require('hapi-swagger');
const routes = require('./routes/route');
const userRoutes = require('./routes/userRoutes');
const HapiNowAuth = require('@now-ims/hapi-now-auth');
const jwt = require("jsonwebtoken");
const Schwifty = require('@hapipal/schwifty');

const init = async () => {

    let env = "local";
    if (fs.existsSync('./env')) {
        env = "" + fs.readFileSync('./env');
        env = env.trim().replace(/[\n\r]+/g, '');
    }
    console.log("ENV :: " + env)
    const Config = require("./config/configuration_" + env);

    const server = Hapi.server({
        port: Config.server.port,
        host: 'localhost'
    });

    server.settings.app = {
        config: Config
    };

    const swaggerOptions = Config.swagger;

    await server.register([
        require('hapi-auth-jwt2'),
        Inert,
        Vision,
        HapiNowAuth,
        {
            plugin: HapiSwagger,
            options: swaggerOptions
        },
        {
            plugin: Schwifty,
            options: {
                knex: Config.knex
            }
        },
    ]);

    server.views({
        engines: {
            html: require('handlebars')
        },
        relativeTo: __dirname,
    });

    server.auth.strategy('jwt-strategy', 'hapi-now-auth', {
        verifyJWT: true,
        allowQueryToken: true,
        keychain: [Config.JWT.SECRET_KEY],
        validate: async (request, token, h) => {
            let isValid, artifacts = {};
            /**
             * we asked the plugin to verify the JWT
             * we will get back the decodedJWT as token.decodedJWT
             * and we will get the JWT as token.token
             */
            const credentials = token.decodedJWT;
            console.log(token)
            /**
             * return the decodedJWT to take advantage of hapi's
             * route authentication options
             * https://hapijs.com/api#authentication-options
             */
            try {
                const verified = jwt.verify(token.token, Config.JWT.SECRET_KEY);
                exports.verified = verified;
                if (verified) {
                    isValid = true
                    return {isValid, credentials, artifacts}
                } else {
                    isValid = false
                    var error_message = "Error!"
                    console.log(error_message)
                    artifacts["error"] = error_message
                    return {isValid, credentials, artifacts}
                }
            } catch (e) {
                console.log(e)
            }
        }
    });
    server.auth.default('jwt-strategy');
    try {
        await server.start();
        console.log('Server running at:', server.info.uri);
        console.log('Swagger running at:', server.info.uri + "/docs");
    } catch (err) {
        console.log(err);
    }
    server.route(routes);
    server.route(userRoutes);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();












