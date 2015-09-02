module.exports = function(app){
    app.get('/', require('./frontpage').get);

    app.get('/chart', require('./chart').get);

    app.get('/list/:id', require('./list').get);
    app.get('/list', require('./list').get);

    app.post('/console', require('./console').post);
};