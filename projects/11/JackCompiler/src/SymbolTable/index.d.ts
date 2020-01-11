import JackTokenizer from "../JackTokenizer";
import VMCommand from "../../types/VMCommand";
export default class SymbolTable {
    static get(char: string): string;
    static includes(char: string): boolean;
    static isSemi(char: string): boolean;
    static isOp(jackTokenizer: JackTokenizer): boolean;
    static isUnaryOp(char: string): boolean;
    static getVMOperation(char: string): VMCommand;
    static isMultiply(char: string): boolean;
    static isDivide(char: string): boolean;
    static getVMUnaryOp(char: string): VMCommand;
}
//# sourceMappingURL=index.d.ts.map