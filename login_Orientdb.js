var express = require('express')
var app = express()
var session = require('express-session')
var OrientDB = require('orientjs')
var orientoStore = require('connect-oriento')(session) // OrientDB의 session 연동
var bodyParser = require('body-parser')//url을 분석하기위해
var bkdf2Password = require('pbkdf2-password')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var hasher = bkdf2Password()

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
app.use(passport.initialize()) //passport 초기화
app.use(passport.session()) //passport를 사용할때 session을 사용

app.set('views', './views_log')
app.set('view engine', 'pug')

var server = OrientDB({
  host: 'localhost',
  port: 2424,
  username: 'root',
  password: 'password'
})
var db = server.use('log')

//메인
app.get('/main', function(req, res){
  if(req.user){
    res.render('loginok')
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
  done(null, user.id)
})
passport.deserializeUser(function(id, done){
  var sql = 'SELECT FROM log WHERE id=:id'
  db.query(sql, {params:{id:id}})
  .then(function(results){
    if(results.length === 0){
      done('There is no user')
    }
    else{
      done(null, results[0])
    }
  })
})
passport.use(new LocalStrategy( //localStrategy의 새로운 객체 생성
  function(username, password, done){
    var userdata = {
      id:username,
      pw:password
    }
    var sql = 'SELECT * FROM log WHERE id=:id'
    db.query(sql, {params:{id:userdata.id}})
    .then(function(results){
      if(results.length === 0){
        return done(null, false) //fail
      }
      var user = results[0]
      return hasher({password:userdata.pw, salt:user.salt}, function(err, pass, salt, hash){ //
        if(hash === user.pw){
          done(null, user) //success
        }
        else{
          done(null, false)
        }
      })
    })
  }
))
//LocalStrategy => serializeUser => deserializeUser 순서로 실행됨, 그후 접속될때는 deserializeUser만 실행됨
app.post('/login',
  passport.authenticate('local', //local 방식의 로그인 방식이 구현, facebook이나 twitter 등이 들어갈수 있음
    {
      successRedirect:'/main',
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
  hasher({password:req.body.password}, function(err, pass, salt, hash){
    var userdata = {
      id:req.body.username,
      pw:hash,
      salt:salt,
      email:req.body.email
    }
    var sql = 'INSERT INTO log(id, pw, salt, email) VALUES(:id, :pw, :salt, :email)'
    db.query(sql, {params:userdata})
    .then(function(reuslts){
      req.login(userdata, function(err){
        req.session.save(function(){
          res.redirect('/main')
        })
      })
    }, function(error){
      cosole.log(error)
      res.status(500)
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
