import { Identifier, VariableKind } from "../../types/Scope";
export default class IdentifierTable {
    private scope;
    private nameOfClass;
    private subroutineType;
    private isVoidReturnType;
    constructor();
    setNameOfClass(className: string): void;
    setIsVoidReturnType(isVoid: boolean): void;
    subroutineIsVoidReturnType(): boolean;
    setSubroutineType(keyword: string): void;
    isMethodSubroutine(): boolean;
    isFunctionSubroutine(): boolean;
    isConstructorSubroutine(): boolean;
    getNameOfClass(): string;
    getSubroutineName(): string;
    startSubroutine(): void;
    setSubroutineName(name: string): void;
    define(identifier: Identifier): void;
    getVarKind(kind: string): VariableKind;
    getVarCountForKind(kind: VariableKind): number;
    countLocalVarsForCurrentSubroutine(): number;
    kindOf(name: string): VariableKind;
    typeOf(name: string): string;
    exists(name: string): boolean;
    indexOf(name: string): number;
    private getIdentifierRecordFromName;
    private getIdentifiersList;
}
//# sourceMappingURL=IdentifierTable.d.ts.map