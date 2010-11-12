exports.status = function(options) {
    if (typeof(options) == 'undefined') {
      var options = {};
    }
    var load_time = new Date();

    var status_request_counter = 0

    var track_paths = options.paths;
    var status_path_request_counter = {};

    var track_durations = options.durations;
    var status_duration_request_counter = {};

    var track_response_codes = options.status_codes;
    var status_code_request_counter = {};

    return function status(req, res, next) {
        var start = new Date(),
            end = res.end,
            writeHead = res.writeHead,
            statusCode;

        // Server the scoreboard stats
        if (req.url == "/status") {
          var uptime = ((start - load_time) / 1000).toFixed(0);
          var response_obj = {
            accesses: status_request_counter,
            server_load_time: load_time,
            requests_per_second: (status_request_counter / uptime).toFixed(2),
            uptime: uptime
          };

          if (track_response_codes) response_obj.requests_by_status_code = status_code_request_counter;
          if (track_durations) response_obj.requests_by_duration = status_duration_request_counter;
          if (track_paths) response_obj.requests_by_path = status_path_request_counter;

          var body = JSON.stringify(response_obj);
          // sys.log("Body: " + body);
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Content-Length': body.length
          });
          res.end(body);
        } else if (req.url == "/scoreboard") {
          var response_times = [];
          var max_response_time = 0;
          var max_response_count = 0
          var body = "";
          for (var i in status_duration_request_counter)
          {
            var time = parseInt(i);
            var response_count = parseInt(status_duration_request_counter[i]);
            response_times.push(time);
            if (response_count > max_response_count) {
              max_response_count = response_count;
            }
            if (time > max_response_time) {
              max_response_time = time;
            }
          }

          var num_buckets = 15;
          var normalized_max = 20;
          var bucket_width = (max_response_time / num_buckets).toFixed(0);
          for (var j=0;j<=max_response_time;j++){
           var j_string = ";"
           if (j%bucket_width == 0) {
             j_string = j + " - " + (parseInt(j) + parseInt(bucket_width));
             while (j_string.length < 10) {
               j_string = " " + j_string;
             }
             body += j_string + "ms : ";
           }
           var count = status_duration_request_counter[j] || 0;
           var n_count = count * (normalized_max / max_response_count);
           for (var k=0;k<n_count;k++) {
             body += "#";
           }
           if ((j+1)%bucket_width == 0) {
             body += "\n";
           }
          }

          res.writeHead(200, {}); // TODO: JSON, body size
          res.end(body);
        } else {
          // Proxy end to record duration information
          res.end = function(chunk, encoding) {
              res.end = end;
              res.end(chunk, encoding);

              status_request_counter++;

              if (track_durations) {
                var duration = (new Date().getTime() - start);
                if (typeof(status_duration_request_counter[duration]) == "undefined") {
                  status_duration_request_counter[duration] = 0;
                }
                status_duration_request_counter[duration]++;
              }

              if (track_paths) {
                if (typeof(status_path_request_counter[req.url]) == "undefined") {
                  status_path_request_counter[req.url] = 0;
                }
                status_path_request_counter[req.url]++;
              }
          };
          // Proxy writeHead to record status code information
          res.writeHead = function (code, headers) {
              res.writeHead = writeHead;
              res.writeHead(code, headers);

              if (track_response_codes) {
                if (typeof(status_code_request_counter[code]) == "undefined") {
                  status_code_request_counter[code] = 0;
                }
                status_code_request_counter[code]++;
              }
          };
        }
        // Fall through to the next layer.
        next();
    };
};
