module.exports = function(){
  var express = require('express')
  var app = express()
  var session = require('express-session')
  var orientoStore = require('connect-oriento')(session) // OrientDB의 session 연동
  var bodyParser = require('body-parser')//url을 분석하기위해
  app.set('views', './config/orientdb/topic')
  app.set('view engine', 'pug')
  app.locals.pretty = true//template의 줄바꿈을 자동으로 해줌
  app.listen(3003, function(){
    console.log('Connected 3000 port')
  })

  app.use(bodyParser.urlencoded({extended:false}))//extended:false가 무엇을 의미하는지??
  app.use(session({
    secret: 'heonjinjeong', //암호화를 위한 임의의값
    resave: false, //session id를 시작때마다 새롭게 발급할지
    saveUninitialized: true, //session id를 실제로 사용하기 전에 발급할지말지(un)
    store:new orientoStore({
      server:'host=localhost&port=2424&username=root&password=password&db=log'
                            //portNum, username, password, dbNmae
    })
  }))
  return app
}
