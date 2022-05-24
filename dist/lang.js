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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
define("error", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Error = void 0;
    var Error = /** @class */ (function () {
        function Error() {
        }
        Error.raiseError = function (input, lineno, colno, errorname, errortext, length) {
            var codesnippet = input.split("\n")[lineno];
            var maxlinelen = Math.max((lineno + 1).toString().length, lineno + 1 < input.split("\n").length ? (lineno + 2).toString().length : 0);
            var codesnippet2 = input.split("\n")[lineno - 1];
            var codesnippet3 = input.split("\n")[lineno + 1];
            codesnippet2 = codesnippet2 !== undefined ? "\n".concat(lineno, " | ").concat(codesnippet2) : "";
            codesnippet3 = codesnippet3 !== undefined ? "\n".concat(lineno + 2, " | ").concat(codesnippet3) : "";
            console.log("\x1b[31m" + "".concat(errorname, "!\n").concat(errortext, "\n").concat(codesnippet2, "\n").concat(lineno + 1, " | ").concat(codesnippet, "\n").concat(" ".repeat(colno + maxlinelen + 3)).concat("^".repeat(length)).concat(codesnippet3, "\n") + "\x1b[0m");
            process.exit(0);
        };
        return Error;
    }());
    exports.Error = Error;
});
define("lexer", ["require", "exports", "error"], function (require, exports, error_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Lexer = exports.Token = exports.TokenType = void 0;
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
        EOF: "eof"
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
            };
            var NUMBERS = "0123456789";
            var ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var SPECIAL = "_";
            var KEYWORDS = ["func", "var", "return", "class", "public", "private", "true", "false"];
            var WHITESPACE = " \t";
            while (this.current !== null) {
                if (Object.keys(SINGLE_TOKENS).indexOf(this.current) !== -1) {
                    this.tokens.push(new Token(SINGLE_TOKENS[this.current], this.current, this.lineno, this.colno));
                }
                else if (this.current === "\n") {
                    this.lineno++;
                    this.colno = -1;
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
});
define("parser", ["require", "exports", "lexer", "error"], function (require, exports, lexer_1, error_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Parser = exports.NodeType = void 0;
    exports.NodeType = {
        PROGRAM: "PROGRAM",
        BINARY_EXPR: "BINARYEXPRESSION",
        SET_VARIABLE: "SETVARIABLE",
        GET_VARIABLE: "GETVARIABLE",
        FUNC_CALL: "FUNCCALL",
        INTEGER: "INTEGER",
        STRING: "STRING",
        DEFINE_FUNC: "DEFINEFUNC",
        RETURN: "RETURN",
        CLASS_DEFINE_FUNC: "CLASSDEFINEFUNC",
        PROPERTY_ACCESS: "PROPERTYACCESS",
        CLASS_DEFINE: "CLASSDEFINE",
    };
    var Parser = /** @class */ (function () {
        function Parser() {
        }
        Parser.prototype.eat = function (type) {
            if (this.current.type === type) {
                var tok = this.current;
                this.index++;
                this.current = this.tokens[this.index];
                return tok;
            }
            error_2.Error.raiseError(this.input, this.current.line, this.current.column, "Parsing Error", "Expected type '".concat(type, "', but got '").concat(this.current.type, "'"), this.current.value.length);
        };
        Parser.prototype.pPrimary = function () {
            if (this.current.type === lexer_1.TokenType.PLUS || this.current.type === lexer_1.TokenType.MINUS) {
                var op = this.eat(this.current.type);
                var p = this.pPrimary();
                return {
                    type: p.type,
                    value: p.value,
                    line: op.line,
                    col: op.column,
                    length: p.column - op.column + p.length,
                    op: op
                };
            }
            else if (this.current.type === lexer_1.TokenType.INTEGER) {
                var num = this.eat(lexer_1.TokenType.INTEGER);
                return {
                    type: exports.NodeType.INTEGER,
                    value: parseInt(num.value),
                    line: num.line,
                    col: num.column,
                    length: num.value.length
                };
            }
            else if (this.current.type === lexer_1.TokenType.IDENTIFIER) {
                var name_1 = this.eat(lexer_1.TokenType.IDENTIFIER);
                if (this.current.type === lexer_1.TokenType.LEFT_PAREN) {
                    this.eat(lexer_1.TokenType.LEFT_PAREN);
                    var first = true;
                    var args = [];
                    while (this.current.type !== lexer_1.TokenType.RIGHT_PAREN) {
                        if (!first)
                            this.eat(lexer_1.TokenType.COMMA);
                        args.push(this.pAdditive());
                        first = false;
                    }
                    var rpar = this.eat(lexer_1.TokenType.RIGHT_PAREN);
                    return {
                        type: exports.NodeType.FUNC_CALL,
                        name: name_1.value,
                        arguments: args,
                        line: name_1.line,
                        col: name_1.column,
                        length: rpar.column - name_1.column
                    };
                }
                return {
                    type: exports.NodeType.GET_VARIABLE,
                    name: name_1.value,
                    line: name_1.line,
                    col: name_1.column,
                    length: name_1.value.length
                };
            }
            else if (this.current.type === lexer_1.TokenType.KEYWORD && this.current.value === "func") {
                this.eat(lexer_1.TokenType.KEYWORD);
                var name_2 = this.eat(lexer_1.TokenType.IDENTIFIER);
                this.eat(lexer_1.TokenType.LEFT_PAREN);
                var first = true;
                var args = [];
                while (this.current.type !== lexer_1.TokenType.RIGHT_PAREN) {
                    if (!first)
                        this.eat(lexer_1.TokenType.COMMA);
                    args.push(this.eat(lexer_1.TokenType.IDENTIFIER));
                    first = false;
                }
                this.eat(lexer_1.TokenType.RIGHT_PAREN);
                this.eat(lexer_1.TokenType.LEFT_BRACE);
                var body = [];
                while (this.current.type !== lexer_1.TokenType.RIGHT_BRACE) {
                    body.push(this.pExpression());
                }
                this.eat(lexer_1.TokenType.RIGHT_BRACE);
                return {
                    type: exports.NodeType.DEFINE_FUNC,
                    name: name_2.value,
                    arguments: args,
                    body: body,
                    line: name_2.line,
                    col: name_2.column,
                    length: name_2.value.length
                };
            }
            else if (this.current.type === lexer_1.TokenType.STRING) {
                var str = this.eat(lexer_1.TokenType.STRING);
                return {
                    type: exports.NodeType.STRING,
                    value: str.value,
                    line: str.line,
                    col: str.column,
                    length: str.value.length
                };
            }
            else if (this.current.type === lexer_1.TokenType.LEFT_PAREN) {
                this.eat(lexer_1.TokenType.LEFT_PAREN);
                var node = this.pAdditive();
                this.eat(lexer_1.TokenType.RIGHT_PAREN);
                return node;
            }
            else {
                error_2.Error.raiseError(this.input, this.current.line, this.current.column, "Parsing Error", "Unexpected token: '".concat(this.current.type, "'"), this.current.value.length);
            }
        };
        Parser.prototype.pMultiplicative = function () {
            var node = this.pPrimary();
            while (this.current.type === lexer_1.TokenType.SLASH || this.current.type === lexer_1.TokenType.STAR) {
                var op = this.eat(this.current.type);
                var right = this.pPrimary();
                node = {
                    type: exports.NodeType.BINARY_EXPR,
                    left: node,
                    right: right,
                    op: op,
                    line: node.line,
                    col: node.col,
                    length: right.col - node.col + right.length
                };
            }
            return node;
        };
        Parser.prototype.pAdditive = function () {
            var node = this.pMultiplicative();
            while (this.current.type === lexer_1.TokenType.PLUS || this.current.type === lexer_1.TokenType.MINUS) {
                var op = this.eat(this.current.type);
                var right = this.pMultiplicative();
                node = {
                    type: exports.NodeType.BINARY_EXPR,
                    left: node,
                    right: right,
                    op: op,
                    line: node.line,
                    col: node.col,
                    length: right.col - node.col + right.length
                };
            }
            if (this.current.type === lexer_1.TokenType.DOT) {
                var dot = this.eat(lexer_1.TokenType.DOT);
                var name_3 = this.eat(lexer_1.TokenType.IDENTIFIER);
                if (this.current.type === lexer_1.TokenType.LEFT_PAREN) {
                    this.eat(lexer_1.TokenType.LEFT_PAREN);
                    var first = true;
                    var args = [];
                    while (this.current.type !== lexer_1.TokenType.RIGHT_PAREN) {
                        if (!first)
                            this.eat(lexer_1.TokenType.COMMA);
                        args.push(this.pAdditive());
                        first = false;
                    }
                    var rpar = this.eat(lexer_1.TokenType.RIGHT_PAREN);
                    name_3 = {
                        type: exports.NodeType.FUNC_CALL,
                        name: name_3.value,
                        arguments: args,
                        line: name_3.line,
                        col: name_3.column,
                        length: rpar.column - name_3.column + name_3.value.length
                    };
                }
                node = {
                    type: exports.NodeType.PROPERTY_ACCESS,
                    value: node,
                    property: name_3,
                    line: node.line,
                    col: node.col,
                    length: dot.column - node.col
                };
                return node;
            }
            return node;
        };
        Parser.prototype.pClassFunction = function () {
            var type = null;
            if (this.current.type === lexer_1.TokenType.KEYWORD && (this.current.value === "public" || this.current.value === "private")) {
                type = this.eat(lexer_1.TokenType.KEYWORD);
            }
            var name = this.eat(lexer_1.TokenType.IDENTIFIER);
            this.eat(lexer_1.TokenType.LEFT_PAREN);
            var first = true;
            var args = [];
            while (this.current.type !== lexer_1.TokenType.RIGHT_PAREN) {
                if (!first)
                    this.eat(lexer_1.TokenType.COMMA);
                args.push(this.eat(lexer_1.TokenType.IDENTIFIER));
                first = false;
            }
            this.eat(lexer_1.TokenType.RIGHT_PAREN);
            this.eat(lexer_1.TokenType.LEFT_BRACE);
            var body = [];
            while (this.current.type !== lexer_1.TokenType.RIGHT_BRACE) {
                body.push(this.pExpression());
            }
            this.eat(lexer_1.TokenType.RIGHT_BRACE);
            return {
                type: exports.NodeType.CLASS_DEFINE_FUNC,
                name: name.value,
                arguments: args,
                body: body,
                funcType: type,
                line: name.line,
                col: name.column,
                length: name.value.length
            };
        };
        Parser.prototype.pExpression = function () {
            if (this.current.type === lexer_1.TokenType.KEYWORD) {
                if (this.current.value === "var") {
                    var keyw = this.eat(lexer_1.TokenType.KEYWORD);
                    var varName = this.eat(lexer_1.TokenType.IDENTIFIER);
                    this.eat(lexer_1.TokenType.EQUAL);
                    var varValue = this.pAdditive();
                    this.eat(lexer_1.TokenType.SEMICOLON);
                    return {
                        type: exports.NodeType.SET_VARIABLE,
                        name: varName.value,
                        value: varValue,
                        line: keyw.line,
                        col: keyw.column,
                        length: varValue.column - keyw.column + varValue.length
                    };
                }
                if (this.current.value === "return") {
                    var keyw = this.eat(lexer_1.TokenType.KEYWORD);
                    var returnValue = this.pAdditive();
                    this.eat(lexer_1.TokenType.SEMICOLON);
                    return {
                        type: exports.NodeType.RETURN,
                        value: returnValue,
                        line: keyw.line,
                        col: keyw.column,
                        length: returnValue.column - keyw.column
                    };
                }
                if (this.current.value === "class") {
                    var keyw = this.eat(lexer_1.TokenType.KEYWORD);
                    var name_4 = this.eat(lexer_1.TokenType.IDENTIFIER);
                    var lpar = this.eat(lexer_1.TokenType.LEFT_BRACE);
                    var body = [];
                    while (this.current.type !== lexer_1.TokenType.RIGHT_BRACE) {
                        body.push(this.pClassFunction());
                    }
                    this.eat(lexer_1.TokenType.RIGHT_BRACE);
                    return {
                        type: exports.NodeType.CLASS_DEFINE,
                        name: name_4.value,
                        body: body,
                        line: keyw.line,
                        col: keyw.column,
                        length: lpar.column - keyw.column + 1
                    };
                }
            }
            var add = this.pAdditive();
            if (add.type !== exports.NodeType.DEFINE_FUNC)
                this.eat(lexer_1.TokenType.SEMICOLON);
            return add;
        };
        Parser.prototype.parse = function (inp, token) {
            this.tokens = token;
            this.input = inp;
            this.current = this.tokens[0];
            this.index = 0;
            var body = [];
            while (this.current.type !== lexer_1.TokenType.EOF) {
                body.push(this.pExpression());
            }
            return {
                type: exports.NodeType.PROGRAM,
                body: body,
                line: 0,
                col: 0,
                length: 0
            };
        };
        return Parser;
    }());
    exports.Parser = Parser;
});
define("interpreter", ["require", "exports", "error", "builtins", "parser"], function (require, exports, error_3, builtins_1, parser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Interpreter = exports.Scope = exports.ObjectInteger = exports.ObjectString = exports.ObjectVoid = exports.InterpObject = exports.ClassDefineObject = exports.ClassObject = void 0;
    var ClassObject = /** @class */ (function () {
        function ClassObject(properties, classname) {
            this.properties = {};
            this.properties = properties;
            this.classname = classname;
            if (this.properties[classname]) {
                this.constructorCalled = true;
                this.properties[classname].call(this, this);
            }
        }
        ClassObject.prototype.get = function (prop) {
            return this.properties[prop] || new ObjectVoid();
        };
        ClassObject.prototype.set = function (prop, value) {
            this.properties[prop] = value;
            if (this.properties[this.classname] && !this.constructorCalled) {
                this.properties[this.classname].call(this, this);
                this.constructorCalled = true;
            }
            return new ObjectVoid();
        };
        return ClassObject;
    }());
    exports.ClassObject = ClassObject;
    var ClassDefineObject = /** @class */ (function () {
        function ClassDefineObject(properties, classname) {
            this.properties = {};
            this.properties = properties;
            this.classname = classname;
        }
        ClassDefineObject.prototype.get = function (prop) {
            return this.properties[prop] || new ObjectVoid();
        };
        ClassDefineObject.prototype.getClass = function () {
            return new ClassObject(this.properties, this.classname);
        };
        ClassDefineObject.prototype.__getinstance__ = function () {
            return this.getClass();
        };
        ClassDefineObject.prototype.set = function (prop, value) {
            this.properties[prop] = value;
            return new ObjectVoid();
        };
        return ClassDefineObject;
    }());
    exports.ClassDefineObject = ClassDefineObject;
    var InterpObject = /** @class */ (function () {
        function InterpObject(properties, builtin) {
            if (builtin === void 0) { builtin = false; }
            this.properties = {};
            this.properties = properties;
            this.builtin = builtin;
        }
        InterpObject.prototype.get = function (prop) {
            if (this.builtin)
                if (this[prop] !== undefined)
                    return this[prop].bind(this);
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
            return _super.call(this, {}, true) || this;
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
            var _this = _super.call(this, {}, true) || this;
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
    var ObjectInteger = /** @class */ (function (_super) {
        __extends(ObjectInteger, _super);
        function ObjectInteger(value) {
            var _this = _super.call(this, {}, true) || this;
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
    var Scope = /** @class */ (function () {
        function Scope(parent, isClass) {
            if (isClass === void 0) { isClass = false; }
            this.variables = {};
            this.parent = parent;
            this.isClass = isClass;
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
        Interpreter.prototype.visit_PROPERTYACCESS = function (node) {
            var _this = this;
            var value = this.visit(node.value);
            console.log(value, node.value);
            if (node.property.type === parser_1.NodeType.FUNC_CALL) {
                var func = value.get(node.property.name);
                if (func instanceof ObjectVoid) {
                    error_3.Error.raiseError(this.input, node.line, node.column, "Runtime Error", "Function '".concat(node.property.name, "' is not defined"), node.length);
                }
                var args = node.property.arguments.map(function (x) { return _this.visit(x); });
                var result = func.apply(void 0, args);
                return result;
            }
            else {
                return value.get(node.property.value);
            }
        };
        Interpreter.prototype.visit_CLASSDEFINEFUNC = function (node) {
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
            return { function: func, name: node.name };
        };
        Interpreter.prototype.visit_CLASSDEFINE = function (node) {
            var _this = this;
            var myclass = new ClassDefineObject({}, node.name);
            var properties = node.body.map(function (x) { return _this.visit(x); });
            for (var _i = 0, properties_1 = properties; _i < properties_1.length; _i++) {
                var prop = properties_1[_i];
                if (typeof prop.name === "string")
                    myclass.set(prop.name, prop.function);
                else
                    throw new SyntaxError("how the heck did you get here? please report this to the dev thx");
            }
            this.currentScope.set(node.name, myclass);
            return new ObjectVoid();
        };
        Interpreter.prototype.visit_FUNCCALL = function (node) {
            var _this = this;
            var func = node.name;
            var args = node.arguments.map(function (x) { return _this.visit(x); });
            var funcValue = this.currentScope.get(func);
            if (funcValue instanceof ObjectVoid) {
                error_3.Error.raiseError(this.input, node.line, node.column, "Runtime Error", "Function '".concat(func, "' is not defined"), func.length);
            }
            if (typeof funcValue !== "function" && !(funcValue instanceof ClassDefineObject)) {
                error_3.Error.raiseError(this.input, node.line, node.column, "Runtime Error", "'".concat(func, "' is not a function"), func.length);
            }
            if (funcValue instanceof ClassDefineObject) {
                return funcValue.__getinstance__();
            }
            var result = funcValue.apply(void 0, args);
            return result;
        };
        Interpreter.prototype.visit_GETVARIABLE = function (node) {
            var name = node.name;
            var value = this.currentScope.get(name);
            if (value instanceof ObjectVoid) {
                error_3.Error.raiseError(this.input, node.line, node.column, "Runtime Error", "Variable '".concat(name, "' is not defined"), name.length);
            }
            return value;
        };
        Interpreter.prototype.visit_RETURN = function (node) {
            var value = this.visit(node.value);
            if (this.currentScope === this.globalScope) {
                error_3.Error.raiseError(this.input, node.line, node.col, "Runtime Error", "'return' statement is not allowed in global scope", node.length);
            }
            this.currentScope.returnValue = value;
        };
        Interpreter.prototype.visit_STRING = function (node) {
            return new ObjectString(node.value);
        };
        Interpreter.prototype.visit_INTEGER = function (node) {
            return new ObjectInteger(node.value);
        };
        Interpreter.prototype.visit_BINARYEXPRESSION = function (node) {
            var left = this.visit(node.left);
            var right = this.visit(node.right);
            var op = node.op.value;
            if (typeof left === "function" || typeof right === "function") {
                error_3.Error.raiseError(this.input, node.line, node.col, "Runtime Error", "Cannot use function as operand", node.length);
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
        Interpreter.prototype.visit = function (node) {
            if (this["visit_" + node.type]) {
                return this["visit_" + node.type].call(this, node);
            }
            else {
                error_3.Error.raiseError(this.input, node.line, node.col, "Interpreter Error", "'".concat(node.type, "' hasn't been implemented yet."), node.length);
            }
        };
        return Interpreter;
    }());
    exports.Interpreter = Interpreter;
});
define("builtins", ["require", "exports", "interpreter"], function (require, exports, interpreter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function addTo(scope) {
        scope.set("print", function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            console.log.apply(console, args.map(function (x) { return x.__string__(); }));
            return new interpreter_1.ObjectVoid();
        });
        return scope;
    }
    exports.default = addTo;
});
define("index", ["require", "exports", "lexer", "parser", "interpreter"], function (require, exports, lexer_2, parser_2, interpreter_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code;
    var args = __spreadArray([], process.argv, true);
    console.log(args);
    var lexer = new lexer_2.Lexer();
    var parser = new parser_2.Parser();
    var tokens = lexer.lex(code);
    console.log(tokens);
    var interpreter = new interpreter_2.Interpreter(code);
    var ast = parser.parse(code, tokens);
    console.log(ast);
    interpreter.visit(ast);
});
