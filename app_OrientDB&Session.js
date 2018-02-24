var express = require('express')
var app = express()
var session = require('express-session')
var orientoStore = require('connect-oriento')(session) // OrientDB의 session 연동
var bodyParser = require('body-parser')//url을 분석하기위해
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
//로그인
app.get('/auth/login', function(req, res){
  var output = `
    <h1>Login</h1>
    <form action='/auth/login' method='post'>
      <p>
        <input type='text' name ='username' placeholder='username'>
      </p>
      <p>
        <input type='password' name='password' placeholder='password'>
      </p>
      <p>
        <input type='submit'>
      </p>
    </form>
  `
  res.send(output);
})
app.post('/auth/login', function(req, res){
  var id = req.body.username
  var pw = req.body.password
  var user = {
    username:'heonjin',
    password:'password',
    displayName:'Heonjin Jeong'
  }
  if(id === user.username && pw === user.password){
    req.session.displayName = user.displayName //화면에 보여줄 아이디를 저장함
    req.session.save(function(){ //user의 data가 저장될 시간을 주기위해 callback함수 설정
      res.redirect('/welcome')
    })
  }
  else{
    res.send('Login Failed .. <a href="/auth/login">Login</a>')
  }
})
app.get('/welcome', function(req, res){
  if(req.session.displayName){ // 저장된 값이 없다 == 로그인하지 않고 직접 접근했을때
    var output = `
      <h1>Hello, ${req.session.displayName}</h1>
      <a href='/auth/logout'>Logout</a>
    `
  }
  else{
    var output= `
      <h1>Welcome</h1>
      <a href='/auth/login'>Login</a>
    `
  }
  res.send(output)
})
app.get('/auth/logout', function(req, res){
  delete req.session.displayName //JavaScript의 명렁어를 사용해서 지음
  req.session.save(function(){ //user의 data가 지워질 시간을 주기위해 callback함수 설정
    res.redirect('/welcome')
  })
})
//
