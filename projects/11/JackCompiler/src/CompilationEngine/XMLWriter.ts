import JackTokenizer from "../JackTokenizer";
import * as fs from "fs";
import * as fspath from "path";

export default class XMLWriter {
    private tokenizer: JackTokenizer;
    private writeToPath: string;

    constructor(tokenizer: JackTokenizer, writeToPath: string) {
        this.tokenizer = tokenizer;
        this.writeToPath = writeToPath;
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

    public toFile(xml: string): Promise<void> {
        const name = `./out/${this.writeToPath}.xml`;
        const path: string = fspath.resolve(__dirname, name);

        return new Promise<void>(resolve => {
            fs.writeFile(path, xml, err => {
                if (err) {
                    console.error("Unable to write data to cache");
                }
                resolve();
            });
        });
    }
}
