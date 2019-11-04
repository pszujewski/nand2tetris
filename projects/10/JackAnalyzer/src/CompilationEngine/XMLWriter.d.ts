import JackTokenizer from "../JackTokenizer";
export default class XMLWriter {
    private tokenizer;
    private writeToPath;
    constructor(tokenizer: JackTokenizer, writeToPath: string);
    getKeyword(): string;
    getIdentifier(): string;
    getSymbol(): string;
    getIntConst(): string;
    getStringConst(): string;
    toFile(xml: string): Promise<void>;
}
//# sourceMappingURL=XMLWriter.d.ts.map