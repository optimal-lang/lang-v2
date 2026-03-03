import { mylib } from "./src/mylib.mjs";

globalThis.my_print = function(x) {
    console.log(`x is: ${JSON.stringify(x, null, 2)}`);
};

var g = mylib({});

console.log(123);
g.demo();
var answer = g.add2(11, 22);
console.log(answer);
