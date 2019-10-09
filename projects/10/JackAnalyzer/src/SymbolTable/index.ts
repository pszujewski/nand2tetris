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

const amp = "&";
const lt = "<";
const gt = ">";

export default class SymbolTable {
    static get(char: string): string {
        let i: number;

        if (char === amp) {
            return Symbol.Ampersand;
        }

        if (char === lt) {
            return Symbol.LessThan;
        }

        if (char === gt) {
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

    static isOp(char: string): boolean {
        return [
            Symbol.Plus,
            Symbol.Minus,
            Symbol.Times,
            Symbol.SlashRight,
            amp,
            Symbol.Pipe,
            gt,
            lt,
            Symbol.Equals,
        ].includes(char);
    }

    static isUnaryOp(char: string): boolean {
        const unaries: string[] = [Symbol.Not, Symbol.Minus];
        return unaries.includes(char);
    }
}
