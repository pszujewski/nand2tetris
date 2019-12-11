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

// The ID corresponds to the index position of the identifer in its array

export interface Identifier {
    name: string;
    type: string;
    kind: VariableKind;
}

export enum VariableKind {
    ARG = "ARG",
    VAR = "VAR",
    STATIC = "STATIC",
    FIELD = "FIELD",
    NONE = "NONE",
}
