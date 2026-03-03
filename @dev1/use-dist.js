globalThis.my_print = function(x) {
    console.log(`x is: ${JSON.stringify(x, null, 2)}`);
};

var code = await Deno.readTextFile("dist/mylib.js");
//console.log(code);
(0, eval)(code);

var g = mylib.mylib({});

console.log(123);
g.demo();
var answer = g.add2(11, 22);
console.log(answer);
