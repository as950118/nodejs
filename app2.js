var http = require('http')
var server = http.createServer()
var port = 3000
var cnt = 0
//WebServer를 시작함
server.listen(port, function(){
  console.log('Web Server Start : %d', port)
})
//WebServer에 req가 왔을 시
server.on('request', function(req, res){
  console.log('Enter User')
  //Header 부분
  res.writeHead(200, {'Content-Type' : 'text/html; charset=utf-8'})
  //html 코드 부분
  res.write('<!DOCTYPE html>')
  res.write('<html>')
  res.write('<head><title>res page</title></head>')
  res.write('<body><h1>Hello World!</h1></body>')
  res.write('</html>')
  res.end
})
