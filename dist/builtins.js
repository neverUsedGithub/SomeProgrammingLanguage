"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interpreter_1 = require("./interpreter");
var error_1 = require("./error");
function addTo(scope, input) {
    scope.set("print", function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log.apply(console, args.map(function (x) { return x.__string__(); }));
        return new interpreter_1.ObjectVoid();
    });
    scope.set("Int", new interpreter_1.InterpObject({
        toInt: function (value) {
            if (!(value instanceof interpreter_1.ObjectString))
                error_1.Error.raiseError(input, 0, 0, "Runtime Error", "Expected string for argument to Int.toInt", 0);
            var val = parseInt(value.value);
            if (Number.isNaN(val) ||
                val.toString().length !== value.value.length)
                return new interpreter_1.ObjectVoid();
            return new interpreter_1.ObjectInteger(val);
        }
    }));
    scope.set("Float", new interpreter_1.InterpObject({
        toFloat: function (value) {
            if (!(value instanceof interpreter_1.ObjectString))
                error_1.Error.raiseError(input, 0, 0, "Runtime Error", "Expected string for argument to Float.toFloat", 0);
            var val = parseFloat(value.value);
            if (Number.isNaN(val) ||
                val.toString().length !== value.value.length)
                return new interpreter_1.ObjectVoid();
            return new interpreter_1.ObjectInteger(val);
        }
    }));
    scope.set("String", new interpreter_1.InterpObject({
        toString: function (value) {
            if (!(value instanceof interpreter_1.ObjectInteger) && !(value instanceof interpreter_1.ObjectFloat))
                error_1.Error.raiseError(input, 0, 0, "Runtime Error", "Expected integer or float for argument to String.toString", 0);
            return new interpreter_1.ObjectString(value.value.toString());
        }
    }));
    return scope;
}
exports.default = addTo;
