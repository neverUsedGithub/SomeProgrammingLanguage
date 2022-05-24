import { Token, TokenType } from "./lexer"
import { Error } from "./error"

export const NodeType = {
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
}

export class Parser {
    tokens: Token[];
    current: Token;
    index: number;
    input: string;

    eat(type: string) {
        if (this.current.type === type) {
            let tok: Token = this.current;
            this.index++;
            this.current = this.tokens[this.index];
            return tok;
        }
        Error.raiseError(this.input, this.current.line, this.current.column, "Parsing Error", `Expected type '${type}', but got '${this.current.type}'`, this.current.value.length);
    }

    pPrimary() {
        if (this.current.type === TokenType.PLUS || this.current.type === TokenType.MINUS) {
            const op = this.eat(this.current.type);
            const p = this.pPrimary();

            return {
                type: p.type,
                value: p.value,
                line: op.line,
                col: op.column,
                length: p.column - op.column + p.length,
                op: op
            }
        }
        else if (this.current.type === TokenType.INTEGER) {
            const num = this.eat(TokenType.INTEGER);
            return {
                type: NodeType.INTEGER,
                value: parseInt(num.value),
                line: num.line,
                col: num.column,
                length: num.value.length
            };
        } else if (this.current.type === TokenType.IDENTIFIER) {
            let name = this.eat(TokenType.IDENTIFIER);
            if (this.current.type === TokenType.LEFT_PAREN) {
                this.eat(TokenType.LEFT_PAREN);
                
                let first: boolean = true;
                const args: any[] = [];
                while (this.current.type !== TokenType.RIGHT_PAREN) {
                    if (!first) 
                        this.eat(TokenType.COMMA)
                    
                    args.push(this.pAdditive());
                    first = false
                }

                const rpar = this.eat(TokenType.RIGHT_PAREN);

                return {
                    type: NodeType.FUNC_CALL,
                    name: name.value,
                    arguments: args,
                    line: name.line,
                    col: name.column,
                    length: rpar.column - name.column
                }
            }
            return {
                type: NodeType.GET_VARIABLE,
                name: name.value,
                line: name.line,
                col: name.column,
                length: name.value.length
            };
        } else if (this.current.type === TokenType.KEYWORD && this.current.value === "func") {
            this.eat(TokenType.KEYWORD);
            const name = this.eat(TokenType.IDENTIFIER);
            this.eat(TokenType.LEFT_PAREN);
            
            let first: boolean = true;
            const args: any[] = [];
            while (this.current.type !== TokenType.RIGHT_PAREN) {
                if (!first) 
                    this.eat(TokenType.COMMA)
                
                args.push(this.eat(TokenType.IDENTIFIER));
                first = false
            }

            this.eat(TokenType.RIGHT_PAREN);
            this.eat(TokenType.LEFT_BRACE);

            const body = [];
            while (this.current.type !== TokenType.RIGHT_BRACE) {
                body.push(this.pExpression());
            }
            this.eat(TokenType.RIGHT_BRACE);
            
            return {
                type: NodeType.DEFINE_FUNC,
                name: name.value,
                arguments: args,
                body: body,
                line: name.line,
                col: name.column,
                length: name.value.length
            }
        } else if (this.current.type === TokenType.STRING) {
            const str = this.eat(TokenType.STRING);
            return {
                type: NodeType.STRING,
                value: str.value,
                line: str.line,
                col: str.column,
                length: str.value.length
            };
        } else if (this.current.type === TokenType.LEFT_PAREN) {
            this.eat(TokenType.LEFT_PAREN);
            const node = this.pAdditive();
            this.eat(TokenType.RIGHT_PAREN);
            return node;
        } else {
            Error.raiseError(this.input, this.current.line, this.current.column, "Parsing Error", `Unexpected token: '${this.current.type}'`, this.current.value.length);
        }
    }

    pMultiplicative() {
        let node = this.pPrimary();

        while (this.current.type === TokenType.SLASH || this.current.type === TokenType.STAR) {
            let op = this.eat(this.current.type)
            let right = this.pPrimary()
            
            node = {
                type: NodeType.BINARY_EXPR,
                left: node,
                right: right,
                op: op,
                line: node.line,
                col: node.col,
                length: right.col - node.col + right.length
            }
        }

        return node;
    }

