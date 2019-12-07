export default interface CurrentToken {
    value: string;
    type: string;
    isSymbol: boolean;
    isKeyword: boolean;
    isIntConst: boolean;
    isIdentifier: boolean;
    isStringConst: boolean;
}
