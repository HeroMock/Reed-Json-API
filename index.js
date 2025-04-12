const fs = require('fs'),
    Router = require('koa-router'),
    path = require('path'),
    dummyJson = require('dummy-json'),
    { setBadRequest, isEmpty } = require('./lib/util');

//TODO: watch file changed for json template

module.exports = ({ urlPrefix, filePath, dummyOptions }) => {

    const router = new Router()
    urlPrefix && router.prefix(urlPrefix)
    const jsonData = generateData(filePath, dummyOptions)

    router.get('/_refresh', handleRefresh(jsonData))
        .get('/:name{/:id}', require('./lib/get')(jsonData))
        .delete('/:name{/:id}', require('./lib/delete')(jsonData))
        .all('{/:name}', handleBadRequest)
        .post('{/:name}', require('./lib/create')(jsonData))
        .put('/:name{/:id}', require('./lib/update')(jsonData, false))
        .patch('/:name{/:id}', require('./lib/update')(jsonData, true))

    return router.routes()
}

function handleRefresh(jsonData) {
    return async (ctx) => {
        const newData = generateData(filePath, dummyOptions);
        Object.keys(jsonData).forEach(key => delete jsonData[key]);
        Object.assign(jsonData, newData);

        ctx.body = { message: 'Data refreshed' }
    }
}

async function handleBadRequest(ctx, next) {
    if (['POST', 'PUT', 'PATCH'].includes(ctx.method)) {
        let entity = ctx.request.body,
            entityType = typeof entity

        if (!entity || entityType != 'object' || isEmpty(entity)) {
            setBadRequest(ctx)
            return
        }
    }

    return await next()
}

function generateData(filePath, dummyOptions) {
    const source = fs.readFileSync(filePath).toString()
    let jsonData = {}
    if (path.extname(filePath).toLowerCase() == '.json') {
        jsonData = JSON.parse(source)
    } else {
        let jsonResult = dummyJson.parse(source, dummyOptions)
        jsonData = JSON.parse(jsonResult)
    }
    return jsonData
}

