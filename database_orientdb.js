var OrientDB = require('orientjs')

var server = OrientDB({
  host: 'localhost',
  port: 2424,
  username: 'root',
  password: 'password'
})

var db = server.use('test')
db.record.get('#18:0')
.then(function(record){
  console.log('Loaded record:', record.title)
})

//CRUD
/*Create
var sql1 = 'SELECT FROM topic WHERE @rid=:id'
var param1 = {
  params:{
    id:'#18:0'
  }
}
db.query(sql1, param1).then(function(results){
  console.log(results)
})

*/
/*Insert
var sql2='INSERT INTO topic (title, description) VALUES(:title, :desc)'
var param2={
  params:{
    title:'Express',
    desc:'Express is ..'
  }
}
db.query(sql2, param2).then(function(results){
  console.log(results)
})
*/
//Update
var sql3='UPDATE topic SET title=:title WHWER @rid=:rid)'
db.query(sql3, {
  params:{
    title:'Expressjs', rid:'#12:2'
  }
  .then(function(req, res))
})

//
