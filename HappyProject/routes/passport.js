module.exports = function(app){
  var passport = require('passport')
  var LocalStrategy = require('passport-local').Strategy
  var InstagramStrategy = require('passport-instagram').Strategy
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
      var filter = userdata.id.split('')
      for(var i in filter){
      	if(filter[i]==="'"||filter[i]==='"'||filter[i]==="="||filter[i]==="<"||filter[i]===">"){
        	console.log('SQL INJECTION')
        	return done(null, false)
        }
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

  passport.use(new InstagramStrategy({
    clientID : "40a02b278e1c48f2b7981851eb1652d4",
    clientSecreet : "5261e814d957445a99fea8006d8d13fa",
    callbackURL: "http://localhost:3003/auth/instagram/callback"
    },
    function(accessToken, refreshToken, profile, done){
      User.findOrCreate({instagramId : profile.id}, function(err, user){
      return done(err,user)
      })
    }
  ))


  return passport
}
