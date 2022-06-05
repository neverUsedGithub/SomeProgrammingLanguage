import { Error } from "./error"
import addBuiltins from "./builtins"
import { NodeType } from "./parser";

export class InterpObject {
    properties: { [key: string]: any } = {};
    builtin: boolean;
    attributes: { [key: string]: Function } = {};
    type: string = "";
    value;

    constructor(properties: { [key: string]: any }, builtin = false, attributes: { [key: string]: Function } = {}) {
        this.properties = properties;
        this.builtin = builtin;
        this.attributes = attributes;
    }

    get(prop: string) {
        if (this.builtin) {
            if (this[prop] !== undefined)
                return this[prop].bind(this);
            if (this.attributes[prop])
                return this.attributes[prop].bind(this)();
        }

        return this.properties[prop] || new ObjectVoid()
    }

    set(prop: string, value: any) {
        this.properties[prop] = value;
        return new ObjectVoid();
    }
}

export class ObjectVoid extends InterpObject {
    type: string = "null";

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
    type: string = "string";

    constructor(str: string) {
        super({}, true, {
            length: () => {
                return new ObjectInteger(this.value.length);
            } 
        });
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

export class ObjectBool extends InterpObject {
    value: boolean;
    type: string = "bool";

    constructor(bool: boolean) {
        super({}, true, {});
        this.value = bool;
    }

    __add__(other: any) {
        return new ObjectVoid();
    }

    __sub__() {
        return new ObjectVoid();
    }

    __mul__(other: any) {
        return new ObjectVoid();
    }

    __string__() {
        return this.value ? "true" : "false";
    }

    __div__() {
        return new ObjectVoid();
    }
}

export class ObjectInteger extends InterpObject {
    value: number;
    type: string = "integer";

    constructor(value: number) {
        super({}, true);
        this.value = value;
    }

    __add__(other: InterpObject) {
        if (other instanceof ObjectInteger || other instanceof ObjectFloat)
            return new ObjectInteger(this.value + other.value);
        
        return new ObjectVoid();
    }   

    __sub__(other: InterpObject) {
        if (other instanceof ObjectInteger || other instanceof ObjectFloat)
            return new ObjectInteger(this.value - other.value);
        
        return new ObjectVoid();
    }

    __mul__(other: InterpObject) {
        if (other instanceof ObjectInteger || other instanceof ObjectFloat)
            return new ObjectInteger(this.value * other.value);
        
        return new ObjectVoid();
    }

    __div__(other: InterpObject) {
        if (other instanceof ObjectInteger || other instanceof ObjectFloat)
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

export class ObjectFloat extends InterpObject {
    value: number;
    type: string = "float";

    constructor(value: number) {
        super({}, true);
        this.value = value;
    }

    __add__(other: InterpObject) {
        if (other instanceof ObjectFloat || other instanceof ObjectInteger)
            return new ObjectInteger(this.value + other.value);
        
        return new ObjectVoid();
    }   

    __sub__(other: InterpObject) {
        if (other instanceof ObjectFloat || other instanceof ObjectInteger)
            return new ObjectInteger(this.value - other.value);
        
        return new ObjectVoid();
    }

    __mul__(other: InterpObject) {
        if (other instanceof ObjectFloat || other instanceof ObjectInteger)
            return new ObjectInteger(this.value * other.value);
        
        return new ObjectVoid();
    }

    __div__(other: InterpObject) {
        if (other instanceof ObjectFloat || other instanceof ObjectInteger)
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

    constructor(parent: Scope | null) {
        this.parent = parent;
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

    doesExist(name: string) {
        if (this.variables[name] !== undefined) {
            return true;
        }

        if (this.parent !== null) {
            return this.parent.doesExist(name);
        }

        return false;
    }
}

export class Interpreter {
    globalScope: Scope;
    currentScope: Scope;

    constructor(
        public input: string
    ) {
        this.globalScope = addBuiltins(new Scope(null), input);
        this.currentScope = this.globalScope;
    }

    visit_PROGRAM(node) {
        return node.body.map(x => this.visit(x))
    }

    visit_CREATEVARIABLE(node) {
        const name = node.name;
        const value = this.visit(node.value)

        if (this.currentScope.doesExist(name)) {
            Error.raiseError(this.input, name.line, name.col, "Runtime Error", "Variable already exists", name.length);
        }

        this.currentScope.set(name, value);
    }
    
    visit_ASSIGNVARIABLE(node) {
        const name = node.name;
        const value = this.visit(node.value)

        if (!this.currentScope.doesExist(name)) {
            Error.raiseError(this.input, name.line, name.col, "Runtime Error", "Variable doesn't exist", name.length);
        }

        this.currentScope.set(name, value);
    }

    visit_ASSIGNVARIABLESHORT(node) {
        const name = node.name;
        const op = node.op.value;
        const value = this.visit(node.value)

        if (!this.currentScope.doesExist(name)) {
            Error.raiseError(this.input, name.line, name.col, "Runtime Error", "Variable doesn't exist", name.length);
        }

        if (op === "+") {
            this.currentScope.set(name, this.currentScope.get(name).__add__(value));
        }
        if (op === "-") {
            this.currentScope.set(name, this.currentScope.get(name).__sub__(value));
        }
        if (op === "*") {
            this.currentScope.set(name, this.currentScope.get(name).__mul__(value));
        }
        if (op === "/") {
            this.currentScope.set(name, this.currentScope.get(name).__div__(value));
        }
    }

    visit_WHILESTATEMENT(node) {
        while (true) {
            const condition = this.visit(node.condition);
            if (!condition.value)
                break;
            
            for (let n of node.body) {
                this.visit(n)
            }
        }
    }

    visit_BOOLEAN(node) {
        return new ObjectBool(node.value);
    }

    visit_PROPERTYACCESS(node) {
        const value = this.visit(node.value);

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
    
    visit_FUNCCALL(node) {
        const func = node.name;
        const args = node.arguments.map(x => this.visit(x));

        const funcValue = this.currentScope.get(func);
        if (funcValue instanceof ObjectVoid) {
            Error.raiseError(this.input, node.line, node.column, "Runtime Error", `Function '${func}' is not defined`, func.length);
        }

        if (typeof funcValue !== "function") {
            Error.raiseError(this.input, node.line, node.column, "Runtime Error", `'${func}' is not a function`, func.length);
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

    visit_FLOAT(node) {
        return new ObjectFloat(node.value);
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

    visit_CONDITION(node) {
        const left = this.visit(node.left);

        if (node.right === undefined) {
            if (left instanceof ObjectBool && left.value) {
                return new ObjectBool(true);
            }
            else if (left instanceof ObjectBool && !left.value) {
                return new ObjectBool(false);
            }
            else {
                Error.raiseError(this.input, node.line, node.column, "Runtime Error", `Cannot use '${left}' as condition`, node.length);
            }
        }

        const right = this.visit(node.right);
        const op = node.op;

        if (typeof left === "function" || typeof right === "function") {
            Error.raiseError(this.input, node.line, node.col, "Runtime Error", `Cannot compare functions`, node.length)
        }

        if (left instanceof ObjectVoid || right instanceof ObjectVoid) {
            return new ObjectBool(false);
        }

        if (left instanceof ObjectString && right instanceof ObjectString) {
            if (op === "==") {
                return new ObjectBool(left.value === right.value);
            }
            else if (op === "!=") {
                return new ObjectBool(left.value !== right.value);
            }
            else {
                Error.raiseError(this.input, node.line, node.col, "Runtime Error", `Cannot compare strings with '${op}'`, node.length)
            }
        }

        if (left instanceof ObjectInteger && right instanceof ObjectInteger) {
            if (op === "==") {
                return new ObjectBool(left.value === right.value);
            }
            else if (op === "!=") {
                return new ObjectBool(left.value !== right.value);
            }
            else if (op === "<") {
                return new ObjectBool(left.value < right.value);
            }
            else if (op === "<=") {
                return new ObjectBool(left.value <= right.value);
            }
            else if (op === ">") {
                return new ObjectBool(left.value > right.value);
            }
            else if (op === ">=") {
                return new ObjectBool(left.value >= right.value);
            }
            else {
                Error.raiseError(this.input, node.line, node.col, "Runtime Error", `Cannot compare integers with '${op}'`, node.length)
            }
        }

        if (left instanceof ObjectFloat && right instanceof ObjectFloat) {
            if (op === "==") {
                return new ObjectBool(left.value === right.value);
            }
            else if (op === "!=") {
                return new ObjectBool(left.value !== right.value);
            }
            else if (op === "<") {
                return new ObjectBool(left.value < right.value);
            }
            else if (op === "<=") {
                return new ObjectBool(left.value <= right.value);
            }
            else if (op === ">") {
                return new ObjectBool(left.value > right.value);
            }
            else if (op === ">=") {
                return new ObjectBool(left.value >= right.value);
            }
            else {
                Error.raiseError(this.input, node.line, node.col, "Runtime Error", `Cannot compare integers with '${op}'`, node.length)
            }
        }

        if (left instanceof ObjectBool && right instanceof ObjectBool) {
            if (op === "==") {
                return new ObjectBool(left.value === right.value);
            }
            else if (op === "!=") {
                return new ObjectBool(left.value !== right.value);
            }
            else {
                Error.raiseError(this.input, node.line, node.col, "Runtime Error", `Cannot compare booleans with '${op}'`, node.length)
            }
        }

        Error.raiseError(this.input, node.line, node.col, "Runtime Error", `Cannot compare '${left.type}' with '${right.type}'`, node.length)
    }

    visit_IFSTATEMENT(node) {
        const condition = this.visit(node.condition);

        if (condition.value) {
            for (let n of node.body) {
                this.visit(n)
            }
        }
    }

    visit(node): InterpObject {
        if (this["visit_" + node.type]) {
            return this["visit_" + node.type].call(this, node)
        }
        else {
            Error.raiseError(this.input, node.line, node.col, "Interpreter Error", `'${node.type}' hasn't been implemented yet.`, node.length)
        }
    }
}