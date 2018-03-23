var testClient = require('mongodb').MongoClient

testClient.connect('mongodb://localhost:27017/testdb', function(error, db){
  if(error)console.log(error)
  else{
    var testObject = {name:'Heonjin', age:25, gender:'Man'}

    db.collection.insert([testObject])
    //console.log("Connected" + db)
    db.close
  }
})
