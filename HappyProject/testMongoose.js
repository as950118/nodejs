var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/testdb')
var db =mongoose.connection

db.on('error', function(){
  console.log('Error')
})

db.once('open', function(){
  console.log('Connected')
})

//스키마생성
var testSchema = mongoose.Schema({
  name:'string',
  age:'number',
  gender:'string'
})

//모델생성
var testModel = mongoose.model('Schema', testSchema)

//오브젝트 생성
var testObject = new testModel({name:'Heonjin', age:25, gender:'Man'})

//오브젝트 저장
testObject.save(function(error, data){
  if(error){
    console.log(error)
  }
  else{
    console.log('Save Object')
    //전체 모델 읽기
    testModel.find(function(error, testReadObject){
      console.log('**Read all**')
      if(error){
        console.log(error)
      }
      else{
        console.log("Read : "+ testReadObject)
        //특정 모델 읽기
        testModel.findOne({name:'Heonjin'}, function(error, testReadObject){
          console.log("**Read one**")
          if(error){
            console.log(error)
          }
          else{
            console.log("Read : " + testReadObject)
            //특정 모델 수정하기
            testModel.findOne({name:'Heonjin'}, function(error, testReadObject){
              console.log("**Update one**")
              if(error){
                console.log(error)
              }
              else{
                console.log("Before : " + testReadObject)
                testReadObject.name = "ChanHo"
                testReadObject.age = 26
                testReadObject.save(function(error, testUpdatedObject){
                  if(error){
                    console.log(err)
                  }
                  else{
                    console.log("After : "  + testUpdatedObject)
                    //특정 모델 삭제
                    testModel.remove({name:'Chanho'}, function(error, testResult){
                      console.log('**Delete**')
                      if(error)console.log(error)
                      else{console.log('Success Delete')}
                    })
                  }
                })
              }
            })
          }
        })
      }
    })
  }
})
