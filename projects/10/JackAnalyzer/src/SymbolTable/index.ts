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
    static includes(char: string): boolean {
        return symbols.includes(char);
    }
}
