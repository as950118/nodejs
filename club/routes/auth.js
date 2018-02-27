module.exports = function(passport){
  var app = require('express').Router()
  var bkdf2Password = require('pbkdf2-password')
  var hasher = bkdf2Password()
  var db_log = require('./db_log.js')()
  var db_board = require('./db_board.js')()
  require('date-utils')
  var newDate = new Date()
  //메인
  app.get('/main', function(req, res){
    console.log('Main')
    if(req.session.passport){
      res.render('main', {id:req.session.passport.user})
    }
    else{
      res.render('main', {id:''})
    }
  })
  //
  //로그인
  app.get('/login', function(req, res){
    console.log('Login')
    if(req.session.passport){
      if(req.session.passport.user){
        res.redirect('/main')
      }
      else{
        res.render('login')
      }
    }
    else{
      res.render('login')
    }
  })
  app.post('/login',
    passport.authenticate('local', //local 방식의 로그인 방식이 구현, facebook이나 twitter 등이 들어갈수 있음
      {
        successRedirect:'/main',
        failureRedirect:'/login',
        failureFlash:false
      }
    )
    ,function(){
      console.log('Complete Login')
    }
  )
  //

  //회원가입
  app.get('/signup', function(req, res){
    console.log('Signup')
    if(req.session.passport.user){
      res.redirect('/main')
    }
    else{
      res.render('signup', {id:req.session.passport.user})
    }
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
            console.log('Complete Signup')
            res.redirect('/main')
          })
        })
      }, function(error){
        cosole.log(error)
        res.status(500)
      })
    })
  })
  //

  //게시판
  app.get('/board/:num', function(req, res){
    console.log('Board')
    var sql = 'SELECT FROM board ORDER BY no DESC'
    db_board.query(sql)
    .then(function(results){
      res.render('board', {results:results, id:req.session.passport.user, num:req.params.num})
    })
  })
  //

  //글쓰기
  app.get('/write', function(req, res){
    console.log('Write')
    if(req.session.passport.user){
      res.render('write', {id:req.session.passport.user})
    }
    else{
      console.log('Failed auth')
      res.redirect('/main')
    }
  })
  app.post('/write', function(req, res){
    var sql ='SELECT FROM board ORDER BY no'
    db_board.query(sql)
    .then(function(results){
      var board = {
        params:{
          title:req.body.title,
          content:req.body.content,
          id:req.user.id,
          pw:req.user.hash,
          salt:req.user.salt,
          date:newDate.toFormat('YYYY-MM-DD HH24:MI:SS'),
          no:results[results.length-1].no + 1,
          view:0
        }
      }
      var sql = 'INSERT INTO board(title, content, id, pw, date, no, view, salt) VALUES(:title, :content, :id, :pw, :date, :no, :view, :salt)'
      db_board.query(sql, board)
      .then(function(reuslts2){
        console.log('Complete Write')
        res.redirect('/board/1')
      }, function(error){
        console.log(error)
        res.status(500)
      })
    })
  })
  //

  //글읽기
  app.get('/view/:no', function(req, res){
    var sql = 'SELECT FROM board WHERE no=:no'
    var param = {
      params:{
        no:parseInt(req.params.no)
      }
    }
    db_board.query(sql, param)
    .then(function(results){
      var sql = 'UPDATE board SET view=:view WHERE no=:no'
      var param = {
        params:{
          view:results[0].view + 1,
          no:results[0].no
        }
      }
      db_board.query(sql, param)
      .then(function(results2){
        console.log('Complete Select : ' + results[0].no)
        res.render('view', {results:results[0], id:req.session.passport.user})
      })
    })
  })
  //

  //글삭제
  app.get('/delete/:no/:id', function(req, res){
    console.log('Delete : ' + req.params.no)
    if(req.params.id === req.session.passport.user){
      var sql = 'DELETE FROM board WHERE no=:no'
      var param = {
        params:{
          no:parseInt(req.params.no)
        }
      }
      db_board.query(sql, param)
      .then(function(results){
        console.log('Complete Delete')
        res.redirect('/board/1')
      })
    }
    else{
      res.redirect('/view/' + req.params.no)
    }
  })

  //

  //글수정
  app.get('/update/:no/:id', function(req, res){
    console.log('Update')
    if(req.params.id === req.session.passport.user){
      var sql = 'SELECT FROM board WHERE no=:no'
      var param = {
        params:{
          no:parseInt(req.params.no)
        }
      }
      db_board.query(sql, param)
      .then(function(results){
        console.log('Complete Update : ' + results[0].no)
        res.render('update', {results:results[0], id:req.session.passport.user})
      })
    }
    else{
      console.log('Failed auth')
      res.redirect('/main')
    }
  })
  app.post('/update', function(req,res){
    console.log(req.body)
    var sql = 'UPDATE board SET title=:title, content=:content, date=:date WHERE no=:no'
    var param = {
      params:{
        title:req.body.title,
        content:req.body.content,
        date:newDate.toFormat('YYYY-MM-DD HH24:MI:SS'),
        no:req.body.no
      }
    }
    db_board.query(sql, param)
      .then(function(results){
          res.redirect('/view/' + req.body.no)
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
