globalThis.my_print = function(x) {
    console.log(`x is: ${JSON.stringify(x, null, 2)}`);
};

const code = await Deno.readTextFile("dist/mylib.js");
//console.log(code);
(0, eval)(code);

const g = mylib.mylib({});

console.log(123);
g.demo();
const answer = g.add2(11, 22);
console.log(answer);
