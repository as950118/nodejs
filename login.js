var express = require('express')
var app = express()
var session = require('express-session')
var OrientDB = require('orientjs')
var orientoStore = require('connect-oriento')(session) // OrientDB의 session 연동
var bodyParser = require('body-parser')//url을 분석하기위해
var md5 = require('md5')
//var passport = require('passport')
//var LocalStrategy = require('passport-local').Strategy
//var hasher = bkfd2Password()

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
app.use('/log', express.static('public'))
//app.use(passport.initialize()) //passport 초기화
//app.use(passport.session()) //passport를 사용할때 session을 사용

app.set('views', './views_log')
app.set('view engine', 'pug')
var server = OrientDB({
  host: 'localhost',
  port: 2424,
  username: 'root',
  password: 'password'
})
var db = server.use('log')

//회원 목록
var users = [] //배열
//

//메인
app.get('/main', function(req, res){
  res.render('main')
})
//로그인
app.get('/login', function(req, res){
  res.render('login')
})
//
//로그인 확인
app.post('/login', function(req, res){
  var userdata = {
    id:req.body.id,
    pw:req.body.password
  }
  for(var i=0; i<users.length; i++){
    var user = users[i]
    if(user.id === userdata.id && user.pw === userdata.pw){
      req.session.id = userdata.id
      return req.session.save(function(){  //여기에 return 이 있어야 callback함수에 의한 오류가 발생하지않음
        res.render('main') //여기에 return이 들어가면 for문 밖의 명령어가 실행된후 callback으로 돌아와 실행되므로 오류발생
      })
    }
  }
})
//
//회원가입
app.get('/signup', function(req, res){
  res.render('signup')
})
//
//회원가입완료
app.post('/signup', function(req, res){
  var userdata = {
    id:req.body.id,
    pw:req.body.password,
    email:req.body.email
  }
  users.push(userdata)
  res.redirect('/main')
})
//
//로그인 완료
app.post('/main', function(req, res){

})
//
//게시판
app.get('/board', function(req, res){

})
//
