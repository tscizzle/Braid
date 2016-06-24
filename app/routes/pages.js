module.exports = function(app) {

    app.get('/', function(req, res) {
        return res.sendfile('./public/views/index.html');
    });

};