    pAdditive() {
        let node = this.pMultiplicative();

        while (this.current.type === TokenType.PLUS || this.current.type === TokenType.MINUS) {
            let op = this.eat(this.current.type)
            let right = this.pMultiplicative()
            
            node = {
                type: NodeType.BINARY_EXPR,
                left: node,
                right: right,
                op: op,
                line: node.line,
                col: node.col,
                length: right.col - node.col + right.length
            }
        }

        if (this.current.type === TokenType.DOT) {
            const dot = this.eat(TokenType.DOT);
            let name: any = this.eat(TokenType.IDENTIFIER);

            if (this.current.type === TokenType.LEFT_PAREN) {
                this.eat(TokenType.LEFT_PAREN);
                
                let first: boolean = true;
                const args: any[] = [];
                while (this.current.type !== TokenType.RIGHT_PAREN) {
                    if (!first) 
                        this.eat(TokenType.COMMA)
                    
                    args.push(this.pAdditive());
                    first = false
                }

                const rpar = this.eat(TokenType.RIGHT_PAREN);

                name = {
                    type: NodeType.FUNC_CALL,
                    name: name.value,
                    arguments: args,
                    line: name.line,
                    col: name.column,
                    length: rpar.column - name.column + name.value.length
                }
            }

            node = {
                type: NodeType.PROPERTY_ACCESS,
                value: node,
                property: name,
                line: node.line,
                col: node.col,
                length: dot.column - node.col
            }
            return node;
        }

        return node;
    }

    pClassFunction() {
        let type = null;

        if (this.current.type === TokenType.KEYWORD && (this.current.value === "public" || this.current.value === "private")) {
            type = this.eat(TokenType.KEYWORD);
        }

        const name = this.eat(TokenType.IDENTIFIER);
        this.eat(TokenType.LEFT_PAREN);
        
        let first: boolean = true;
        const args: any[] = [];
        while (this.current.type !== TokenType.RIGHT_PAREN) {
            if (!first) 
                this.eat(TokenType.COMMA)
            
            args.push(this.eat(TokenType.IDENTIFIER));
            first = false
        }

        this.eat(TokenType.RIGHT_PAREN);
        this.eat(TokenType.LEFT_BRACE);

        const body = [];
        while (this.current.type !== TokenType.RIGHT_BRACE) {
            body.push(this.pExpression());
        }
        this.eat(TokenType.RIGHT_BRACE);
        
        return {
            type: NodeType.CLASS_DEFINE_FUNC,
            name: name.value,
            arguments: args,
            body: body,
            funcType: type,
            line: name.line,
            col: name.column,
            length: name.value.length
        }
    }

    pExpression() {

        if (this.current.type === TokenType.KEYWORD) {
            if (this.current.value === "var") {
                const keyw = this.eat(TokenType.KEYWORD);
                const varName = this.eat(TokenType.IDENTIFIER);
                this.eat(TokenType.EQUAL);
                const varValue = this.pAdditive();
                this.eat(TokenType.SEMICOLON);
                return {
                    type: NodeType.SET_VARIABLE,
                    name: varName.value,
                    value: varValue,
                    line: keyw.line,
                    col: keyw.column,
                    length: varValue.column - keyw.column + varValue.length
                }
            }
            if (this.current.value === "return") {
                const keyw = this.eat(TokenType.KEYWORD);
                const returnValue = this.pAdditive();
                this.eat(TokenType.SEMICOLON);
                return {
                    type: NodeType.RETURN,
                    value: returnValue,
                    line: keyw.line,
                    col: keyw.column,
                    length: returnValue.column - keyw.column
                }
            }
            if (this.current.value === "class") {
                const keyw = this.eat(TokenType.KEYWORD);
                const name = this.eat(TokenType.IDENTIFIER);
                const lpar = this.eat(TokenType.LEFT_BRACE);

                const body = [];

                while (this.current.type !== TokenType.RIGHT_BRACE) {
                    body.push(this.pClassFunction());
                }
                this.eat(TokenType.RIGHT_BRACE);

                return {
                    type: NodeType.CLASS_DEFINE,
                    name: name.value,
                    body: body,
                    line: keyw.line,
                    col: keyw.column,
                    length: lpar.column - keyw.column + 1
                }
            }
        }

        const add = this.pAdditive();
        if (add.type !== NodeType.DEFINE_FUNC)
            this.eat(TokenType.SEMICOLON);
        return add;
    }

    parse(inp: string, token: Token[]) {
        this.tokens = token;
        this.input = inp;
        this.current = this.tokens[0];
        this.index = 0;


        const body = [];

        while (this.current.type !== TokenType.EOF) {
            body.push(this.pExpression());
        }

        return {
            type: NodeType.PROGRAM,
            body: body,
            line: 0,
            col: 0,
            length: 0
        }
    }
}