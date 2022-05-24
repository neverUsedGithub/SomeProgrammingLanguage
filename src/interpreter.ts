import { Error } from "./error"
import addBuiltins from "./builtins"
import { NodeType } from "./parser";

export class ClassObject {
    properties: { [key: string]: any } = {};
    constructorCalled: boolean;
    classname: string;

    constructor(properties: { [key: string]: any }, classname: string) {
        this.properties = properties;
        this.classname = classname;
        if (this.properties[classname]) {
            this.constructorCalled = true;
            this.properties[classname].call(this, this);
        }
    }

    get(prop: string) {
        return this.properties[prop] || new ObjectVoid()
    }

    set(prop: string, value: any) {
        this.properties[prop] = value;
        if (this.properties[this.classname] && !this.constructorCalled) {
            this.properties[this.classname].call(this, this);
            this.constructorCalled = true;
        }
        return new ObjectVoid();
    }
}

export class ClassDefineObject {
    properties: { [key: string]: any } = {};
    classname: string;

    constructor(properties: { [key: string]: any }, classname: string) {
        this.properties = properties;
        this.classname = classname;
    }

    get(prop: string) {
        return this.properties[prop] || new ObjectVoid()
    }

    getClass() {
        return new ClassObject(this.properties, this.classname);
    }

    __getinstance__() {
        return this.getClass();
    }

    set(prop: string, value: any) {
        this.properties[prop] = value;
        return new ObjectVoid();
    }
}

export class InterpObject {
    properties: { [key: string]: any } = {};
    builtin: boolean;

    constructor(properties: { [key: string]: any }, builtin = false) {
        this.properties = properties;
        this.builtin = builtin;
    }

    get(prop: string) {
        if (this.builtin)
            if (this[prop] !== undefined)
                return this[prop].bind(this);

        return this.properties[prop] || new ObjectVoid()
    }

    set(prop: string, value: any) {
        this.properties[prop] = value;
        return new ObjectVoid();
    }
}

export class ObjectVoid extends InterpObject {
    constructor() {
        super({}, true);
    }

    __add__() {
        return new ObjectVoid();
    }

    __sub__() {
        return new ObjectVoid();
    }

    __mul__() {
        return new ObjectVoid();
    }

    __div__() {
        return new ObjectVoid();
    }

    __string__() {
        return "null";
    }
}

export class ObjectString extends InterpObject {
    value: string;

    constructor(str: string) {
        super({}, true);
        this.value = str;
    }

    __add__(other: any) {
        if (other instanceof ObjectString)
            return new ObjectString(this.value + other.value);
        
        return new ObjectVoid();
    }

    __sub__() {
        return new ObjectVoid();
    }

    __mul__(other: any) {
        if (other instanceof ObjectInteger)
            return new ObjectString(this.value.repeat(other.value));
        
        return new ObjectVoid();
    }

    __string__() {
        return this.value;
    }

    __div__() {
        return new ObjectVoid();
    }
}

export class ObjectInteger extends InterpObject {
    value: number;

    constructor(value: number) {
        super({}, true);
        this.value = value;
    }

    __add__(other: InterpObject) {
        if (other instanceof ObjectInteger)
            return new ObjectInteger(this.value + other.value);
        
        return new ObjectVoid();
    }   

    __sub__(other: InterpObject) {
        if (other instanceof ObjectInteger)
            return new ObjectInteger(this.value - other.value);
        
        return new ObjectVoid();
    }

    __mul__(other: InterpObject) {
        if (other instanceof ObjectInteger)
            return new ObjectInteger(this.value * other.value);
        
        return new ObjectVoid();
    }

    __div__(other: InterpObject) {
        if (other instanceof ObjectInteger)
            return new ObjectInteger(this.value / other.value);
        
        return new ObjectVoid();
    }

    __string__() {
        return this.value.toString();
    }

    toString() {
        return new ObjectString(this.value.toString());
    }
}

export class Scope {
    parent: Scope | null;
    variables: { [key: string]: any } = {};
    returnValue: any;
    isClass: boolean;

    constructor(parent: Scope | null, isClass: boolean = false) {
        this.parent = parent;
        this.isClass = isClass;
    }

    get(name: string) {
        if (this.variables[name] !== undefined) {
            return this.variables[name];
        }

        if (this.parent !== null) {
            return this.parent.get(name);
        }

        return new ObjectVoid();
    }

    set(name: string, value: any) {
        this.variables[name] = value;
    }
}

export class Interpreter {
    globalScope: Scope = addBuiltins(new Scope(null));
    currentScope: Scope = this.globalScope;

    constructor(
        public input: string
    ) {}

