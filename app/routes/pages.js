module.exports = function(app) {

    // For known routes, simply send back the main page index.html.
    // The frontend does the actual rendering of different views.

    app.get('/', function(req, res) {
        return res.sendfile('./public/views/index.html');
    });

    app.get('/auth', function(req, res) {
        return res.sendfile('./public/views/index.html');
    });

    app.get('/profile', function(req, res) {
        return res.sendfile('./public/views/index.html');
    });

};
