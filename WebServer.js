var http = require('http')
var server = http.createServer()
var port = 3000
var cnt = 0
server.listen(port, function(req, res){
  console.log('WebServer Start, port = %d', port)
})

server.on('request', function(req, res){
  console.log('Enter User')
  res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'})
  res.write("<!DOCTYPE html>")
  res.write("<html>")
  res.write("<head><title>Respons page</title></head>")
  res.write("<body><h1>Hello!</h1></body>")
  res.write("</html>")
  res.end()
});
