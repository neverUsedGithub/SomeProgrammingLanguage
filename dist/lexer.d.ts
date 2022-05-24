export declare const TokenType: {
    LEFT_PAREN: string;
    RIGHT_PAREN: string;
    LEFT_BRACE: string;
    RIGHT_BRACE: string;
    COMMA: string;
    DOT: string;
    MINUS: string;
    PLUS: string;
    SEMICOLON: string;
    SLASH: string;
    STAR: string;
    INTEGER: string;
    STRING: string;
    BOOLEAN: string;
    IDENTIFIER: string;
    EQUAL: string;
    KEYWORD: string;
    EOF: string;
};
export declare class Token {
    type: string;
    value: string;
    line: number;
    column: number;
    constructor(type: string, value: string, line: number, column: number);
}
export declare class Lexer {
    index: number;
    input: string;
    tokens: Token[];
    current: string;
    lineno: number;
    colno: number;
    advance(): void;
    back(): void;
    lex(str: string): Token[];
}
