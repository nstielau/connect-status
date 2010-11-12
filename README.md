# Connect-Status

Connect-Status is a middleware layer for Connect that provides status information, like average requests-per-second, and detailed request duration information.

## Disclaimer:

This is not used in production.  I'll let you know when it is.

## Features

Track a few key status metrics:

  * Server uptime
  * Request rate
  * Request duration statistics
  * Request path statistics
  * Response code statistics

## Hello World

The simplest connect app looks just like `http.Server` instances from node.  In fact `Connect.Server` inherits from `http.Server`.

        function mock(app){
            app.get('/:path', function(req, res){
                res.writeHead(200, {});
                res.end('Booo!');
            });
        }
        var server = connect.createServer();
        server.use("/", status.status({durations: true, paths: true, status_codes: true}));
        server.use(connect.router(mock));


        $ curl 127.0.0.1:8124/page_1 && echo
        Hurray!
        $ curl 127.0.0.1:8124/page_2 && echo
        Hurray!
        $ curl 127.0.0.1:8124/page_2 && echo
        Hurray!
        $ curl 127.0.0.1:8124/status && echo  {"accesses":3,"server_load_time":"2010-11-12T21:37:36.493Z","requests_per_second":"0.21","uptime":"14","requests_by_status_code":{"200":3},"requests_by_duration":{"0":2,"1":1},"requests_by_path":{"/page_1":1,"/page_2":2}}

## Installation

Check out the example

You should put this middleware as early as possible to record correct durations.

## Testing

First update the git submodules, which includes
the [Expresso](http://github.com/visionmedia/expresso) TDD
framework:

    $ git submodule update --init

Then run the test suites located in _./test_ with the following command:

    $ make test

Run a single test, or use a custom glob pattern:

    $ make test TESTS=test/connect.test.js

## License

(The MIT License)

Copyright (c) 2010 Nick Stielau

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.