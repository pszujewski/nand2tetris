import Symbol from "../../types/Symbol";

const symbols: string[] = [
    Symbol.CurlyRight,
    Symbol.CurlyLeft,
    Symbol.ParenRight,
    Symbol.ParenLeft,
    Symbol.BracketRight,
    Symbol.BracketLeft,
    Symbol.Period,
    Symbol.Comma,
    Symbol.Semi,
    Symbol.Plus,
    Symbol.Minus,
    Symbol.Times,
    Symbol.SlashRight,
    Symbol.Ampersand,
    Symbol.Pipe,
    Symbol.LessThan,
    Symbol.GreaterThan,
    Symbol.Equals,
    Symbol.Not,
];

export default class SymbolTable {
    static get(char: string): string {
        let i: number;

        if (char === "&") {
            return Symbol.Ampersand;
        }

        if (char === "<") {
            return Symbol.LessThan;
        }

        if (char === ">") {
            return Symbol.GreaterThan;
        }

        for (i = 0; i < symbols.length; i++) {
            if (symbols[i] === char) {
                return symbols[i];
            }
        }

        throw new Error("Failed to identify symbol");
    }

    static includes(char: string): boolean {
        return symbols.includes(char);
    }

    static isSemi(char: string): boolean {
        return char === Symbol.Semi;
    }
}
