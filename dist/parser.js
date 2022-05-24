"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = exports.NodeType = void 0;
var lexer_1 = require("./lexer");
var error_1 = require("./error");
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
        error_1.Error.raiseError(this.input, this.current.line, this.current.column, "Parsing Error", "Expected type '".concat(type, "', but got '").concat(this.current.type, "'"), this.current.value.length);
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
            error_1.Error.raiseError(this.input, this.current.line, this.current.column, "Parsing Error", "Unexpected token: '".concat(this.current.type, "'"), this.current.value.length);
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
