export function mylib(glob) {
    glob.demo = function ()  {
        glob.add2 = function (a, b) {
            var answer = a + b;
            my_print(answer);
            return answer;
        };
    };
    return glob;
};
