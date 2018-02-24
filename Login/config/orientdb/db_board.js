module.exports = function(){
  var OrientDB = require('orientjs')
  var server = OrientDB({
    host: 'localhost',
    port: 2424,
    username: 'root',
    password: 'password'
  })
  var db_board = server.use('board')
  return db_board
}
