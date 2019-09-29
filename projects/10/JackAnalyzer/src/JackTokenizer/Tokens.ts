import SymbolTable from "../SymbolTable";

export default class Tokens {
    private baseTokens: string[];

    constructor(baseTokens: string[]) {
        this.baseTokens = baseTokens;
    }

    public parse(): string[] {
        const chunks: string[][] = this.baseTokens.map(this.parseOne);
    }

    private parseOne = (bt: string): string[] => {
        const tokens: string[] = [];
        const splitBt: string[] = bt.split("s");

        let i: number;
        let j: number;

        let initial: string;
        let nextToken: string;

        for (i = 0; i < splitBt.length; i++) {
            initial = splitBt[i];
            nextToken = "";

            for (j = 0; j < initial.length; j++) {
                const char: string = initial[j];

                if (nextToken && SymbolTable.isSymbol(char)) {
                    tokens.push(nextToken.trim());
                    nextToken = "";
                    tokens.push(char);
                } else {
                    nextToken = nextToken + char;
                }
            }
        }

        return tokens;
    };
}
