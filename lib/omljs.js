var omljs = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/omljs.mjs
  var omljs_exports = {};
  __export(omljs_exports, {
    omljs: () => omljs,
    run: () => run,
    runAll: () => runAll
  });

  // src/oml2ast.mjs
  function tokenize(str) {
    const re = /[\s,]*([()\[\]{}'`]|"(?:\\.|[^\\"])*"|[$]?@(?:@@|[^@])*@|;.*|#[!# ].*|#lang[ ]+.*|#[\|][\s\S]+?[\|]#|#[a-z]+|[^\s,()\[\]{}'"`;@]*)/g;
    const result = [];
    let token;
    while ((token = re.exec(str)[1]) !== "") {
      if (token[0] === ";") continue;
      if (token.startsWith("#!")) continue;
      if (token.startsWith("##")) continue;
      if (token.startsWith("# ")) continue;
      if (token.startsWith("#lang ")) continue;
      if (token.startsWith("#|") && !token.startsWith("#|@")) continue;
      if (!token.startsWith("#@") && !token.startsWith("#|") && token.startsWith("#")) token = token.substring(1);
      if (isFinite(token)) token = parseFloat(token, 10);
      result.push(token);
    }
    return result;
  }
  function read_token(code, exp2) {
    if (code.length === 0) return void 0;
    const token = code.shift();
    exp2.push(token);
    return token;
  }
  function read_list(code, exp2, ch) {
    const result = [];
    let ast2;
    while ((ast2 = read_sexp(code, exp2, false)) !== void 0) {
      if (ast2 === "]") {
        if (ch !== "[") code.unshift("]");
        break;
      } else if (ast2 === ")") {
        break;
      }
      result.push(ast2);
    }
    return result;
  }
  function read_dict(code, exp2) {
    const result = [["#", "dict"]];
    let ast1;
    let ast2;
    while ((ast1 = read_sexp(code, exp2)) !== void 0) {
      if (ast1 === "]") continue;
      if (ast1 === "}") break;
      ast2 = read_sexp(code, exp2);
      result.push(ast1);
      result.push(ast2);
    }
    return result;
  }
  function read_sexp(code, exp2) {
    let token = read_token(code, exp2);
    if (token === void 0) return void 0;
    if (typeof token === "number") return token;
    switch (token) {
      case "false":
        return false;
      case "true":
        return true;
      case "null":
        return null;
      case "undefined":
        return ["@", "undefined"];
    }
    let ch = token[0];
    if (ch == "#") ch = token.slice(0, 2);
    if (token.startsWith("$@")) {
      ch = "$@";
    }
    switch (ch) {
      case "(":
      case "[": {
        const lst = read_list(code, exp2, ch);
        return lst;
      }
      case ")":
      case "]":
        return ch;
      case "{":
        return read_dict(code, exp2);
      case "}":
        return ch;
      case '"':
        token = token.replaceAll("\r\n", "\n");
        token = token.replaceAll("\n", "\\n");
        token = JSON.parse(token);
        return token;
      case "@":
        token = token.replace(/(^@|@$)/g, "");
        token = token.replace(/(@@)/g, "@");
        token = token.trim();
        return ["@", token];
      case "#|": {
        if (token.startsWith("#|@")) {
          token = token.replace(/^#[\|]@/g, "");
          token = token.replace(/[\|]#$/g, "");
          token = token.trim();
          return ["@", token];
        }
        if (token[0] === ":") return token;
        if (token[0] === "&") return token;
        const ids = token[0] === "." ? [token] : token.split(".");
        return ["#", ...ids];
      }
      case "$@":
        token = token.replaceAll("\r\n", "\n");
        token = token.replace(/(^[$]@|@$)/g, "");
        token = token.replace(/(@@)/g, "@");
        return ["$@", token];
      default: {
        if (token[0] === ":") return token;
        if (token[0] === "&") return token;
        const ids = token[0] === "." ? [token] : token.split(".");
        return ["#", ...ids];
      }
    }
  }
  function join_sexp(exp2) {
    if (exp2.length === 0) return "";
    let last2 = exp2.shift();
    let result = "" + last2;
    while (exp2.length > 0) {
      let token = exp2.shift();
      if (token !== ")" && token !== "]" && last2 !== "(" & last2 !== "[" && last2 !== "'")
        result += " ";
      if (token === "[") token = "(";
      if (token === "]") token = ")";
      result += token;
      last2 = token;
    }
    return result;
  }
  function oml2ast(text2) {
    const code = tokenize(text2);
    const result = [];
    while (true) {
      const exp2 = [];
      const ast2 = read_sexp(code, exp2);
      if (ast2 === void 0) break;
      if (ast2 === ")") continue;
      if (ast2 === "]") continue;
      result.push([join_sexp(exp2), ast2]);
    }
    return result;
  }
  function ast2oml(ast2) {
    if (ast2 === null) return "null";
    if (ast2 === void 0) return "undefined";
    if (typeof ast2 === "number") return JSON.stringify(ast2);
    if (typeof ast2 === "string") return JSON.stringify(ast2);
    if (typeof ast2 === "boolean") return JSON.stringify(ast2);
    if (ast2 instanceof Array) {
      let result = "( ";
      for (let i = 0; i < ast2.length; i++) {
        if (i > 0) result += " ";
        result += ast2oml(ast2[i]);
      }
      let keys = Object.keys(ast2);
      const re = /^[0-9]+/;
      keys = keys.filter((key) => !re.test(key));
      keys.sort();
      if (keys.length > 0) {
        if (ast2.length > 0) result += " ";
        result += "?";
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          result += " (";
          result += JSON.stringify(key);
          result += " ";
          result += ast2oml(ast2[key]);
          result += ")";
        }
      }
      result += " )";
      return result;
    } else {
      let result = "{ ";
      const keys = Object.keys(ast2);
      keys.sort();
      for (let i = 0; i < keys.length; i++) {
        if (i > 0) result += " ";
        result += JSON.stringify(keys[i]);
        result += " ";
        result += ast2oml(ast2[keys[i]]);
      }
      result += " }";
      return result;
    }
  }
  function astequal(a, b) {
    if (a === b) {
      return true;
    }
    if (a instanceof Function || b instanceof Function) {
      return false;
    } else if (typeof a === "object" && typeof b === "object") {
      const ak = Object.keys(a);
      const bk = Object.keys(b);
      if (ak.length !== bk.length) {
        return false;
      }
      for (let i = 0; i < ak.length; ++i) {
        const key = ak[i];
        const ret = astequal(a[key], b[key]);
        if (ret === false) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  // src/omlcommon.mjs
  var OMLCommon = class {
    is_array(x) {
      return x instanceof Array;
    }
    is_bool(x) {
      return typeof x === "boolean";
    }
    is_number(x) {
      return typeof x === "number";
    }
    is_string(x) {
      return typeof x === "string";
    }
    is_quoted(x) {
      if (!this.is_array(x)) return false;
      if (x.length === 0) return false;
      return x[0] === "`";
    }
    is_id(ast2, name = void 0) {
      const ok = ast2 instanceof Array && ast2[0] === "#";
      if (!ok) return false;
      if (name !== void 0) return ast2.length > 1 && ast2[1] === name;
      return true;
    }
    is_variable(ast2) {
      if (!(ast2 instanceof Array)) return false;
      if (ast2.length === 0) return false;
      return ast2[0] === "#";
    }
    is_script(ast2) {
      if (!(ast2 instanceof Array)) return false;
      if (ast2.length === 0) return false;
      return ast2[0] === "@";
    }
    is_template(ast2) {
      if (!(ast2 instanceof Array)) return false;
      if (ast2.length === 0) return false;
      return ast2[0] === "$@";
    }
    is_callable(ast2) {
      if (!(ast2 instanceof Array)) return false;
      if (ast2.length === 0) return false;
      if (ast2[0] === "#") return false;
      if (ast2[0] === "@") return false;
      return this.is_id(ast2[0]) || this.is_script(ast2[0]);
    }
    is_fn(ast2) {
      if (!(ast2 instanceof Array)) return false;
      if (ast2.length === 0) return false;
      return this.is_id(ast2[0]) && this.to_id(ast2[0]) === "fn";
    }
    to_id(ast2) {
      if (this.is_id(ast2)) {
        const ids = ast2.slice(1);
        return ids.join(".");
      } else if (this.is_script(ast2)) {
        return "<script>";
      }
      return ast2;
    }
    id(x) {
      return ["#", x];
    }
    to_def(ast2) {
      if (!this.is_array(ast2)) return null;
      if (ast2.length === 0) return null;
      switch (this.to_id(ast2[0])) {
        case "def": {
          if (ast2.length < 2) throw new Error("syntax error");
          const ast1 = ast2[1];
          const ast22 = ast2.length === 2 ? null : ast2[2];
          return [this.id("def"), ast1, ast22];
        }
        case "defvar": {
          if (ast2.length < 2) throw new Error("syntax error");
          const ast1 = ast2[1];
          const ast22 = ast2.length === 2 ? null : ast2[2];
          return [this.id("def"), ast1, ast22];
        }
        case "defun": {
          if (ast2.length < 3) throw new Error("syntax error");
          const new_ast = ast2.slice(3);
          new_ast.unshift(ast2[2]);
          new_ast.unshift(this.id("fn"));
          return [this.id("def"), ast2[1], new_ast];
        }
        case "define": {
          const ast1 = this.to_id(ast2[1]);
          if (ast1 instanceof Array) {
            if (ast2.length < 2) throw new Error("syntax error");
            const new_ast = ast2.slice(2);
            return this.to_def([this.id("defun"), ast2[1][0], ast2[1].slice(1), ...new_ast]);
          } else {
            if (ast2.length < 2) throw new Error("syntax error");
            const ast22 = ast2.length === 2 ? null : ast2[2];
            return this.to_def([this.id("defvar"), ast2[1], ast22]);
          }
        }
        default:
          return null;
      }
    }
  };

  // src/omljs.mjs
  var common = new OMLCommon();
  function compile_number(ast2) {
    return `number_value(${compile_ast(ast2)})`;
  }
  function compile_string(ast2) {
    return `String(${compile_ast(ast2)})`;
  }
  function compile_body_helper(body) {
    if (body.length === 0) return null;
    let result = "(";
    for (let i = 0; i < body.length; i++) {
      if (i > 0)
        result += ",";
      const def = common.to_def(body[i]);
      if (def !== null) {
        const let_ast = [common.id("let"), [[def[1], def[2]]], ...body.slice(i + 1)];
        return result + compile_ast(let_ast) + ")";
      }
      result += compile_ast(body[i]);
    }
    return result + ")";
  }
  function compile_body(ast2, start) {
    const body = [];
    for (let i = start; i < ast2.length; i++) {
      body.push(ast2[i]);
    }
    return compile_body_helper(body);
  }
  function _cond_builder_helper(rest) {
    if (rest.length === 0)
      return null;
    let condition = rest.shift();
    condition = common.to_id(condition);
    const action = rest.shift();
    switch (condition) {
      case true:
      case "else":
      case "otherwise":
        return action;
    }
    return [common.id("if"), condition, action, _cond_builder_helper(rest)];
  }
  function compile_ast(ast2) {
    if (ast2 === null)
      return "null";
    if (ast2 === void 0)
      return "undefined";
    if (typeof ast2 === "string") {
      return JSON.stringify(ast2);
    }
    if (!(ast2 instanceof Array)) {
      return ast2.toString();
    }
    if (ast2.length === 0)
      return "[]";
    if (common.is_variable(ast2)) {
      return common.to_id(ast2);
    }
    if (common.is_script(ast2)) {
      return ast2[1];
    }
    if (common.is_template(ast2)) {
      let template = ast2[1];
      template = template.replace(/(`)/g, "\\`");
      template = template.replace(/({{)/g, "${");
      template = template.replace(/(}})/g, "}");
      template = "`" + template + "`";
      return template;
    }
    if (common.is_id(ast2[0]) && common.to_id(ast2[0]) === "?") {
      return compile_ast([common.id("list"), ...ast2]);
    }
    if (!common.is_callable(ast2)) {
      return compile_ast([common.id("list"), ...ast2]);
    }
    switch (common.to_id(ast2[0])) {
      case "<script>": {
        let fcall = ast2[0][1] + "(";
        for (let i = 1; i < ast2.length; i++) {
          if (i > 1)
            fcall += ",";
          fcall += compile_ast(ast2[i]);
        }
        fcall += ")";
        return fcall;
      }
      case "begin":
        return compile_body(ast2, 1);
      case "case": {
        const cond_ast = [common.id("cond")];
        for (let i = 2; i < ast2.length; i++) {
          const e = ast2[i];
          if (common.is_id(e[0], "else") || common.is_id(e[0], "otherwise")) {
            cond_ast.push(e);
          } else {
            cond_ast.push([[common.id("equal"), common.id("__case__"), e[0]], ...e.slice(1)]);
          }
        }
        const new_ast = [common.id("let*"), [[common.id("__case__"), ast2[1]]], cond_ast];
        return compile_ast(new_ast);
      }
      case "_cond": {
        return compile_ast(_cond_builder_helper(ast2.slice(1)));
      }
      case "cond": {
        const new_ast = [];
        ast2.slice(1).forEach((x) => {
          new_ast.push(x[0]);
          new_ast.push([["#", "begin"]].concat(x.slice(1)));
        });
        new_ast.unshift(["#", "_cond"]);
        return compile_ast(new_ast);
      }
      case "dec!":
      case "inc!": {
        const sign = common.to_id(ast2[0]) === "dec!" ? "-" : "+";
        const val2 = ast2.length < 3 ? 1 : compile_ast(ast2[2]);
        return compile_ast(ast2[1]) + sign + "=" + val2;
      }
      case "def": {
        ast2 = common.to_def(ast2);
        return "globalThis." + common.to_id(ast2[1]) + "=" + compile_ast(ast2[2]);
      }
      case "define":
      case "defun":
      case "defvar": {
        ast2 = common.to_def(ast2);
        return compile_ast(ast2);
      }
      case "do":
      case "do*":
        return compile_do(ast2);
      case "fn":
      case "lambda": {
        let args = "(";
        for (let i = 0; i < ast2[1].length; i++) {
          if (i > 0)
            args += ",";
          args += common.to_id(ast2[1][i]);
        }
        args += ")";
        if (ast2.length < 3)
          return "function" + args + "{}";
        return "function" + args + "{return " + compile_body(ast2, 2) + "}";
      }
      case "dotimes": {
        let ast1 = ast2[1];
        if (!common.is_array(ast1) || common.is_quoted(ast1))
          ast1 = [common.id("$index"), ast1];
        else if (ast1.length < 2)
          throw new Error("syntax error");
        const result_exp = ast1.length < 3 ? common.id("null") : ast1[2];
        const bind = [
          [common.id("__dotimes_cnt__"), ast1[1]],
          [common.id("__dotimes_idx__"), 0, [common.id("+"), common.id("__dotimes_idx__"), 1]],
          [ast1[0], common.id("__dotimes_idx__"), common.id("__dotimes_idx__")]
        ];
        const exit = [[common.id(">="), common.id("__dotimes_idx__"), common.id("__dotimes_cnt__")], result_exp];
        ast2 = [common.id("do*"), bind, exit].concat(ast2.slice(2));
        return compile_ast(ast2);
      }
      case "length": {
        if (ast2.length != 2) return new Error("syntax error");
        return "(" + compile_ast(ast2[1]) + ").length";
      }
      case "prop-get": {
        if (ast2.length != 3) return new Error("syntax error");
        return compile_ast(ast2[1]) + "[" + compile_ast(ast2[2]) + "]";
      }
      case "prop-set!": {
        if (ast2.length != 4) return new Error("syntax error");
        return compile_ast(ast2[1]) + "[" + compile_ast(ast2[2]) + "]=" + compile_ast(ast2[3]);
      }
      case "dolist": {
        let ast1 = ast2[1];
        if (common.is_variable(ast1) || !common.is_array(ast1) || common.is_quoted(ast1))
          ast1 = [common.id("$item"), ast1];
        else if (ast1.length < 2)
          throw new Error("syntax error");
        const result_exp = ast1.length < 3 ? common.id("null") : ast1[2];
        const bind = [
          [common.id("__dolist_list__"), ast1[1]],
          [common.id("__dolist_cnt__"), [common.id("length"), common.id("__dolist_list__")]],
          [common.id("__dolist_idx__"), 0, [common.id("+"), common.id("__dolist_idx__"), 1]],
          [ast1[0], [common.id("prop-get"), common.id("__dolist_list__"), common.id("__dolist_idx__")], [common.id("prop-get"), common.id("__dolist_list__"), common.id("__dolist_idx__")]]
        ];
        const exit = [[common.id(">="), common.id("__dolist_idx__"), common.id("__dolist_cnt__")], result_exp];
        ast2 = [common.id("do*"), bind, exit].concat(ast2.slice(2));
        return compile_ast(ast2);
      }
      case "if":
        return "(" + compile_ast(ast2[1]) + "?" + compile_ast(ast2[2]) + ":" + compile_body(ast2, 3) + ")";
      case "let":
      case "let*": {
        const ast1 = ast2[1];
        const new_ast1 = [];
        for (const x of ast1) {
          if (typeof x === "string") {
            new_ast1.push(x);
            new_ast1.push(void 0);
          } else {
            new_ast1.push(x[0]);
            new_ast1.push(x[1]);
          }
        }
        return compile_ast([common.id("_" + common.to_id(ast2[0])), new_ast1].concat(ast2.slice(2)));
      }
      case "_let":
      case "_let*": {
        let vars = "(";
        let vals = "(";
        let assigns = "";
        for (let i = 1; i < ast2[1].length; i += 2) {
          if (i > 1)
            vars += ",";
          vars += common.to_id(ast2[1][i - 1]);
          const val2 = compile_ast(ast2[1][i]);
          if (i > 1)
            vals += ",";
          vals += val2;
          assigns += common.to_id(ast2[1][i - 1]) + "=" + val2 + ";";
        }
        vars += ")";
        vals += ")";
        if (common.to_id(ast2[0]) === "_let")
          return "((function" + vars + "{return " + compile_body(ast2, 2) + "})" + vals + ")";
        else
          return "((function" + vars + "{" + assigns + "return " + compile_body(ast2, 2) + "})())";
      }
      case "list": {
        ast2 = ast2.slice(1);
        let found = -1;
        for (let i = 0; i < ast2.length; i++) {
          const e = ast2[i];
          if (common.is_id(e) && common.to_id(e) === "?") {
            found = i;
            break;
          }
        }
        let list;
        let dict;
        if (found === -1) {
          list = ast2;
          dict = [];
        } else if (found === 0) {
          list = [];
          dict = ast2.slice(1);
        } else {
          list = ast2.slice(0, found);
          dict = ast2.slice(found + 1);
        }
        const body = [];
        for (let i = 0; i < list.length; i++) {
          body.push([common.id("prop-set!"), common.id("__obj__"), i, list[i]]);
        }
        for (let i = 0; i < dict.length; i++) {
          let pair = dict[i];
          if (common.is_string(pair)) pair = [pair, true];
          body.push([common.id("prop-set!"), common.id("__obj__"), pair[0], pair[1]]);
        }
        body.push(common.id("__obj__"));
        ast2 = [common.id("let*"), [[common.id("__obj__"), ["@", "[]"]]], ...body];
        return compile_ast(ast2);
      }
      case "dict": {
        if (ast2.length % 2 !== 1) throw new Error("synatx error");
        const body = [];
        for (let i = 1; i < ast2.length; i += 2) {
          body.push([common.id("prop-set!"), common.id("__dict__"), ast2[i], ast2[i + 1]]);
        }
        body.push(common.id("__dict__"));
        ast2 = [common.id("let*"), [[common.id("__dict__"), ["@", "{}"]]], ...body];
        return compile_ast(ast2);
      }
      case "set!":
      case "setq":
        return compile_ast(ast2[1]) + "=" + compile_ast(ast2[2]);
      case "throw": {
        return "(function(){throw " + compile_ast(ast2[1]) + "})()";
      }
      case "try": {
        let result = "(function(){try{return " + compile_ast(ast2[1]) + "}catch(";
        if (common.to_id(ast2[2][0]) != "catch") throw "try without catch clause";
        result += common.to_id(ast2[2][1]) + "){return " + compile_body(ast2[2], 2) + "}";
        result += "})()";
        return result;
      }
      case "until":
      case "while": {
        let condition = compile_ast(ast2[1]);
        if (common.to_id(ast2[0]) === "until")
          condition = "!" + condition;
        return "((function(){while(" + condition + "){" + compile_body(ast2, 2) + "}})(),null)";
      }
      case ".": {
        const op = "+";
        const rest = ast2.slice(1);
        const result = [];
        for (let i = 0; i < rest.length; i++) {
          if (i > 0) result.push(op);
          result.push(compile_string(rest[i]));
        }
        return result.join("");
      }
      case "=":
        return "(" + compile_ast(ast2[1]) + "===" + compile_ast(ast2[2]) + ")";
      case "%":
      case "==":
      case "===":
      case "!=":
      case "!==":
      case "<":
      case ">":
      case "<=":
      case ">=":
        return "(" + compile_number(ast2[1]) + common.to_id(ast2[0]) + compile_number(ast2[2]) + ")";
      case "&&":
      case "||":
      case "&":
      case "|":
      case "+":
      case "-":
      case "*":
      case "**":
      case "/": {
        return "(" + insert_op(common.to_id(ast2[0]), ast2.slice(1)) + ")";
      }
      default: {
        let fcall = common.to_id(ast2[0]) + "(";
        for (let i = 1; i < ast2.length; i++) {
          if (i > 1)
            fcall += ",";
          fcall += compile_ast(ast2[i]);
        }
        fcall += ")";
        return fcall;
      }
    }
  }
  function insert_op(op, rest) {
    if (rest.length === 1)
      return op + compile_number(rest[0]);
    const result = [];
    for (let i = 0; i < rest.length; i++) {
      if (i > 0) result.push(op);
      result.push(compile_number(rest[i]));
    }
    return result.join("");
  }
  function compile_do(ast2) {
    const ast1 = ast2[1];
    const parallel = ast2[0] === "do";
    const ast1_len = ast1.length;
    const ast1_vars = [];
    if (parallel) {
      ast1_vars.push("__do__");
      ast1_vars.push("new Array(" + ast1_len + ").fill(null)");
    }
    ast1.forEach((x) => {
      ast1_vars.push(x[0]);
      ast1_vars.push(x[1]);
    });
    let ast22 = ast2[2];
    if (ast22.length < 2)
      ast22 = [ast22[0], null];
    const until_ast = [common.id("until"), ast22[0]].concat(ast2.slice(3));
    if (parallel) {
      ast1.forEach((x, i) => {
        if (x.length < 3)
          return;
        const next_step = [common.id("set!"), "__do__[" + i + "]", x[2]];
        until_ast.push(next_step);
      });
      ast1.forEach((x, i) => {
        if (x.length < 3)
          return;
        const next_step = [common.id("set!"), x[0], "__do__[" + i + "]"];
        until_ast.push(next_step);
      });
    } else {
      ast1.forEach((x) => {
        if (x.length < 3)
          return;
        const next_step = [common.id("set!"), x[0], x[2]];
        until_ast.push(next_step);
      });
    }
    const new_ast = [parallel ? common.id("_let") : common.id("_let*"), ast1_vars].concat([until_ast]);
    new_ast.push(ast22[1]);
    return compile_ast(new_ast);
  }
  function omljs() {
    const glob = {};
    glob.compile_ast = (ast2, debug2) => {
      if (debug2)
        console.log(" [AST] " + JSON.stringify(ast2));
      const code = compile_ast(ast2);
      if (debug2)
        console.log("[CODE] " + code);
      return code;
    };
    glob.compile = (text2, debug2) => {
      const steps2 = oml2ast(text2);
      let result = "";
      for (const step2 of steps2) {
        const exp2 = step2[0];
        const ast2 = step2[1];
        if (debug2)
          console.log("[LISP] " + exp2);
        if (debug2)
          console.log(" [AST] " + JSON.stringify(ast2));
        const code = compile_ast(ast2);
        if (debug2)
          console.log("[CODE] " + code);
        result += code + ";\n";
      }
      return result;
    };
    glob.exec_d = (exp2) => glob.exec(exp2, true);
    glob.exec = (exp, debug) => {
      const src = exp;
      const steps = oml2ast(src);
      let last;
      let text = "";
      const tm1 = (/* @__PURE__ */ new Date()).getTime();
      for (const step of steps) {
        const exp = step[0];
        const ast = step[1];
        try {
          if (debug)
            console.log("[LISP] " + exp);
          if (debug)
            console.log(" [AST] " + JSON.stringify(ast));
          text = compile_ast(ast);
          if (debug)
            console.log("[CODE] " + text);
          const val = eval(text);
          last = val;
          let output;
          if (typeof val === "function") {
            output = "function";
          } else if (!(val instanceof Array) && val instanceof Object && Object.prototype.toString.call(val) !== "[object Object]") {
            try {
              output = Object.prototype.toString.call(val) + " " + JSON.stringify(val);
            } catch (_e) {
              ;
            }
          } else {
            try {
              output = JSON.stringify(val);
            } catch (_e) {
              ;
            }
          }
          const tm2 = (/* @__PURE__ */ new Date()).getTime();
          if (debug) {
            if (output === void 0) {
              console.log("==> (" + (tm2 - tm1) + " ms)");
              console.log(val);
            } else {
              console.log("==> " + output + " (" + (tm2 - tm1) + " ms)");
            }
          }
        } catch (e) {
          if (!debug)
            console.log("[LISP] " + exp);
          if (!debug)
            console.log(" [AST] " + JSON.stringify(ast));
          if (!debug)
            console.log("[CODE] " + text);
          console.log("[EXCEPTION]");
          if (e.stack)
            console.log(e.stack);
          else
            console.log(e);
          throw e;
        }
      }
      return last;
    };
    glob.run = (exp2) => glob.exec(exp2, true);
    glob.execAll = (exp, debug) => {
      const text = glob.compile(exp, debug);
      try {
        return eval(text);
      } catch (e) {
        if (e.stack)
          console.log(e.stack);
        else
          console.log(e);
        throw e;
      }
    };
    glob.runAll = (exp2) => {
      return glob.execAll(exp2, true);
    };
    return glob;
  }
  globalThis.omljs = omljs;
  function run(exp2) {
    const o = omljs();
    return o.run(exp2);
  }
  globalThis.run = run;
  function runAll(exp2) {
    const o = omljs();
    return o.runAll(exp2);
  }
  globalThis.runAll = runAll;
  function print(x) {
    console.log(ast2oml(x));
    return x;
  }
  globalThis.print = print;
  function number_value(x) {
    return typeof x !== "number" ? 0 : x;
  }
  globalThis.number_value = number_value;
  function equal(a, b) {
    return astequal(a, b);
  }
  globalThis.equal = equal;
  return __toCommonJS(omljs_exports);
})();
