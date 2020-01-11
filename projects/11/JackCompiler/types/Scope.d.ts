export default interface Scope {
    classLevel: ClassScope;
    subroutineLevel: SubroutineScope;
}
export interface ClassScope {
    field: Identifier[];
    static: Identifier[];
}
export interface SubroutineScope {
    subroutineName: string;
    varLocal: Identifier[];
    argument: Identifier[];
}
export interface Identifier {
    name: string;
    type: string;
    kind: VariableKind;
}
export declare enum VariableKind {
    ARG = "ARG",
    VAR = "VAR",
    STATIC = "STATIC",
    FIELD = "FIELD",
    NONE = "NONE"
}
export declare enum SubroutineType {
    Constructor = "Constructor",
    Function = "Function",
    Method = "Method",
    None = "None"
}
//# sourceMappingURL=Scope.d.ts.map