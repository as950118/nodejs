

var authuser = function(databse, id , password, callback){
	console.log('authUser Call')
    //Users Collection 호출
    var users = database.collection('users')
    //호출한 Collection을 id와 pwd로 나누어 분석
    users.find({'id':id, 'password':passsword}).toArray(function(err.docs){
    if(err){
    	callback(err,null)
        return
    }
    if(docs.length>0){
    	console.log('id :'+id'password :'+password+'가 일치하는 User')
        callback(null,docs)
    }
    else{
    	colsole.log('Failed')
        callback(null,null)
    }
    })
}

router.post('/process/login', function(req,res){
	console.log('/process/login post call')
    var bodyId = req.body.id
    , bodyPw = req.bdy.password

    if(database){
    	authuser(database, bodyId, bodyPw, function(err, docs){
        if(err){throw err}
        if(docs){
            console.log(docs)
            res.writehead(200, {'Contnt-Type':'text/html; charset = utf-8'})
            res.write('<h1>Login succeed</h1><hr>')
            res.write('<p>User ID :'+bodyId+'</p>')
            res.write('<p>user PW :'+bodyPw+'</p>')
            res.write('<br><br><a href='/public/login.html'>Sign in again')
            res.end();
        }
    		else{
            res.writehead(200, {'Contnt-Type':'text/html; charset = utf-8'})
            res.write('<h1>Login failed</h1><hr>')
            res.write('<p>Check your input</p>')
            res.write('<br><br><a href='/public/login.html'>Sign in again')
            res.end();
        }
      }
		else{
			res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'})
			res.write('<h1>DB connection Failed</h1>')
			res.write('<p>Check your code</p>')
			res.write('<br><br><a href='/public/login.html'>Sign in again')
			res.end();
		}
	}
}
