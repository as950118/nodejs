var express = require('express')
var mongoose = require('mongoose')
var app = express()
var bodyParser = require('body-parser')//url을 분석하기위해
var multer = require('multer')//file upload
var _storage = multer.diskStorage({
  destination : function(req, file, cb){
    cb(null, 'uploads/')
  },
  filename : function(req, file, cb){
    cb(null, file.originalname)
  }
})
var upload = multer({storage:_storage})
var fs = require('fs')//파일을 쓰고지우기위한 모듈
app.use(bodyParser.urlencoded({extended:false}))//extended:false가 무엇을 의미하는지??
app.locals.pretty = true//template의 줄바꿈을 자동으로 해줌
app.listen(3000, function(){
  console.log('Connected 3000 port')
})
//Routing
app.set('views', './views_test')//template 파일들은 views_test폴더 둔다
app.set('view engine', 'pug')//어떤 template 엔진을  쓸지
//
//login
var db = mongoose.connection
db.on('error', console.error)
db.once('open', function(req, res){
  console.log('Connected Mongodb Server')
})
mongoose.connect('mongdb://localhost/mongodb_tutorial')
app.listen(3000, function(){
  console.log('Connected 3000 port')
})
//추가
app.get('/topic/new', function(req, res){
  res.render('new')
})
//
//Upload
app.use('/user', express.static('uploads'))
app.get('/upload', function(req, res){
  res.render('upload')
})
app.post('/upload', upload.single('avatar'), function(req, res){
  console.log(req.file)
  res.send('Uploaded : ' + req.file.originalname)
})
//
//목록을 만들고 본문 읽기
app.get(['/topic','/topic/:id'], function(req, res){
  var sql = 'SELECT FROM topic'
  db.query(sql).then(results){
    res.send(results)
  }

  fs.readdir('data', function(err, files){//data 디렉터리에서 가져옴
    if(err){
      res.status(500).send('Internal Server Error')
      console.log(err)
    }
    var id = req.params.id
    if(id){//id 값이 있을때
      fs.readFile('data/'+id, 'utf8', function(err, data){
        if(err){
          res.status(500).send('Internal Server Error')
          console.log(err)
        }
        res.render('view', {topics:files, title:id, description:data})
      })
    }
    else{//id 값이 없을때
          res.render('view', {topics:files, title:'Hello', description:'World!'})
    }
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
      res.redirect('/topic/'+title)//잘 연결될때
  })
})
