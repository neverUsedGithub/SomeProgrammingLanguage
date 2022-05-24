import { Lexer } from "./lexer";
import { Parser } from "./parser"
import { Interpreter } from "./interpreter";
import { readFileSync } from "fs";

let code;
let args = [...process.argv].slice(2);

if (args.length == 0) {
    console.log("Not enough arguments. Usage: node index.js <file>");
    process.exit(1);
}
else {
    code = readFileSync(args[0], "utf8").replace(/\r\n/g, "\n");
}

const lexer: Lexer = new Lexer();
const parser: Parser = new Parser();
const tokens = lexer.lex(code);
const interpreter: Interpreter = new Interpreter(code);
const ast = parser.parse(code, tokens);
interpreter.visit(ast);