"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interpreter = exports.Scope = exports.ObjectFloat = exports.ObjectInteger = exports.ObjectBool = exports.ObjectString = exports.ObjectVoid = exports.InterpObject = void 0;
var error_1 = require("./error");
var builtins_1 = require("./builtins");
var parser_1 = require("./parser");
var InterpObject = /** @class */ (function () {
    function InterpObject(properties, builtin, attributes) {
        if (builtin === void 0) { builtin = false; }
        if (attributes === void 0) { attributes = {}; }
        this.properties = {};
        this.attributes = {};
        this.type = "";
        this.properties = properties;
        this.builtin = builtin;
        this.attributes = attributes;
    }
    InterpObject.prototype.get = function (prop) {
        if (this.builtin) {
            if (this[prop] !== undefined)
                return this[prop].bind(this);
            if (this.attributes[prop])
                return this.attributes[prop].bind(this)();
        }
        return this.properties[prop] || new ObjectVoid();
    };
    InterpObject.prototype.set = function (prop, value) {
        this.properties[prop] = value;
        return new ObjectVoid();
    };
    return InterpObject;
}());
exports.InterpObject = InterpObject;
var ObjectVoid = /** @class */ (function (_super) {
    __extends(ObjectVoid, _super);
    function ObjectVoid() {
        var _this = _super.call(this, {}, true) || this;
        _this.type = "null";
        return _this;
    }
    ObjectVoid.prototype.__add__ = function () {
        return new ObjectVoid();
    };
    ObjectVoid.prototype.__sub__ = function () {
        return new ObjectVoid();
    };
    ObjectVoid.prototype.__mul__ = function () {
        return new ObjectVoid();
    };
    ObjectVoid.prototype.__div__ = function () {
        return new ObjectVoid();
    };
    ObjectVoid.prototype.__string__ = function () {
        return "null";
    };
    return ObjectVoid;
}(InterpObject));
exports.ObjectVoid = ObjectVoid;
var ObjectString = /** @class */ (function (_super) {
    __extends(ObjectString, _super);
    function ObjectString(str) {
        var _this = _super.call(this, {}, true, {
            length: function () {
                return new ObjectInteger(_this.value.length);
            }
        }) || this;
        _this.type = "string";
        _this.value = str;
        return _this;
    }
    ObjectString.prototype.__add__ = function (other) {
        if (other instanceof ObjectString)
            return new ObjectString(this.value + other.value);
        return new ObjectVoid();
    };
    ObjectString.prototype.__sub__ = function () {
        return new ObjectVoid();
    };
    ObjectString.prototype.__mul__ = function (other) {
        if (other instanceof ObjectInteger)
            return new ObjectString(this.value.repeat(other.value));
        return new ObjectVoid();
    };
    ObjectString.prototype.__string__ = function () {
        return this.value;
    };
    ObjectString.prototype.__div__ = function () {
        return new ObjectVoid();
    };
    return ObjectString;
}(InterpObject));
exports.ObjectString = ObjectString;
var ObjectBool = /** @class */ (function (_super) {
    __extends(ObjectBool, _super);
    function ObjectBool(bool) {
        var _this = _super.call(this, {}, true, {}) || this;
        _this.type = "bool";
        _this.value = bool;
        return _this;
    }
    ObjectBool.prototype.__add__ = function (other) {
        return new ObjectVoid();
    };
    ObjectBool.prototype.__sub__ = function () {
        return new ObjectVoid();
    };
    ObjectBool.prototype.__mul__ = function (other) {
        return new ObjectVoid();
    };
    ObjectBool.prototype.__string__ = function () {
        return this.value ? "true" : "false";
    };
    ObjectBool.prototype.__div__ = function () {
        return new ObjectVoid();
    };
    return ObjectBool;
}(InterpObject));
exports.ObjectBool = ObjectBool;
var ObjectInteger = /** @class */ (function (_super) {
    __extends(ObjectInteger, _super);
    function ObjectInteger(value) {
        var _this = _super.call(this, {}, true) || this;
        _this.type = "integer";
        _this.value = value;
        return _this;
    }
    ObjectInteger.prototype.__add__ = function (other) {
        if (other instanceof ObjectInteger)
            return new ObjectInteger(this.value + other.value);
        return new ObjectVoid();
    };
    ObjectInteger.prototype.__sub__ = function (other) {
        if (other instanceof ObjectInteger)
            return new ObjectInteger(this.value - other.value);
        return new ObjectVoid();
    };
    ObjectInteger.prototype.__mul__ = function (other) {
        if (other instanceof ObjectInteger)
            return new ObjectInteger(this.value * other.value);
        return new ObjectVoid();
    };
    ObjectInteger.prototype.__div__ = function (other) {
        if (other instanceof ObjectInteger)
            return new ObjectInteger(this.value / other.value);
        return new ObjectVoid();
    };
    ObjectInteger.prototype.__string__ = function () {
        return this.value.toString();
    };
    ObjectInteger.prototype.toString = function () {
        return new ObjectString(this.value.toString());
    };
    return ObjectInteger;
}(InterpObject));
exports.ObjectInteger = ObjectInteger;
var ObjectFloat = /** @class */ (function (_super) {
    __extends(ObjectFloat, _super);
    function ObjectFloat(value) {
        var _this = _super.call(this, {}, true) || this;
        _this.type = "float";
        _this.value = value;
        return _this;
    }
    ObjectFloat.prototype.__add__ = function (other) {
        if (other instanceof ObjectFloat)
            return new ObjectInteger(this.value + other.value);
        return new ObjectVoid();
    };
    ObjectFloat.prototype.__sub__ = function (other) {
        if (other instanceof ObjectFloat)
            return new ObjectInteger(this.value - other.value);
        return new ObjectVoid();
    };
    ObjectFloat.prototype.__mul__ = function (other) {
        if (other instanceof ObjectFloat)
            return new ObjectInteger(this.value * other.value);
        return new ObjectVoid();
    };
    ObjectFloat.prototype.__div__ = function (other) {
        if (other instanceof ObjectFloat)
            return new ObjectInteger(this.value / other.value);
        return new ObjectVoid();
    };
    ObjectFloat.prototype.__string__ = function () {
        return this.value.toString();
    };
    ObjectFloat.prototype.toString = function () {
        return new ObjectString(this.value.toString());
    };
    return ObjectFloat;
}(InterpObject));
exports.ObjectFloat = ObjectFloat;
var Scope = /** @class */ (function () {
    function Scope(parent) {
        this.variables = {};
        this.parent = parent;
    }
    Scope.prototype.get = function (name) {
        if (this.variables[name] !== undefined) {
            return this.variables[name];
        }
        if (this.parent !== null) {
            return this.parent.get(name);
        }
        return new ObjectVoid();
    };
    Scope.prototype.set = function (name, value) {
        this.variables[name] = value;
    };
    return Scope;
}());
exports.Scope = Scope;
var Interpreter = /** @class */ (function () {
    function Interpreter(input) {
        this.input = input;
        this.globalScope = (0, builtins_1.default)(new Scope(null));
        this.currentScope = this.globalScope;
    }
    Interpreter.prototype.visit_PROGRAM = function (node) {
        var _this = this;
        return node.body.map(function (x) { return _this.visit(x); });
    };
    Interpreter.prototype.visit_SETVARIABLE = function (node) {
        var name = node.name;
        var value = this.visit(node.value);
        this.currentScope.set(name, value);
    };
    Interpreter.prototype.visit_BOOLEAN = function (node) {
        return new ObjectBool(node.value);
    };
    Interpreter.prototype.visit_PROPERTYACCESS = function (node) {
        var _this = this;
        var value = this.visit(node.value);
        if (node.property.type === parser_1.NodeType.FUNC_CALL) {
            var func = value.get(node.property.name);
            if (func instanceof ObjectVoid) {
                error_1.Error.raiseError(this.input, node.line, node.column, "Runtime Error", "Function '".concat(node.property.name, "' is not defined"), node.length);
            }
            var args = node.property.arguments.map(function (x) { return _this.visit(x); });
            var result = func.apply(void 0, args);
            return result;
        }
        else {
            return value.get(node.property.value);
        }
    };
    Interpreter.prototype.visit_FUNCCALL = function (node) {
        var _this = this;
        var func = node.name;
        var args = node.arguments.map(function (x) { return _this.visit(x); });
        var funcValue = this.currentScope.get(func);
        if (funcValue instanceof ObjectVoid) {
            error_1.Error.raiseError(this.input, node.line, node.column, "Runtime Error", "Function '".concat(func, "' is not defined"), func.length);
        }
        if (typeof funcValue !== "function") {
            error_1.Error.raiseError(this.input, node.line, node.column, "Runtime Error", "'".concat(func, "' is not a function"), func.length);
        }
        var result = funcValue.apply(void 0, args);
        return result;
    };
    Interpreter.prototype.visit_GETVARIABLE = function (node) {
        var name = node.name;
        var value = this.currentScope.get(name);
        if (value instanceof ObjectVoid) {
            error_1.Error.raiseError(this.input, node.line, node.column, "Runtime Error", "Variable '".concat(name, "' is not defined"), name.length);
        }
        return value;
    };
    Interpreter.prototype.visit_RETURN = function (node) {
        var value = this.visit(node.value);
        if (this.currentScope === this.globalScope) {
            error_1.Error.raiseError(this.input, node.line, node.col, "Runtime Error", "'return' statement is not allowed in global scope", node.length);
        }
        this.currentScope.returnValue = value;
    };
    Interpreter.prototype.visit_STRING = function (node) {
        return new ObjectString(node.value);
    };
    Interpreter.prototype.visit_INTEGER = function (node) {
        return new ObjectInteger(node.value);
    };
    Interpreter.prototype.visit_FLOAT = function (node) {
        return new ObjectFloat(node.value);
    };
    Interpreter.prototype.visit_BINARYEXPRESSION = function (node) {
        var left = this.visit(node.left);
        var right = this.visit(node.right);
        var op = node.op.value;
        if (typeof left === "function" || typeof right === "function") {
            error_1.Error.raiseError(this.input, node.line, node.col, "Runtime Error", "Cannot use function as operand", node.length);
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
    };
    Interpreter.prototype.visit_DEFINEFUNC = function (node) {
        var _this = this;
        var func = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var funcScope = new Scope(_this.currentScope);
            _this.currentScope = funcScope;
            for (var i = 0; i < args.length; i++) {
                _this.currentScope.set(node.arguments[i].value, args[i]);
            }
            node.body.map(function (x) { return _this.visit(x); });
            _this.currentScope = funcScope.parent;
            var result = funcScope.returnValue;
            return result;
        };
        this.currentScope.set(node.name, func);
    };
    Interpreter.prototype.visit_CONDITION = function (node) {
        var left = this.visit(node.left);
        var right = this.visit(node.right);
        var op = node.op;
        if (typeof left === "function" || typeof right === "function") {
            error_1.Error.raiseError(this.input, node.line, node.col, "Runtime Error", "Cannot compare functions", node.length);
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
                error_1.Error.raiseError(this.input, node.line, node.col, "Runtime Error", "Cannot compare strings with '".concat(op, "'"), node.length);
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
                error_1.Error.raiseError(this.input, node.line, node.col, "Runtime Error", "Cannot compare integers with '".concat(op, "'"), node.length);
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
                error_1.Error.raiseError(this.input, node.line, node.col, "Runtime Error", "Cannot compare integers with '".concat(op, "'"), node.length);
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
                error_1.Error.raiseError(this.input, node.line, node.col, "Runtime Error", "Cannot compare booleans with '".concat(op, "'"), node.length);
            }
        }
        error_1.Error.raiseError(this.input, node.line, node.col, "Runtime Error", "Cannot compare '".concat(left.type, "' with '").concat(right.type, "'"), node.length);
    };
    Interpreter.prototype.visit_IFSTATEMENT = function (node) {
        var condition = this.visit(node.condition);
        if (condition.value) {
            for (var _i = 0, _a = node.body; _i < _a.length; _i++) {
                var n = _a[_i];
                this.visit(n);
            }
        }
    };
    Interpreter.prototype.visit = function (node) {
        if (this["visit_" + node.type]) {
            return this["visit_" + node.type].call(this, node);
        }
        else {
            error_1.Error.raiseError(this.input, node.line, node.col, "Interpreter Error", "'".concat(node.type, "' hasn't been implemented yet."), node.length);
        }
    };
    return Interpreter;
}());
exports.Interpreter = Interpreter;
