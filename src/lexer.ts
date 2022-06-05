import { Error } from "./error"

export const TokenType = {
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
}

export class Token {
    constructor(
        public type: string,
        public value: string,
        public line: number,
        public column: number,
    ) {}
}

export class Lexer {
    index: number;
    input: string;
    tokens: Token[];
    current: string;
    lineno: number;
    colno: number;

    advance() {
        this.index++;
        this.current = null;
        if (this.index < this.input.length) {
            this.current = this.input[this.index];
        }
        this.colno++;
    }
    
    back() {
        this.index--;
        this.current = null;
        if (this.index >= 0) {
            this.current = this.input[this.index];
        }
        this.colno--;
    }

    peek() {
        if (this.index + 1 < this.input.length) {
            return this.input[this.index + 1];
        }
        return null;
    }

    lex(str: string) {
        this.input = str;
        this.index = -1;
        this.tokens = [];
        this.colno = 0;
        this.lineno = 0;
        this.advance();

        const SINGLE_TOKENS: {[key: string]: string} = {
            "/": TokenType.SLASH,
            "*": TokenType.STAR,
            ";": TokenType.SEMICOLON,
            ".": TokenType.DOT,
            ",": TokenType.COMMA,
            "(": TokenType.LEFT_PAREN,
            ")": TokenType.RIGHT_PAREN,
            "{": TokenType.LEFT_BRACE,
            "}": TokenType.RIGHT_BRACE,
            "-": TokenType.MINUS,
            "+": TokenType.PLUS,
            "=": TokenType.EQUAL,
            "<": TokenType.LESSTHAN,
            ">": TokenType.MORETHAN,
            "!": TokenType.NOT,
        };

        const NUMBERS: string = "0123456789";
        const ALPHABET: string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const SPECIAL: string = "_";
        const KEYWORDS: string[] = [ "func", "var", "return", "true", "false", "if", "while" ];
        const WHITESPACE: string = " \t";

        while (this.current !== null) {
            if (Object.keys(SINGLE_TOKENS).indexOf(this.current) !== -1) {
                this.tokens.push(new Token(
                    SINGLE_TOKENS[this.current],
                    this.current,
                    this.lineno,
                    this.colno
                ));
            }
            else if (this.current === "\n") {
                this.lineno++;
                this.colno = -1;
            }
            else if (
                NUMBERS.indexOf(this.current) !== -1 &&
                this.peek() && this.peek() === "."
            ) {
                let value: string = this.current + this.peek();
                let start: number = this.colno;
                this.advance();
                this.advance();

                while (NUMBERS.indexOf(this.current) !== -1) {
                    value += this.current;
                    this.advance();
                }
                this.back();

                this.tokens.push(new Token(
                    TokenType.FLOAT,
                    value,
                    this.lineno,
                    start
                ))
            }
            else if (NUMBERS.indexOf(this.current) !== -1) {
                let value: string = "";
                let start: number = this.colno;

                while (NUMBERS.indexOf(this.current) !== -1) {
                    value += this.current;
                    this.advance();
                }
                this.back();

                this.tokens.push(new Token(
                    TokenType.INTEGER,
                    value,
                    this.lineno,
                    start
                ))
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
                let value: string = "";
                let start: number = this.colno;
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
                
                this.tokens.push(new Token(
                    TokenType.STRING,
                    value,
                    this.lineno,
                    start
                ));
            }
            else if ((ALPHABET + SPECIAL).indexOf(this.current) !== -1) {
                let value: string = "";
                let start: number = this.colno;
                
                while ((ALPHABET + SPECIAL + NUMBERS).indexOf(this.current) !== -1) {
                    value += this.current;
                    this.advance();
                }
                this.back()

                if (KEYWORDS.indexOf(value) !== -1) {
                    this.tokens.push(new Token(
                        TokenType.KEYWORD,
                        value,
                        this.lineno,
                        start
                    ));
                }
                else {
                    this.tokens.push(new Token(
                        TokenType.IDENTIFIER,
                        value,
                        this.lineno,
                        start
                    ));
                }
            }
            else if (WHITESPACE.indexOf(this.current) !== -1) {}
            else {
                Error.raiseError(
                    this.input,
                    this.lineno,
                    this.colno,
                    "Lexer Error",
                    `Unexpected character '${this.current}'`,
                    1
                );
            }

            this.advance();
        }
        
        this.tokens.push(new Token(
            TokenType.EOF,
            "",
            this.lineno,
            this.colno
        ))

        return this.tokens;
    }
}