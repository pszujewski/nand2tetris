import JackTokenizer from "../JackTokenizer";
export default class SymbolTable {
    static get(char: string): string;
    static includes(char: string): boolean;
    static isSemi(char: string): boolean;
    static isOp(jackTokenizer: JackTokenizer): boolean;
    static isUnaryOp(char: string): boolean;
}
//# sourceMappingURL=index.d.ts.map