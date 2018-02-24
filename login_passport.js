var express = require('express')
var app = express()
var session = require('express-session')
var OrientDB = require('orientjs')
var orientoStore = require('connect-oriento')(session) // OrientDB의 session 연동
var bodyParser = require('body-parser')//url을 분석하기위해
var md5 = require('md5')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var hasher = bkfd2Password()

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
  if(req.user && req.user.id){
    res.render('mainok')
  }
  else{
    res.render('main')
  }
})
//로그인
app.get('/login', function(req, res){
    res.render('login')
})
//
//로그인 확인
passport.serializeUser(function(user, done){ //aaaaaaa
  done(null, user.username)
})
passport.deserializeUser(function(id, done){
  for(var i=0; i<users.length; i++){
    var user = users[i]
    if(user.username === id){
      done(null, user)
    }
  }
  // User.findById(id, function(err, user){
  //   done(err, user)
  // })
})
passport.use(new LocalStrategy( //localStrategy의 새로운 객체 생성
  function(username, password, done){
    var userdata = {
      id:username
      pw:password
    }
    for(var i=0; i<users.length; i++){
      var user = users[i]
      if(userdata.id === user.username){
        return hasher({password:userdata.pw, salt:user.salt}, function(err, pass, salt, hash){ //
          if(hash === user.password){
              done(null, user) //aaaaaaa
          }
          else{
            done(null, false)
            res.send('Login Faield <a href="login">Login</a>')
          }
        })
      }
    }
    done(null, false)
  }
))
//LocalStrategy => serializeUser => deserializeUser 순서로 실행됨, 그후 접속될때는 deserializeUser만 실행됨
app.post('/login',
  passport.authenticate('local', //local 방식의 로그인 방식이 구현, facebook이나 twitter 등이 들어갈수 있음
    {
      successRedirect:'/main'},
      failureRedirect:'/login',
      failureFlash:false
    }
  )
)
//
//회원가입
app.get('/signup', function(req, res){
  res.render('signup')
})
//
//회원가입완료
app.post('/signup', function(req, res){
  hasher({password:req.body.password}, function(err, pass. salt, hash){
    var userdata = {
      id:req.body.id,
      pw:hash,
      salt:salt,
      email:req.body.email
    }
    users.push(userdata)
    req.login(user, function(err){ //passport모듈에 의해 생성된 함수
      req.session.save(function(){
        res.redirect('/main')
      })
    })
  })
})
//로그아웃
app.get('/logout', function(req, res){
  req.logout()
  req.session.save(function(){
    res.redirect('/main')    
  })
})
//
//게시판
app.get('/board', function(req, res){

})
//
