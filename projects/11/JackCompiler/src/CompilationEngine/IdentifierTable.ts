import Scope, {
    Identifier,
    VariableKind,
    SubroutineType,
} from "../../types/Scope";
import Keyword from "../../out/types/Keyword";

/**
 * Should match API for SymbolTable on page pg. 239
 */

export default class IdentifierTable {
    private scope: Scope;
    private nameOfClass: string;
    private subroutineType: SubroutineType;

    constructor() {
        this.scope = {
            classLevel: {
                field: [],
                static: [],
            },
            subroutineLevel: {
                subroutineName: "",
                varLocal: [],
                argument: [],
            },
        };
        this.nameOfClass = "";
    }

    public setNameOfClass(className: string) {
        this.nameOfClass = className;
    }

    public setSubroutineType(keyword: string) {
        switch (keyword) {
            case Keyword.Constructor:
                this.subroutineType = SubroutineType.Constructor;
                break;
            case Keyword.Function:
                this.subroutineType = SubroutineType.Function;
                break;
            case Keyword.Method:
                this.subroutineType = SubroutineType.Method;
                break;
            default:
                break;
        }
    }

    public isMethodSubroutine(): boolean {
        return this.subroutineType === SubroutineType.Method;
    }

    public isFunctionSubroutine(): boolean {
        return this.subroutineType === SubroutineType.Function;
    }

    public isConstructorSubroutine(): boolean {
        return this.subroutineType === SubroutineType.Constructor;
    }

    public getNameOfClass(): string {
        return this.nameOfClass;
    }

    public getSubroutineName(): string {
        return this.scope.subroutineLevel.subroutineName;
    }

    /**
     * Starts a new subroutine scope (resets the subroutine's symbol table)
     */
    public startSubroutine() {
        this.scope.subroutineLevel = {
            subroutineName: "",
            varLocal: [],
            argument: [],
        };
        this.subroutineType = SubroutineType.None;
    }

    public setSubroutineName(name: string) {
        this.scope.subroutineLevel.subroutineName = name;
    }

    /**
     *
     * @param identifier
     * Defines a new identifier of a given name, type and kind
     * and assigns it to a running index. STATIC and Field identifiers have a class
     * scope, while ARG and VAR identifiers have a subroutine scope
     */
    public define(identifier: Identifier) {
        switch (identifier.kind) {
            case VariableKind.FIELD:
                this.scope.classLevel.field.push(identifier);
                break;
            case VariableKind.STATIC:
                this.scope.classLevel.static.push(identifier);
                break;
            case VariableKind.ARG:
                this.scope.subroutineLevel.argument.push(identifier);
                break;
            case VariableKind.VAR:
                this.scope.subroutineLevel.varLocal.push(identifier);
                break;
            default:
                throw new Error("Invalid variable kind" + identifier.kind);
        }
    }

    public getVarKind(kind: string): VariableKind {
        switch (kind) {
            case Keyword.Field:
                return VariableKind.FIELD;
            case Keyword.Static:
                return VariableKind.STATIC;
            case Keyword.Var:
                return VariableKind.VAR;
            default:
                throw new Error(`Cannot determine var kind for ${kind}`);
        }
    }

    public getVarCountForKind(kind: VariableKind): number {
        switch (kind) {
            case VariableKind.FIELD:
                return this.scope.classLevel.field.length;
            case VariableKind.STATIC:
                return this.scope.classLevel.static.length;
            case VariableKind.ARG:
                return this.scope.subroutineLevel.argument.length;
            case VariableKind.VAR:
                return this.scope.subroutineLevel.varLocal.length;
            default:
                throw new Error("Invalid variable kind" + kind);
        }
    }

    public countLocalVarsForCurrentSubroutine(): number {
        return this.getVarCountForKind(VariableKind.VAR);
    }

    /**
     *
     * @param name
     * Returns the kind of the named identifier (STATIC, ARG, FIELD...) in
     * the current scope. If the identifier is unknown in the current
     * scope, returns NONE.
     */
    public kindOf(name: string): VariableKind {
        return this.getIdentifierRecordFromName(name).record.kind;
    }

    public typeOf(name: string): string {
        return this.getIdentifierRecordFromName(name).record.type;
    }

    public exists(name: string) {
        return this.indexOf(name) > -1;
    }

    public indexOf(name: string): number {
        return this.getIdentifierRecordFromName(name).index;
    }

    private getIdentifierRecordFromName(
        name: string
    ): { record: Identifier; index: number } {
        const allIdentifiers: Identifier[] = [
            ...this.scope.classLevel.field,
            ...this.scope.classLevel.static,
            ...this.scope.subroutineLevel.argument,
            ...this.scope.subroutineLevel.varLocal,
        ];

        for (let i = 0; i < allIdentifiers.length; i++) {
            if (allIdentifiers[i].name === name.trim()) {
                return { record: allIdentifiers[i], index: i };
            }
        }
        return {
            record: {
                name: "none",
                type: "string",
                kind: VariableKind.NONE,
            },
            index: -1,
        };
    }
}
