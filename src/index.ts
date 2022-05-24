import { Lexer } from "./lexer";
import { Parser } from "./parser"
import { Interpreter } from "./interpreter";

const code = `
print("ok");

`

const lexer: Lexer = new Lexer();
const parser: Parser = new Parser();
const tokens = lexer.lex(code);
console.log(tokens);
const interpreter: Interpreter = new Interpreter(code);
const ast = parser.parse(code, tokens);
console.log(ast)

interpreter.visit(ast);