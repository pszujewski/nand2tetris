import Keyword from "../../types/Keyword";

const keywords: Keyword[] = [
    Keyword.Class,
    Keyword.Class,
    Keyword.Method,
    Keyword.Function,
    Keyword.Constructor,
    Keyword.Int,
    Keyword.Boolean,
    Keyword.Char,
    Keyword.Void,
    Keyword.Var,
    Keyword.Static,
    Keyword.Field,
    Keyword.Let,
    Keyword.Do,
    Keyword.If,
    Keyword.Else,
    Keyword.While,
    Keyword.Return,
    Keyword.True,
    Keyword.False,
    Keyword.Null,
    Keyword.This,
];

export default class KeywordTable {
    static get(keyword: string): Keyword {
        let i: number;

        for (i = 0; i < keywords.length; i++) {
            if (keywords[i] === keyword) {
                return keywords[i];
            }
        }

        throw new Error("Invalid keyword");
    }

    static includes(word: string): boolean {
        return keywords.includes(word);
    }
}
