//get방식 단점 = url이 길어지면 짤릴수도있음, url에 전송하려는 데이터가 그대로 드러남
var express = require('express')
var app = express()
app.locals.pretty = true
app.set('view engine', 'pug')
app.set('views', './views')
app.use(express.static('public'))//public이라는 디렉터리에서 가져옴
//입력받아서 출력하기
app.get('/form', function(req, res){
  res.render('form')
})

app.get('/form_receiver', function(req, res){
  var title = req.query.title
  var description = req.query.description
  res.send(title + ', ' + description)
})

//semantic URL = 의미론적 URL = 좀 더 깔끔한 URL 구성가능
app.get('/topic/:param_id', function(req, res){
  var topics = [
    'Javascript is..',
    'Nodejs is..',
    'Express is..'
  ]//배열임
  var output =`
    <a href="/topic?id=0">JavaScript</a><br>
    <a href="/topic?id=1">Nodejs</a><br>
    <a href="/topic?id=2">Express</a><br>
    <br>
    ${topics[req.params.param_id]}
    `//semantic에서는 query가 아닌 params를 사용해야함
    res.send(output)
})

/*
app.get('/topic', function(req, res){
  var topics = [
    'Javascript is..',
    'Nodejs is..',
    'Express is..'
  ]//배열임
  var output =`
    <a href="/topic/0">JavaScript</a><br>
    <a href="/topic/1">Nodejs</a><br>
    <a href="/topic/2">Express</a><br>
    <br>
    ${topics[req.query.id]}
    `
    res.send(output)
})
*/

/*
app.get('/topic', function(req, res){
  res.send(req.query.id)//url을 통해 들어온 값이 첫번째 매개변수인 req의 query라는 객체의 id라는 프로퍼티값으로 들어오고 출력됨
  //res.send(req.query.id)으로 하면 topic?id= 뒤에 들어오는 값이 출력됨
  //res.send(req.query.id+','res.send(req.query.name))으로 하면 topic?id={}&name={}형식으로 입력받게됨
  //더 궁금한게 있다면 expressjs.com의 api에서 찾아보도록하자
})
*/
app.listen(3000,function(){
  console.log('Connected on 3000 port');
})
