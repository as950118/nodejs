var express = require('express')
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
//db연동
var OrientDB = require('orientjs')
var server = OrientDB({
  host: 'localhost',
  port: 2424,
  username: 'root',
  password: 'password'
})
var db = server.use('test')
//
//login
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
//데이터 추가
app.get('/topic/add', function(req, res){
  var sql = 'SELECT FROM topic'
  db.query(sql).then(function(topics){
    res.render('add', {topics:topics})
  })
})
app.post('/topic/add', function(req, res){
  var title = req.body.title
  var description = req.body.description
  var author = req.body.author
  var sql = 'INSERT INTO topic (title, description, author) VALUES(:title, :desc, :author)'
  db.query(sql, {
    params:{
      title:title,
      desc:description,
      author:author
    }})
    .then(function(topics){
      res.redirect('/topic/'+encodeURIComponent(topics[0]['@rid']))
  })
})
//
//편집하기
app.get('/topic/:id/edit', function(req, res){
  var sql = 'SELECT FROM topic'
  var id = req.params.id
  db.query(sql).then(function(topics){
    var sql = 'SELECT FROM topic WHERE @rid=:rid'
    var param = {
      params:{
        rid : id
      }
    }
    db.query(sql, param).then(function(topic){
      res.render('edit', {topics:topics, topic:topic[0]})
    })
  })
})
app.post('/topic/:id/edit', function(req, res){
  var id = req.params.id
  var sql = 'UPDATE topic SET title=:title, description=:desc, author=:author WHERE @rid=:rid'
  var title = req.body.title
  var description = req.body.description
  var author = req.body.author

  db.query(sql, {
    params:{
      title:title,
      desc:description,
      author:author,
      rid:id
    }})
    .then(function(topics){
      res.redirect('/topic/'+encodeURIComponent(id))
  })
})
//
//삭제하기
app.get('/topic/:id/del', function(req, res){
  var id = req.params.id
  var sql = 'SELECT FROM topic'
  db.query(sql)
  .then(function(topics){
    var sql = 'SELECT FROM topic WHERE @rid=:rid'
    var param = {
      params:{
        rid:id
      }
    }
    db.query(sql, param)
    .then(function(topic){
      res.render('del', {topics:topics, topic:topic[0]})
    })
  })
})
app.post('/topic/:id/del', function(req, res){
  var id = req.params.id
  var sql = 'DELETE FROM topic WHERE @rid=:rid'
  var param={params:{rid:id}}
  db.query(sql, param)
    .then(function(topics){
      res.redirect('/topic')
  })
})
//
//목록을 만들고 본문 읽기
app.get(['/topic','/topic/:id'], function(req, res){
  var sql = 'SELECT FROM topic'
  db.query(sql).then(function(topics){
    var id = req.params.id
    if(id){
      var sql = 'SELECT FROM topic WHERE @rid=:rid'
      db.query(sql, {params:{rid:id}}).then(function(topic){
        res.render('view', {topics:topics, topic:topic[0]})
      })
    }
    else{
      res.render('view', {topics:topics})
    }
  })
})
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
