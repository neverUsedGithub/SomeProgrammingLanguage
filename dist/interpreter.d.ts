export declare class ClassObject {
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
export declare class ClassDefineObject {
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
export declare class InterpObject {
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
export declare class ObjectVoid extends InterpObject {
    constructor();
    __add__(): ObjectVoid;
    __sub__(): ObjectVoid;
    __mul__(): ObjectVoid;
    __div__(): ObjectVoid;
    __string__(): string;
}
export declare class ObjectString extends InterpObject {
    value: string;
    constructor(str: string);
    __add__(other: any): ObjectVoid | ObjectString;
    __sub__(): ObjectVoid;
    __mul__(other: any): ObjectVoid | ObjectString;
    __string__(): string;
    __div__(): ObjectVoid;
}
export declare class ObjectInteger extends InterpObject {
    value: number;
    constructor(value: number);
    __add__(other: InterpObject): ObjectVoid | ObjectInteger;
    __sub__(other: InterpObject): ObjectVoid | ObjectInteger;
    __mul__(other: InterpObject): ObjectVoid | ObjectInteger;
    __div__(other: InterpObject): ObjectVoid | ObjectInteger;
    __string__(): string;
    toString(): ObjectString;
}
export declare class Scope {
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
export declare class Interpreter {
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
