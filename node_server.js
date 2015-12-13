//Author: Jan van der Meiden
//jvdmeiden@googlemail.com
//Version: 20130318.00
//
//Copyright (c) 2013 Jan van der Meiden.
 
//
//Copying and distribution of this file, with or without modification,
//are permitted in any medium without royalty provided the copyright
//notice and this notice are preserved.
//
 
// This is an attempt to create a nodejs webserver.
// - Basically it is the sample from nodejs.org
// - Added better support for mime types
// - Added proper content-length in response
// - Added support for gzipped response (if gzipped file exists on filesystem)
// 

 
var     http = require('http'), 
        url = require('url'), 
        path = require('path'), 
        fs = require('fs'), 
        mime = require('./mime'),
  port= process.env.PORT || 80; // Specific for running on Heroku
    
http.createServer(function(request, response) { 
  // Log some info
  var now = new Date();
  var dateAndTime = now.toUTCString();
  console.log(dateAndTime);
  console.log(request.connection.remoteAddress)
  console.log(request.url);
  console.log(JSON.stringify(request.method));
  console.log(JSON.stringify(request.headers));

  var uri = url.parse(request.url).pathname;
    if (uri == '/' || uri == ''){
      uri='/index.html';
    }
    if (  request.headers.host == 'uniformresourcelocator.info' ){
      uri='/URLinfo'+uri;
    } 
    if (uri=='/geoip') {
      var request=url.parse(request.url).query;
      console.log(request);
      if ( checkIsIPV4(request)){
        http.get('http://127.0.0.1:8081/geoip?'+request, function(res) {
        var ipinfo = "";
        res.on('data', function (chunk) {
          console.log(ipinfo+=chunk);
          });
          res.on('end', function() {
            response.writeHeader(200, {'Content-Type': 'text/plain','Content-Length': ipinfo.length });
            response.write(ipinfo);
            response.end();
          })
       }).on('error', function(e) {
         console.log("Got error: " + e.message);
       });
      } else {
        errString="422 Input not recognised as IP number";
        response.writeHeader(422, {'Content-Type': 'text/plain','Content-Length': errString.length});
        response.write(errString);
        response.end();
      }
    } else {
      ext=uri.split('.').pop();
      responseType=mime.mimetype[ext];
      if (responseType===undefined){
        responseType="text/plain";
      }
      var filename = path.join(process.cwd(), uri); 
      // first check for gzipped file
      fs.stat(filename+'.gz', function(error,stats){
      // if no gzipped file or gzip not supported
      if(error) {
        fs.stat(filename, function(error,stats){
          if(error) {
            var errString='404 Not Found\n';
            response.writeHeader(404, {'Content-Type': 'text/plain','Content-Length': errString.length}); 
            response.write(errString); 
            response.end(); 
            return; 
          }
          // send nonzipped file
          fs.readFile(filename, 'binary', function(err, file) { 
            if(err) { 
              var errString=err + '\n';
              response.writeHeader(500, {'Content-Type': 'text/plain','Content-Length': errString.length}); 
              response.write(errString); 
              response.end(); 
              return; 
            }
            response.writeHeader(200, {'Content-Type': responseType,'Content-Length': stats.size });
            response.write(file, 'binary'); 
            response.end();
          });         
        });  
        return;
      }; 
      // send zipped file
      fs.readFile(filename+'.gz', 'binary', function(err, file) { 
        if(err) { 
          var errString=err + '\n';
          response.writeHeader(500, {'Content-Type': 'text/plain','Content-Length': errString.length}); 
          response.write(errString); 
          response.end(); 
          return; 
        }
        response.writeHeader(200, {'Content-Type': responseType,'Content-Length': stats.size,'Content-Encoding': 'gzip'});
        response.write(file, 'binary'); 
        response.end();
      }); 
    });
  }
}).listen(port); 

function checkIsIPV4(entry) {
  var blocks = entry.split(".");
  if(blocks.length === 4) {
    return blocks.every(function(block) {
      return parseInt(block,10) >=0 && parseInt(block,10) <= 255;
    });
  }
  return false;
}

    
console.log('Server running at :' + port);  
