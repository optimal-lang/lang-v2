function main() {
    g.echo('hello');
    globalThis.add2 = function(a, b) { return a + b; };
    g.echo(add2(11, 22));
}
