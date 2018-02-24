var fs = require('fs');

//sync::순서대로 진행
console.log(1)
var hello=fs.readFileSync('hello.txt',{encoding:'utf8'});
console.log(hello);
console.log(2)

//async::익명함수(에러, 반환할 변수)
fs.readFile('hello.txt',{encoding:'utf8'},function(err, hello){
  console.log(3)
  console.log(hello)
})
console.log(4)
//출력시 4 -> 3-> hello 순서로 출력됨. why? 비동기는 readfile할 동안 기다리지 않고 뒤에걸 먼저 수행함
//nodejs는 비동기를 선호함. 그래서 더 빠르기도함
