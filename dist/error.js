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
