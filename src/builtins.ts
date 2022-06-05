import { Scope, ObjectVoid, ObjectString, ObjectInteger, InterpObject, ObjectFloat } from "./interpreter"
import { Error } from "./error"

export default function addTo(scope: Scope, input: string): Scope {

    scope.set("print", function (...args) {
        console.log(...args.map(x => x.__string__()));
        return new ObjectVoid();
    })

    scope.set("Int", new InterpObject({
        toInt: function(value) {
            if (!(value instanceof ObjectString))
                Error.raiseError(input, 0, 0, "Runtime Error", "Expected string for argument to Int.toInt", 0);
            const val = parseInt(value.value);
            if (
                Number.isNaN(val) ||
                val.toString().length !== value.value.length
            )
                return new ObjectVoid();
            return new ObjectInteger(val);
        }
    }))

    scope.set("Float", new InterpObject({
        toFloat: function(value) {
            if (!(value instanceof ObjectString))
                Error.raiseError(input, 0, 0, "Runtime Error", "Expected string for argument to Float.toFloat", 0);
            const val = parseFloat(value.value);
            if (
                Number.isNaN(val) ||
                val.toString().length !== value.value.length
            )
                return new ObjectVoid();
            return new ObjectInteger(val);
        }
    }))

    scope.set("String", new InterpObject({
        toString: function(value) {
            if (!(value instanceof ObjectInteger) && !(value instanceof ObjectFloat))
                Error.raiseError(input, 0, 0, "Runtime Error", "Expected integer or float for argument to String.toString", 0);
            return new ObjectString(value.value.toString());
        }
    }))

    return scope;
}