var express = require('express');
var app = express();
app.locals.pretty=true;//html코드를 깔끔하게 해주는 코드
app.set('view engine', 'pug');//pug 엔진 연결하기
app.set('views','./views');//pug가 불러올 파일들
app.get('/template', function(req, res){
  //pug는 send가 아닌 render를 사용함
  //template으로 들어온 사용자에게 temp 파일을 render 함
  res.render('temp',{time:Date(), _title:'Pug'/*temp.pug에 Date함수,_title값을 사용하기위해*/});
})
app.use(express.static('public'));//public이라는 디렉터리에서 가져옴


app.get('/topic',function(req,res){
  var topics=[
    'Javascript is',
    'Nodejs is',
    'Express is'
  ];//배열임
  console.log(topics[0])
  var output =`
  <a href="/topic?id=0">JavaScript</a><br>
  <a href="/topic?id=1">Nodejs</a><br>
  <a href="/topic?id=2">Express</a><br>
  <br>
  ${topics[req.query.id]}
  `
  res.send(output)
});

app.get('/topic/:id',function(req,res){
  var topics=[
    'Javascript is',
    'Nodejs is',
    'Express is'
  ];//배열임
  var output =`
  <a href="/topic/0">JavaScript</a><br>
  <a href="/topic/1">Nodejs</a><br>
  <a href="/topic/2">Express</a><br>
  <br>
  ${topics[req.params.id]}
  `
  res.send(output)
});

app.get('/topic/:id/:mode', function(req,res){
  res.send(req.params.id + ',' + req.params.mode)
})

app.get('/',function(req,res){
  res.send('Hello homepage');
});
//js에 html코드를 입력하는 방법(esc밑에 있는 ``를 활용)
//dynamic은 자동을 reload 되지 않고, 재 시작 해야함
//static은 자동으로 reload 됨.
//${변수}를 사용하면 문자열 사이에 변수 입력가능
app.get('/dynamic',function(req,res){
  var lis='';
  for(var i=0; i<5; i++){
    lis+='<li>Repeat</li>';
  }
  var time =Date();//시간을 불러오는 함수
  var output=
  `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title></title>
    </head>
    <body>
      Hello Dynamic!
      <ul>
        ${lis}
      </ul>
      ${time}
    </body>
  </html>
  `
  res.send(output)
});

app.get('/route',function(req,res){
  res.send('Hello router, <img src="/route.png" width=100 hegith=100>')
})

app.get('/login', function(req,res){
  res.send('<h1>Login please</h1>');
})

app.listen(3000,function(){
  console.log('Connected on 3000 port');
})
