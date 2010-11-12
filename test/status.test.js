
/**
 * Module dependencies.
 */

var connect = require('connect'),
    status = require('status')
    helpers = require('./helpers'),
    assert = require('assert'),
    sys = require('sys'),
    http = require('http');

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

module.exports = {
    'test basic status properties': function(){
      var server = helpers.run();
      server.use('/', status.status());
      server.use('/', connect.router(mock));

      server.assertResponse('GET', '/status', 200, null, '', function(response) {
        var result = JSON.parse(response.body);
        assert.isDefined(result.server_load_time, "Test the server load time is present.");
        assert.match(result.server_load_time, /\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d.\d\d\dZ/, "Test the server load time is a proper time string.");
        assert.isDefined(result.accesses, "Test the accesses is present.");
        assert.isDefined(result.uptime, "Test the uptime is present.");
        assert.isDefined(result.requests_per_second, "Test the request rate is present.");
      });
    },
    'test basic status does not have advanced properties': function(){
      var server = helpers.run();
      server.use('/', status.status());
      server.use('/', connect.router(mock));

      server.assertResponse('GET', '/status', 200, null, '', function(response) {
        var result = JSON.parse(response.body);
        assert.isUndefined(result.requests_by_status_code, "Test the responses_by_status_code is not present.");
        assert.isUndefined(result.requests_by_path, "Test the responses_by_path is not present.");
        assert.isUndefined(result.requests_by_duration, "Test the responses_by_duration is not present.");
      });
    },
    'test status accesses': function(){
        var server = helpers.run();
        server.use('/', status.status());
        server.use('/', connect.router(mock));
        server.use('/', connect.errorHandler({ showMessage: true }));

        server.assertResponse('GET', '/500');
        server.assertResponse('GET', '/404');
        server.assertResponse('GET', '/that');
        server.assertResponse('GET', '/500');
        server.assertResponse('GET', '/404');
        server.assertResponse('GET', '/that');

        server.assertResponse('GET', '/status', 200, null, 'Test we can get access count', function(response) {
          var expected_hits = 6, result = JSON.parse(response.body);
          assert.equal(result.accesses, expected_hits, "Test the number of accesses is correct. Should be " + expected_hits + ", is " + result.accesses);
        });
    },
    'test tracks status code status': function(){
        var server = helpers.run();
        server.use('/', status.status({status_codes: true}));
        server.use('/', connect.router(mock));
        server.use('/', connect.errorHandler({ showMessage: true }));

        server.assertResponse('GET', '/500');
        server.assertResponse('GET', '/500');

        server.assertResponse('GET', '/404');
        server.assertResponse('GET', '/404');
        server.assertResponse('GET', '/404');

        server.assertResponse('GET', '/that');
        server.assertResponse('GET', '/that');
        server.assertResponse('GET', '/that');
        server.assertResponse('GET', '/that');

        server.assertResponse('GET', '/status', 200, null, '', function(response) {
          var result = JSON.parse(response.body);
          assert.isDefined(result.requests_by_status_code, "Test the requests_by_status_code should be present")
          assert.equal(result.requests_by_status_code['500'], 2, "Test the number of 500s is correct. Should be " + 2 + ", is " + result.requests_by_status_code['500']);
          assert.equal(result.requests_by_status_code['404'], 3, "Test the number of 404s is correct. Should be " + 3 + ", is " + result.requests_by_status_code['404']);
          assert.equal(result.requests_by_status_code['200'], 4, "Test the number of 200s is correct. Should be " + 4 + ", is " + result.requests_by_status_code['200']);
        });
    },
    'test request path status': function(){
        var server = helpers.run();
        server.use('/', status.status({paths: true}));
        server.use('/', connect.router(mock));
        server.use('/', connect.errorHandler({ showMessage: true }));

        server.assertResponse('GET', '/a');
        server.assertResponse('GET', '/b?x=y');
        server.assertResponse('GET', '/c');
        server.assertResponse('GET', '/c');

        server.assertResponse('GET', '/status', 200, null, '', function(response) {
          var result = JSON.parse(response.body);
          assert.isDefined(result.requests_by_path, "Test the requests_by_path should be present")
          assert.equal(result.requests_by_path['/a'], 1, "Test the number of /a hits is correct. Should be " + 1 + ", is " + result.requests_by_path['/a']);
          assert.equal(result.requests_by_path['/b?x=y'], 1, "Test the number of /b hits is correct. Should be " + 1 + ", is " + result.requests_by_path['/b?x=y']);
          assert.equal(result.requests_by_path['/c'], 2, "Test the number of /c hits is correct. Should be " + 2 + ", is " + result.requests_by_path['/c']);
        });
    },
    'test request duration status': function(){
        var server = helpers.run();
        server.use('/', status.status({durations: true}));
        server.use('/', connect.router(mock));
        server.use('/', connect.errorHandler({ showMessage: true }));

        server.assertResponse('GET', '/500');
        server.assertResponse('GET', '/404');
        server.assertResponse('GET', '/that');

        server.assertResponse('GET', '/status', 200, null, '', function(response) {
          var result = JSON.parse(response.body);
          assert.isDefined(result.requests_by_duration, "Test the requests_by_duration should be present")
          var total_hits = 0;
          for (var duration in result.requests_by_duration) {
            total_hits = total_hits + result.requests_by_duration[duration];
          }
          assert.equal(total_hits, 3, "Test the number of hits is correct. Should be " + total_hits + ", is " + result.requests_by_duration['0']);
        });
    }
}