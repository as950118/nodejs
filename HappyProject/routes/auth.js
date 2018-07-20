module.exports = function(passport){
  var app = require('express').Router()
  var bkdf2Password = require('pbkdf2-password')
  var hasher = bkdf2Password()
  var db_log = require('./db_log.js')()
  var db_board = require('./db_board.js')()
  var db_reply = require('./db_reply.js')()
  require('date-utils')
  var newDate = new Date()
  var multer = require('multer')
  var storage = multer.diskStorage({
    destination : function(req, file, cb){
      cb(null, 'public/')
    },
    filename : function(req, file, cb){
      cb(null, file.originalname)
    }
  })
  var upload = multer({storage:storage})



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

  //회원가입
  app.get('/signup', function(req, res){
    console.log('Signup')
    if(req.session.passport && req.session.passport.user){
      res.redirect('/main')
    }
    else{
      res.render('signup')
    }
  })
  app.post('/signup', function(req, res){
    hasher({password:req.body.password}, function(err, pass, salt, hash){
      var sql = 'INSERT INTO log(id, pw, salt, email, date) VALUES(:id, :pw, :salt, :email, :date)'
      var userdata = {
        id:req.body.username,
        pw:hash,
        salt:salt,
        email:req.body.email,
        date:newDate.toFormat('YYYY-MM-DD HH24:MI:SS')
      }
      //중복검사
      var sql = 'SELECT FROM log WHERE id=:id OR email=:email'
      db_log.query(sql, {params:userdata})
      .then(function(results){
        if(results){
          console.log('Already Existed ID or Email')
          res.redirect('/signup')
        }
        else{
          db_log.query(sql, {params:userdata})
          .then(function(reuslts){
            req.login(userdata, function(err){
              req.session.save(function(){
                console.log('Complete Signup')
                res.redirect('/main')
              })
            })
          }, function(error){
            console.log(error)
            res.status(500)
          })
        }
      })
    })
  })
  //

  //instagram passport
  app.get('/auth/instagram',
    passport.authenticate('instagram'),
    function(req,res){
    }
  )
  app.get('/auth/instagram/callback',  passport.authenticate('instagram',
    {failureRedirect:'/login'}),
    function(req, res){
      res.redirect('/main')
  })

  //로그인
  app.get('/login', function(req, res){
    console.log('Login')
    if(req.session.passport && req.session.passport.user){
      res.redirect('/main')
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

  //로그아웃
  app.get('/logout', function(req, res){
    req.logout()
    req.session.save(function(){
      res.redirect('/main')
    })
  })
  //

  //회원정보
  app.get('/profile/:id', function(req, res){
    var sql = 'SELECT FROM log WHERE id=:id'
    var param = {
      params:{
        id:req.params.id
      }
    }
    db_log.query(sql, param)
    .then(function(results){
      res.render('profile', {results:results[0], id:req.session.passport.user})
    })
  })
  //

  //게시판
  app.get('/board/:num', function(req, res){
    console.log('Board')
    var sql = 'SELECT FROM board WHERE available==true ORDER BY no DESC'
    db_board.query(sql)
    .then(function(results){
      if(req.session.passport && req.session.passport.user){
        var id = req.session.passport.user
      }
      else{
        var id = ''
      }
      res.render('board', {results:results, id:id, num:req.params.num})
    })
  })
  //

  //게시판2
  app.get('/board_2', function(req,res){
    console.log('Board2')
    var sql = 'SELECT FROM board WHERE available==true ORDER BY no DESC'
    db_board.query(sql)
    .then(function(results){
      if(req.session.passport && req.session.passport.user){
        var id = req.session.passport.user
      }
      else{
        var id = ''
      }

    res.render('board_2', {results:results, id:id, num:req.params.num})
  })
  })

  //글쓰기
  app.get('/write', function(req, res){
    console.log('Write')
    if(req.session.passport && req.session.passport.user){
      res.render('write', {id:req.session.passport.user})
    }
    else{
      console.log('Failed auth')
      res.redirect('/main')
    }
  })
  app.post('/write', upload.single('userfile'), function(req, res){
    var sql ='SELECT FROM board ORDER BY no'
    db_board.query(sql)
    .then(function(results){
      // //첫번째 글일경우
      // if(results.length===0){
      //   var no = 1
      // }
      // else{
      //   var no = results[results.length-1].no + 1
      // }
      //로직이 비효율적이라 그냥 첫번째글은 공지로 하고 진행
      var len = results[results.length-1].no + 1
      var board = {
        params:{
          title:req.body.title,
          content:req.body.content,
          id:req.user.id,
          //pw:req.user.hash,
          salt:req.user.salt,
          date:newDate.toFormat('YYYY-MM-DD HH24:MI:SS'),
          no:len,
          view:0,
          available:1,
          filename:req.file.originalname
        }
      }
      var sql = 'INSERT INTO board(title, content, id, pw, date, no, view, salt, available, filename) VALUES(:title, :content, :id, :pw, :date, :no, :view, :salt, :available, :filename)'
      db_board.query(sql, board)
      .then(function(reuslts2){
        console.log('Complete Write + ' + req.file.originalname)
        res.redirect('/view/'+len)
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
      //댓글 불러오기
      var sql = 'SELECT FROM reply WHERE board_no=:no ORDER BY no'
      db_reply.query(sql, param)
      .then(function(results_reply){
        //조회수 증가
        var sql = 'UPDATE board SET view=:view WHERE no=:no'
        var param = {
          params:{
            view:results[0].view + 1,
            no:results[0].no
          }
        }
        db_board.query(sql, param)
        .then(function(results2){
          console.log('results2 :' + results2)
          console.log('Complete Select : ' + results[0].no)
          if(req.session.passport && req.session.passport.user){
            var id = req.session.passport.user
          }
          else{
            var id = ''
          }
            res.render('view', {results:results[0], id:id, results_reply:results_reply})
        })
      })
    })
  })
  //

  //글삭제
  app.get('/delete/:no/:id', function(req, res){
    console.log('Delete : ' + req.params.no)
    if(req.params.id === req.session.passport.user){
      var sql = 'UPDATE board SET available=:available WHERE no=:no'
      var param ={
        params:{
          no:parseInt(req.params.no),
          available:0
        }
      }
    //아예삭제하면 기록이 안남아서 안됨 !
    //   var sql = 'DELETE FROM board WHERE no=:no'
    //   var param = {
    //     params:{
    //       no:parseInt(req.params.no)
    //     }
    //   }
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

  //댓글
  app.post('/reply', function(req, res){
    var sql = 'SELECT FROM reply'
    db_reply.query(sql)
    .then(function(results){
      //첫번째 댓글일경우
      if(results.length===0){
        var len = 1
      }
      else{
        var len = results[results.length-1].no + 1
      }
      var sql = 'INSERT INTO reply(board_no, no, id, reply, date) VALUES(:board_no, :no, :id, :reply, :date)'
      var param = {
        params:{
          board_no:req.body.board_no,
          id:req.session.passport.user,
          no:len,
          reply:req.body.reply,
          date:newDate.toFormat('YYYY-MM-DD HH24:MI:SS')
        }
      }
      db_reply.query(sql, param)
      .then(function(results){
        console.log("Complete Reply : " + results[0].board_no + ' ' + results[0].no)
        res.redirect('/view/' + results[0].board_no)
      })
    })
  })

  //댓글 삭제
  app.get('/delete_reply/:no/:id', function(req, res){
    if(req.params.id === req.session.passport.user){
      var sql = 'UPDATE reply SET available=:available WHERE no=:no'
      var param = {
        params:{
          no:req.params.no,
          available:0
        }
      }
      db_reply.query(sql, param)
      .then(function(results){
        console.log('Complete Delete Reply')
        res.redirect('/view/' + req.params.no)
      })
    }
    else{
      console.log('Auth Failed')
      res.redirect('/view/' + req.params.no)
    }
  })
  //

  //검색
  app.post('/search', function(req, res){
    var sel = req.body.select
    var sql = 'SELECT FROM board WHERE title=:search'
    if(sel === 'title'){
    }
    else if(sel === 'content'){

    }
    else if(sel === 'titlecontent'){

    }
    else if(sel === 'reply'){

    }
    else if(sel === 'id'){

    }
    var param = {
      params:{
        search:req.body.search
      }
    }
  })
  //


  return app
}
