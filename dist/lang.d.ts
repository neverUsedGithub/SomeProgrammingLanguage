declare module "error" {
    export class Error {
        static raiseError(input: string, lineno: number, colno: number, errorname: string, errortext: string, length: number): void;
    }
}
declare module "lexer" {
    export const TokenType: {
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
    export class Token {
        type: string;
        value: string;
        line: number;
        column: number;
        constructor(type: string, value: string, line: number, column: number);
    }
    export class Lexer {
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
}
declare module "parser" {
    import { Token } from "lexer";
    export const NodeType: {
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
    export class Parser {
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
}
declare module "interpreter" {
    export class ClassObject {
        properties: {
            [key: string]: any;
        };
        constructorCalled: boolean;
        classname: string;
        constructor(properties: {
            [key: string]: any;
        }, classname: string);
        get(prop: string): any;
        set(prop: string, value: any): ObjectVoid;
    }
    export class ClassDefineObject {
        properties: {
            [key: string]: any;
        };
        classname: string;
        constructor(properties: {
            [key: string]: any;
        }, classname: string);
        get(prop: string): any;
        getClass(): ClassObject;
        __getinstance__(): ClassObject;
        set(prop: string, value: any): ObjectVoid;
    }
    export class InterpObject {
        properties: {
            [key: string]: any;
        };
        builtin: boolean;
        constructor(properties: {
            [key: string]: any;
        }, builtin?: boolean);
        get(prop: string): any;
        set(prop: string, value: any): ObjectVoid;
    }
    export class ObjectVoid extends InterpObject {
        constructor();
        __add__(): ObjectVoid;
        __sub__(): ObjectVoid;
        __mul__(): ObjectVoid;
        __div__(): ObjectVoid;
        __string__(): string;
    }
    export class ObjectString extends InterpObject {
        value: string;
        constructor(str: string);
        __add__(other: any): ObjectVoid | ObjectString;
        __sub__(): ObjectVoid;
        __mul__(other: any): ObjectVoid | ObjectString;
        __string__(): string;
        __div__(): ObjectVoid;
    }
    export class ObjectInteger extends InterpObject {
        value: number;
        constructor(value: number);
        __add__(other: InterpObject): ObjectVoid | ObjectInteger;
        __sub__(other: InterpObject): ObjectVoid | ObjectInteger;
        __mul__(other: InterpObject): ObjectVoid | ObjectInteger;
        __div__(other: InterpObject): ObjectVoid | ObjectInteger;
        __string__(): string;
        toString(): ObjectString;
    }
    export class Scope {
        parent: Scope | null;
        variables: {
            [key: string]: any;
        };
        returnValue: any;
        isClass: boolean;
        constructor(parent: Scope | null, isClass?: boolean);
        get(name: string): any;
        set(name: string, value: any): void;
    }
    export class Interpreter {
        input: string;
        globalScope: Scope;
        currentScope: Scope;
        constructor(input: string);
        visit_PROGRAM(node: any): any;
        visit_SETVARIABLE(node: any): void;
        visit_PROPERTYACCESS(node: any): any;
        visit_CLASSDEFINEFUNC(node: any): {
            function: (...args: any[]) => any;
            name: any;
        };
        visit_CLASSDEFINE(node: any): ObjectVoid;
        visit_FUNCCALL(node: any): any;
        visit_GETVARIABLE(node: any): any;
        visit_RETURN(node: any): void;
        visit_STRING(node: any): ObjectString;
        visit_INTEGER(node: any): ObjectInteger;
        visit_BINARYEXPRESSION(node: any): any;
        visit_DEFINEFUNC(node: any): void;
        visit(node: any): any;
    }
}
declare module "builtins" {
    import { Scope } from "interpreter";
    export default function addTo(scope: Scope): Scope;
}
declare module "index" { }
