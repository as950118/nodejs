//post방식 장점 = url이 짧아지고 깔끔해짐, 고로 긴 내용을 보낼때 유리함
var express = require('express')
var app = express()
app.locals.pretty = true
app.set('view engine', 'pug')
app.set('views', './views')
app.use(express.static('public'))//public이라는 디렉터리에서 가져옴
app.get('/Postform', function(req, res){
  res.render('Postform')
})
//하단의 코드에 앞서 body-parser 모듈을 설치해야함 ''
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended:false}))

app.post('/form_receiver', function(req, res){
  var title = req.body.title
  var description = req.body.description
  res.send(title+', '+description)
})

app.listen(3000,function(){
  console.log('Connected on 3000 port');
})
