const Koa = require('koa'),
    path = require('path'),
    { koaBody } = require('koa-body'),
    api = require('../index')

process.env.NODE_ENV = 'test'

exports.startServer = function (port) {
    const app = new Koa(),
        filePath = path.join(process.cwd(), 'test', 'json-api.hbs')

    app.use(koaBody())
    app.use(api({ urlPrefix: '/api', filePath }))

    app.use(ctx => {
        ctx.status = 404
        ctx.body = { error: 'not found' }
    })

    return app.listen(port)
}

// exports.startServer(2002);
