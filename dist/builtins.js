"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interpreter_1 = require("./interpreter");
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
