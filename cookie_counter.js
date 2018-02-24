var express = require('express')
var cookieParser = require('cookie-parser')
var app = express()
app.listen(3003, function(){
  console.log("3003 port")
})
app.use(cookieParser())
//카운트
app.get('/count', function(req,res){
  if(req.cookies.count){
    var count = parseInt(req.cookies.count)
  }
  else{
    var count = 0;
  }
  count = count + 1
  res.cookie('count', count)
  res.send('count : ' + count)
})
//
//쇼핑카트
var products = {
  1:{title:'History of web 1'},
  2:{title:'Next web'}
}
app.get('/products', function(req, res){
  var output = ''
  for(var name in products){
    output += `
      <li>
        <a href='/cart/${name}'>${products[name].title}</a>
      </li>
    `
  }
  res.send(`
    <h1>Products</h1>
    <ul>${output}</ul>
    <a href='/cart'>Cart</a>
    `)
})
app.get('/cart/:id', function(req, res){
  var id = req.params.id
  if(req.cookies.cart){
    var cart = req.cookies.cart //사용자의 컴퓨터에 담을 정보
  }
  else{
    var cart = {} //최초로 실행될대는 비어있는 변수
  }
  if(!cart[id]){ //아무것도 없는 값일때는 0으로 세팅해줌
    cart[id] = 0
  }
  cart[id] = parseInt(cart[id]) + 1 //쇼핑카트에 담으면 1 증가 , parseInt는 문자를 숫자로 강제변환하는 JS 문법
  res.cookie('cart', cart)
  res.redirect('/cart')
})
app.get('/cart', function(req, res){
  var cart = req.cookies.cart
  if(!cart){
    res.send('empty')
  }
  else{
    var output = ''
    for(var id in cart){
      output +=`
        <li>${products[id].title} (${cart[id]})</li>
      `
    }
    res.send(`
      <h1>Cart</h1>
      <ul>${output}</ul>
      <a href='/products'>Products list</a>
      `
    )
  }
})
//
