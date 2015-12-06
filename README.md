node_webserver
==============

Attempt to create a webserver using node. This version is made to run on Heroku.

This is an extention of the sample webserver on http://nodejs.org/.

Additions to the 'hello world' sample are:
- Displaying files
- Implementation of MIME types based on file extention
  This uses a JSON file. Current implementation is case sensititve
- Abillity to deliver gzipped files
  If a gzipped version exists and the browser suppports it
  This allows for a very flexible setup (only gzip if it makes sense)
  No additional CPU load (files are pre-zipped)
<br/><br/>My wishlist for further functionality:
- Implement session information using a session cookie
- Gather geolocation information from clients
- Name based virtual hosts (should be trivial)