    visit_PROGRAM(node) {
        return node.body.map(x => this.visit(x))
    }

    visit_SETVARIABLE(node) {
        const name = node.name;
        const value = this.visit(node.value)

        this.currentScope.set(name, value);
    }

    visit_PROPERTYACCESS(node) {
        const value = this.visit(node.value);

        console.log(value, node.value)

        if (node.property.type === NodeType.FUNC_CALL) {
            const func = value.get(node.property.name);
            
            if (func instanceof ObjectVoid) {
                Error.raiseError(this.input, node.line, node.column, "Runtime Error", `Function '${node.property.name}' is not defined`, node.length);
            }

            const args = node.property.arguments.map(x => this.visit(x));

            const result = func(...args);
            return result;
        }
        else {
            return value.get(node.property.value);
        }
    }

    visit_CLASSDEFINEFUNC(node) {
        const func = (...args) => {
            const funcScope = new Scope(this.currentScope);
            this.currentScope = funcScope;
            
            for (let i = 0; i < args.length; i++) {
                this.currentScope.set(node.arguments[i].value, args[i]);
            }

            node.body.map(x => this.visit(x))
            this.currentScope = funcScope.parent;

            const result = funcScope.returnValue;
            return result;
        }

        return { function: func, name: node.name };
    }

    visit_CLASSDEFINE(node) {
        const myclass: ClassDefineObject = new ClassDefineObject({}, node.name);
        const properties: { [key: string]: string | Function }[] = node.body.map(x => this.visit(x))
        
        for (let prop of properties) {
            if (typeof prop.name === "string")
                myclass.set(prop.name, prop.function);
            else 
                throw new SyntaxError("how the heck did you get here? please report this to the dev thx");
        }

        this.currentScope.set(node.name, myclass);

        return new ObjectVoid();
    }
    
    visit_FUNCCALL(node) {
        const func = node.name;
        const args = node.arguments.map(x => this.visit(x));

        const funcValue = this.currentScope.get(func);
        if (funcValue instanceof ObjectVoid) {
            Error.raiseError(this.input, node.line, node.column, "Runtime Error", `Function '${func}' is not defined`, func.length);
        }

        if (typeof funcValue !== "function" && !(funcValue instanceof ClassDefineObject)) {
            Error.raiseError(this.input, node.line, node.column, "Runtime Error", `'${func}' is not a function`, func.length);
        }

        if (funcValue instanceof ClassDefineObject) {
            return funcValue.__getinstance__();
        }

        const result = funcValue(...args);
        return result;
    }

    visit_GETVARIABLE(node) {
        const name = node.name;
        const value = this.currentScope.get(name);

        if (value instanceof ObjectVoid) {
            Error.raiseError(this.input, node.line, node.column, "Runtime Error", `Variable '${name}' is not defined`, name.length);
        }

        return value;
    }

    visit_RETURN(node) {
        const value = this.visit(node.value);
        if (this.currentScope === this.globalScope) {
            Error.raiseError(this.input, node.line, node.col, "Runtime Error", `'return' statement is not allowed in global scope`, node.length)
        }
        this.currentScope.returnValue = value;
    }

    visit_STRING(node) {
        return new ObjectString(node.value);
    }

    visit_INTEGER(node) {
        return new ObjectInteger(node.value);
    }
    
    visit_BINARYEXPRESSION(node) {
        let left = this.visit(node.left);
        let right = this.visit(node.right);
        let op = node.op.value;

        if (typeof left === "function" || typeof right === "function") {
            Error.raiseError(this.input, node.line, node.col, "Runtime Error", `Cannot use function as operand`, node.length)
        }

        
        if (op === "+") {
            return left.get("__add__")(right);
        }
        if (op === "-") {
            return left.get("__sub__")(right);
        }
        if (op === "*") {
            return left.get("__mul__")(right);
        }
        if (op === "/") {
            return left.get("__div__")(right);
        }
    }

    visit_DEFINEFUNC(node) {

        const func = (...args) => {
            const funcScope = new Scope(this.currentScope);
            this.currentScope = funcScope;
            
            for (let i = 0; i < args.length; i++) {
                this.currentScope.set(node.arguments[i].value, args[i]);
            }

            node.body.map(x => this.visit(x))
            this.currentScope = funcScope.parent;

            const result = funcScope.returnValue;
            return result;
        }

        this.currentScope.set(node.name, func);
    }

    visit(node) {
        if (this["visit_" + node.type]) {
            return this["visit_" + node.type].call(this, node)
        }
        else {
            Error.raiseError(this.input, node.line, node.col, "Interpreter Error", `'${node.type}' hasn't been implemented yet.`, node.length)
        }
    }
}