import Scope, { Identifier, VariableKind } from "../../types/Scope";

/**
 * Should match API for SymbolTable on page pg. 239
 */

export default class IdentifierTable {
    private scope: Scope;

    constructor() {
        this.scope = {
            classLevel: {
                field: [],
                static: [],
            },
            subroutineLevel: {
                varLocal: [],
                argument: [],
            },
        };
    }

    /**
     * Starts a new subroutine scope (resets the subroutine's symbol table)
     */
    public startSubroutine() {
        this.scope.subroutineLevel = {
            varLocal: [],
            argument: [],
        };
    }

    public define(identifier: Identifier) {
        switch (identifier.kind) {
            case VariableKind.FIELD:
                this.scope.classLevel.field.push(identifier);
                break;
            case VariableKind.STATIC:
                this.scope.classLevel.static.push(identifier);
            default:
                throw new Error("Invalid variable kind" + identifier.kind);
        }
    }
}
