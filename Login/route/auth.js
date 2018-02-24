module.exports = function(passport){
  var app = require('express').Router()
  var bkdf2Password = require('pbkdf2-password')
  var hasher = bkdf2Password()
  var db_log = require('../config/orientdb/db_log.js')()
  var db_board = require('../config/orientdb/db_board.js')()

  //메인
  app.get('/main', function(req, res){
    if(req.session.id && req.user){
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

  app.get('/signup', function(req, res){
    res.render('signup')
  })

  app.post('/signup', function(req, res){
    hasher({password:req.body.password}, function(err, pass, salt, hash){
      var userdata = {
        id:req.body.username,
        pw:hash,
        salt:salt,
        email:req.body.email
      }
      var sql = 'INSERT INTO log(id, pw, salt, email) VALUES(:id, :pw, :salt, :email)'
      db_log.query(sql, {params:userdata})
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

  //게시판
  app.get('/board', function(req, res){
    var sql = 'SELECT FROM board'
    db_board.query(sql)
    .then(function(results){
      if(req.user){
        res.render('boardok', {results:results})
      }
      else{
        res.render('board', {results:results})
      }
    })
  })

  //글쓰기
  app.get('/write', function(req, res){
    if(req.user){
      res.render('write')
    }
    else{
      res.render('main')
    }
  })
  app.post('/write', function(req, res){
    var sql ='SELECT FROM board'
    db_board.query(sql)
    .then(function(results){
      var board = {
        params:{
          title:req.body.title,
          content:req.body.content,
          id:req.user.id,
          pw:req.user.hash,
          salt:req.user.salt,
          date:new Date(),
          no:parseInt(results.length)+1,
          view:0
        }
      }
      var sql = 'INSERT INTO board(title, content, id, pw, date, no, view, salt) VALUES(:title, :content, :id, :pw, :date, :no, :view, :salt)'
      db_board.query(sql, board)
      .then(function(reuslts){
        res.redirect('/main')
      }, function(error){
        console.log(error)
        res.status(500)
      })
    })
  })
  //

  //글읽기
  app.post('/view', function(req, res){
    var sql = 'SELECT FROM board WHERE no=:no'
    console.log(req.body)
    var param = {
      params:{
        no:req.params.no
      }
    }
    db_board.query(sql, param)
    .then(function(results){
      res.render('view', {results:results})
    })
  })
  //

  //로그아웃
  app.get('/logout', function(req, res){
    req.logout()
    req.session.save(function(){
      res.redirect('/main')
    })
  })

  return app
}
