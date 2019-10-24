import SymbolTable from "../SymbolTable";
import Source from "./Source";

const DoubleQuote = '"';

export default class Tokens {
    private baseTokens: string[];

    constructor(baseTokens: string[]) {
        this.baseTokens = baseTokens;
    }

    public parse(): string[] {
        return this.baseTokens
            .map(this.parseOneBaseToken)
            .reduce((prev, curr) => {
                return [...prev, ...curr];
            }, [])
            .filter(t => t.length > 0);
    }

    private parseOneBaseToken = (baseToken: string): string[] => {
        let baseTokenSource: Source;
        let tokens: string[];

        try {
            baseTokenSource = new Source(baseToken);
            tokens = this.recursiveParse(baseTokenSource);
        } catch (err) {
            throw err;
        }
        return tokens;
    };

    private recursiveParse(base: Source, tokens: string[] = []): string[] {
        const currChar: string = base.getNextChar();

        const lastIdx: number = tokens.length - 1;
        const end: string = tokens[lastIdx];

        if (currChar.length === 0) {
            return tokens;
        }

        if (SymbolTable.includes(currChar) && end) {
            return this.recursiveParse(base, [...tokens, currChar]);
        }

        if (currChar && Array.isArray(currChar.match(/\s/))) {
            return this.recursiveParse(base, [...tokens, ""]);
        }

        if (currChar === DoubleQuote) {
            const str = this.buildStringToken(base);
            return this.recursiveParse(base, [...tokens, str]);
        }

        if (SymbolTable.includes(end)) {
            return this.recursiveParse(base, [...tokens, currChar]);
        }

        if (typeof end !== "string") {
            return this.recursiveParse(base, [currChar]);
        }

        tokens[lastIdx] = end.concat(currChar);
        return this.recursiveParse(base, tokens);
    }

    private buildStringToken(base: Source, stringConstant = ""): string {
        const currChar: string = base.getNextChar();

        if (currChar === DoubleQuote) {
            return `stringConstant=${stringConstant}`;
        }

        return this.buildStringToken(base, stringConstant.concat(currChar));
    }
}
