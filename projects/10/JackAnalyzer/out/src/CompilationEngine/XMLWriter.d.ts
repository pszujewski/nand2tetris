import JackTokenizer from "../JackTokenizer";
export default class XMLWriter {
    private tokenizer;
    constructor(tokenizer: JackTokenizer);
    getKeyword(): string;
    getIdentifier(): string;
    getSymbol(): string;
    getIntConst(): string;
    getStringConst(): string;
}
//# sourceMappingURL=XMLWriter.d.ts.map