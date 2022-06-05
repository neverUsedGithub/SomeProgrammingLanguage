"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = exports.Token = exports.TokenType = void 0;
var error_1 = require("./error");
exports.TokenType = {
    LEFT_PAREN: "lparen",
    RIGHT_PAREN: "rparen",
    LEFT_BRACE: "lbrace",
    RIGHT_BRACE: "rbrace",
    COMMA: "comma",
    DOT: "dot",
    MINUS: "minus",
    PLUS: "plus",
    SEMICOLON: "semicolon",
    SLASH: "slash",
    STAR: "star",
    INTEGER: "integer",
    STRING: "string",
    BOOLEAN: "bool",
    IDENTIFIER: "identifier",
    EQUAL: "equal",
    KEYWORD: "keyword",
    EOF: "eof",
    LESSTHAN: "lessthan",
    MORETHAN: "morethan",
    NOT: "not",
    FLOAT: "float"
};
var Token = /** @class */ (function () {
    function Token(type, value, line, column) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.column = column;
    }
    return Token;
}());
exports.Token = Token;
var Lexer = /** @class */ (function () {
    function Lexer() {
    }
    Lexer.prototype.advance = function () {
        this.index++;
        this.current = null;
        if (this.index < this.input.length) {
            this.current = this.input[this.index];
        }
        this.colno++;
    };
    Lexer.prototype.back = function () {
        this.index--;
        this.current = null;
        if (this.index >= 0) {
            this.current = this.input[this.index];
        }
        this.colno--;
    };
    Lexer.prototype.peek = function () {
        if (this.index + 1 < this.input.length) {
            return this.input[this.index + 1];
        }
        return null;
    };
    Lexer.prototype.lex = function (str) {
        this.input = str;
        this.index = -1;
        this.tokens = [];
        this.colno = 0;
        this.lineno = 0;
        this.advance();
        var SINGLE_TOKENS = {
            "/": exports.TokenType.SLASH,
            "*": exports.TokenType.STAR,
            ";": exports.TokenType.SEMICOLON,
            ".": exports.TokenType.DOT,
            ",": exports.TokenType.COMMA,
            "(": exports.TokenType.LEFT_PAREN,
            ")": exports.TokenType.RIGHT_PAREN,
            "{": exports.TokenType.LEFT_BRACE,
            "}": exports.TokenType.RIGHT_BRACE,
            "-": exports.TokenType.MINUS,
            "+": exports.TokenType.PLUS,
            "=": exports.TokenType.EQUAL,
            "<": exports.TokenType.LESSTHAN,
            ">": exports.TokenType.MORETHAN,
            "!": exports.TokenType.NOT,
        };
        var NUMBERS = "0123456789";
        var ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var SPECIAL = "_";
        var KEYWORDS = ["func", "var", "return", "true", "false", "if", "while"];
        var WHITESPACE = " \t";
        while (this.current !== null) {
            if (Object.keys(SINGLE_TOKENS).indexOf(this.current) !== -1) {
                this.tokens.push(new Token(SINGLE_TOKENS[this.current], this.current, this.lineno, this.colno));
            }
            else if (this.current === "\n") {
                this.lineno++;
                this.colno = -1;
            }
            else if (NUMBERS.indexOf(this.current) !== -1 &&
                this.peek() && this.peek() === ".") {
                var value = this.current + this.peek();
                var start = this.colno;
                this.advance();
                this.advance();
                while (NUMBERS.indexOf(this.current) !== -1) {
                    value += this.current;
                    this.advance();
                }
                this.back();
                this.tokens.push(new Token(exports.TokenType.FLOAT, value, this.lineno, start));
            }
            else if (NUMBERS.indexOf(this.current) !== -1) {
                var value = "";
                var start = this.colno;
                while (NUMBERS.indexOf(this.current) !== -1) {
                    value += this.current;
                    this.advance();
                }
                this.back();
                this.tokens.push(new Token(exports.TokenType.INTEGER, value, this.lineno, start));
            }
            else if (this.current === "#") {
                this.advance();
                /// @ts-expect-error
                while (this.current !== "\n") {
                    this.advance();
                }
                this.back();
            }
            else if (this.current === "\"") {
                var value = "";
                var start = this.colno;
                this.advance();
                while (this.current !== null) {
                    if (this.current === "\"") {
                        if (value.length > 0 && value[value.length - 1] === "\\") {
                            value = value.substring(0, value.length - 1);
                            value += "\"";
                            this.advance();
                            continue;
                        }
                        else {
                            break;
                        }
                    }
                    value += this.current;
                    this.advance();
                }
                this.tokens.push(new Token(exports.TokenType.STRING, value, this.lineno, start));
            }
            else if ((ALPHABET + SPECIAL).indexOf(this.current) !== -1) {
                var value = "";
                var start = this.colno;
                while ((ALPHABET + SPECIAL + NUMBERS).indexOf(this.current) !== -1) {
                    value += this.current;
                    this.advance();
                }
                this.back();
                if (KEYWORDS.indexOf(value) !== -1) {
                    this.tokens.push(new Token(exports.TokenType.KEYWORD, value, this.lineno, start));
                }
                else {
                    this.tokens.push(new Token(exports.TokenType.IDENTIFIER, value, this.lineno, start));
                }
            }
            else if (WHITESPACE.indexOf(this.current) !== -1) { }
            else {
                error_1.Error.raiseError(this.input, this.lineno, this.colno, "Lexer Error", "Unexpected character '".concat(this.current, "'"), 1);
            }
            this.advance();
        }
        this.tokens.push(new Token(exports.TokenType.EOF, "", this.lineno, this.colno));
        return this.tokens;
    };
    return Lexer;
}());
exports.Lexer = Lexer;
