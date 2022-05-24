import { Scope, ObjectVoid, ObjectString, ObjectInteger } from "./interpreter"

export default function addTo(scope: Scope): Scope {

    scope.set("print", function (...args) {
        console.log(...args.map(x => x.__string__()));
        return new ObjectVoid();
    })

    return scope;
}