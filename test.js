const test = require('ava')
const Hapi = require('@hapi/hapi')
const routes = require('./routes/userRoutes')
const userMethods = require("./controllers/userMethods");

//Testing events, The test would end when the listener is called.
test('listen to custom event', async (t) => {
    const server = Hapi.server()

    server.event('custom')

    server.events.on('custom', (message) => {
        t.is(message, 'ok')
    })

    await server.events.emit('custom', 'ok')
})


//The server listener not started yet
test('initialize server to have cache configured', async (t) => {
    const server = Hapi.server()

    server.ext({
        type: 'onPreStart',
        async method() {
            server.app.value = 1
        },
    })

    await server.initialize()

    t.is(server.app.value, 1)
})

// server.inject to simulate a request to that endpoint
test('my initial test', async (t) => {
    const server = Hapi.server();
    server.route(routes);
    t.pass()
    const res =
        await server.inject('http://localhost:3000/api/users')
    console.log(res.result)
    t.deepEqual(res.result,  await  userMethods.getAllUsers())
    t.is(res.statusCode, 200)
})

//Test against a running server
test('route / should return ok on starting the controller server', async (t) => {
    const server = Hapi.server()

    server.route(routes)

    await server.start()

    t.pass();
})


