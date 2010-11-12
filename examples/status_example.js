var connect = require('../support/connect/lib/connect'),
    status = require('../lib/status');

// Faux app
function mock(app){
    app.get('/500', function(req, res){
        res.writeHead(500, {});
        res.end('Booo!');
    });

    app.get('/404', function(req, res){
        res.writeHead(404, {});
        res.end('Whaa?');
    });

    app.get('/:path', function(req, res){
        res.writeHead(200, {});
        res.end('Hurray!');
    });
}
var server = connect.createServer();
server.use("/", status.status({durations: true, paths: true, status_codes: true}));
server.use(connect.router(mock));
server.listen(8124);
console.log("Server listening on http://127.0.0.1:8124");
console.log("Fire off a few requests, and then hit /status to see whats up.");
