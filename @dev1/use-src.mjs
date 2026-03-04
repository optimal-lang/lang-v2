import { mylib } from "./src/mylib.mjs";

globalThis.my_print = function(x) {
    console.log(`x is: ${JSON.stringify(x, null, 2)}`);
};

const g = mylib({});

console.log(123);
g.demo();
const answer = g.add2(11, 22);
console.log(answer);
