import { Token } from "./lexer";
export declare const NodeType: {
    PROGRAM: string;
    BINARY_EXPR: string;
    SET_VARIABLE: string;
    GET_VARIABLE: string;
    FUNC_CALL: string;
    INTEGER: string;
    STRING: string;
    DEFINE_FUNC: string;
    RETURN: string;
    CLASS_DEFINE_FUNC: string;
    PROPERTY_ACCESS: string;
    CLASS_DEFINE: string;
};
export declare class Parser {
    tokens: Token[];
    current: Token;
    index: number;
    input: string;
    eat(type: string): Token;
    pPrimary(): any;
    pMultiplicative(): any;
    pAdditive(): any;
    pClassFunction(): {
        type: string;
        name: string;
        arguments: any[];
        body: any[];
        funcType: any;
        line: number;
        col: number;
        length: number;
    };
    pExpression(): any;
    parse(inp: string, token: Token[]): {
        type: string;
        body: any[];
        line: number;
        col: number;
        length: number;
    };
}
