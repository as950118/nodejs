var express = require('express')
var app = express()
var bodyParser = require('body-parser')//url을 분석하기위해
var fs = require('fs')//파일을 쓰고지우기위한 모듈
app.use(bodyParser.urlencoded({extended:false}))//extended:false가 무엇을 의미하는지??
app.locals.pretty = true//template의 줄바꿈을 자동으로 해줌
app.listen(3000, function(){
  console.log('Connected 3000 port')
})
//Routing
app.set('views', './views_test')//template 파일들은 views_test폴더 둔다
app.set('view engine', 'pug')//어떤 template 엔진을  쓸지
app.get('/topic/new', function(req, res){
  res.render('new')
})

//목록을 만들기
app.get('/topic', function(req, res){
  fs.readdir('data', function(err, files){//data 디렉터리에서 가져옴
    if(err){
      res.status(500).send('Internal Server Error')
      console.log(err)
    }
    res.render('view', {topics:files})
  })
})
//
//본문읽기
app.get('/topic/:id', function(req, res){//':'는 변수의 의미
  var id = req.params.id
  fs.readdir('data', function(err, files){//data 디렉터리에서 가져옴
    if(err){
      res.status(500).send('Internal Server Error')
      console.log(err)
    }
    fs.readFile('data/'+id, 'utf8', function(err, data){
      if(err){
        res.status(500).send('Internal Server Error')
        console.log(err)
      }
      res.render('view', {topics:files, title:id, description:data})
    })
  })
})
//
app.post('/topic', function(req, res){
  var title = req.body.title
  var description = req.body.description
  fs.writeFile('data/'+title, description, function(err){//fs에 관한 것은 nodejs api에서 검색
    if(err){
      res.status(500).send('Internal Server Error')//error 코드
      console.log(err)
    }
      res.send('Connected router ')//잘 연결될때
  })
})
