module.exports = function(){
  var OrientDB = require('orientjs')
  var server = OrientDB({
    host: 'localhost',
    port: 2424,
    username: 'root',
    password: 'password'
  })
  var db_reply = server.use('reply')
  return db_reply
}
