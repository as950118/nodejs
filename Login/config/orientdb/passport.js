module.exports = function(app){
  var passport = require('passport')
  var LocalStrategy = require('passport-local').Strategy
  var bkdf2Password = require('pbkdf2-password')
  var hasher = bkdf2Password()
  var db_log = require('./db_log.js')()

  app.use(passport.initialize()) //passport 초기화
  app.use(passport.session()) //passport를 사용할때 session을 사용

  passport.serializeUser(function(user, done){ //aaaaaaa
    done(null, user.id)
  })
  passport.deserializeUser(function(id, done){
    var sql = 'SELECT FROM log WHERE id=:id'
    db_log.query(sql, {params:{id:id}})
    .then(function(results){
      if(results.length === 0){
        done('There is no user')
      }
      else{
        done(null, results[0])
      }
    })
  })
  passport.use(new LocalStrategy( //localStrategy의 새로운 객체 생성
    function(username, password, done){
      var userdata = {
        id:username,
        pw:password
      }
      var sql = 'SELECT * FROM log WHERE id=:id'
      db_log.query(sql, {params:{id:userdata.id}})
      .then(function(results){
        if(results.length === 0){
          return done(null, false) //fail
        }
        var user = results[0]
        return hasher({password:userdata.pw, salt:user.salt}, function(err, pass, salt, hash){ //
          if(hash === user.pw){
            done(null, user) //success
          }
          else{
            done(null, false)
          }
        })
      })
    }
  ))


  return passport
}
