var express = require('express')
, routes = require('./routes')
, user = require('./ortes/user')
, http = require('http')
, path = require('path')
var app = express()

//속성설정
app.set('port', process.env.PORT || 3000)

//미들웨어사용설정
app.use(express.favicon())
//클라이언트요청처리
app.get('/',routes.index)
app.get('/users',user.list)
//서버실행
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express WebServer listening, port ')+
  app.get('port');
})

//멀티 미드웨어
app.use(function(req,res,next){
  console.log('First Middleware')
  req.user='First'
  res.wirteHead('200',{'Content-Type':'text/html;charset=utf-8'})
  res.write('<h1>First Express Respons</h1>')
  next()
})
