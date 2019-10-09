import JackTokenizer from "../JackTokenizer";

export default class XMLWriter {
    private tokenizer: JackTokenizer;

    constructor(tokenizer: JackTokenizer) {
        this.tokenizer = tokenizer;
    }

    public getKeyword(): string {
        return `<keyword> ${this.tokenizer.getKeyword()} </keyword>`;
    }

    public getIdentifier(): string {
        return `<identifier> ${this.tokenizer.getIdentifier()} </identifier>`;
    }

    public getSymbol(): string {
        return `<symbol> ${this.tokenizer.getSymbol()} </symbol>`;
    }

    public getIntConst(): string {
        return `<integerConstant> ${this.tokenizer.getIntVal()} </integerConstant>`;
    }

    public getStringConst(): string {
        return `<stringConstant> ${this.tokenizer.getStringVal()} </stringConstant>`;
    }
}
