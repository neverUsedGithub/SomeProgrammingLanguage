"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var lexer_1 = require("./lexer");
var parser_1 = require("./parser");
var interpreter_1 = require("./interpreter");
var fs_1 = require("fs");
var code;
var args = __spreadArray([], process.argv, true).slice(2);
if (args.length == 0) {
    console.log("Not enough arguments. Usage: node index.js <file>");
    process.exit(1);
}
else {
    code = (0, fs_1.readFileSync)(args[0], "utf8").replace(/\r\n/g, "\n");
}
var lexer = new lexer_1.Lexer();
var parser = new parser_1.Parser();
var tokens = lexer.lex(code);
var interpreter = new interpreter_1.Interpreter(code);
var ast = parser.parse(code, tokens);
interpreter.visit(ast);
