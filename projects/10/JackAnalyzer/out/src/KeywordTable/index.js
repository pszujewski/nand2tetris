"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Keyword_1 = __importDefault(require("../../types/Keyword"));
var keywords = [
    Keyword_1.default.Class,
    Keyword_1.default.Class,
    Keyword_1.default.Method,
    Keyword_1.default.Function,
    Keyword_1.default.Constructor,
    Keyword_1.default.Int,
    Keyword_1.default.Boolean,
    Keyword_1.default.Char,
    Keyword_1.default.Void,
    Keyword_1.default.Var,
    Keyword_1.default.Static,
    Keyword_1.default.Field,
    Keyword_1.default.Let,
    Keyword_1.default.Do,
    Keyword_1.default.If,
    Keyword_1.default.Else,
    Keyword_1.default.While,
    Keyword_1.default.Return,
    Keyword_1.default.True,
    Keyword_1.default.False,
    Keyword_1.default.Null,
    Keyword_1.default.This,
];
var KeywordTable = (function () {
    function KeywordTable() {
    }
    KeywordTable.get = function (keyword) {
        var i;
        for (i = 0; i < keywords.length; i++) {
            if (keywords[i] === keyword) {
                return keywords[i];
            }
        }
        throw new Error("Invalid keyword");
    };
    KeywordTable.includes = function (word) {
        return keywords.includes(word);
    };
    KeywordTable.isClass = function (word) {
        return word === Keyword_1.default.Class;
    };
    KeywordTable.isClassVarDec = function (word) {
        return word === Keyword_1.default.Field || word === Keyword_1.default.Static;
    };
    KeywordTable.isSubroutineDec = function (word) {
        return (word === Keyword_1.default.Constructor ||
            word === Keyword_1.default.Function ||
            word == Keyword_1.default.Method);
    };
    KeywordTable.isKeywordConstant = function (word) {
        return (word === Keyword_1.default.True ||
            word === Keyword_1.default.False ||
            word === Keyword_1.default.Null ||
            word === Keyword_1.default.This);
    };
    return KeywordTable;
}());
exports.default = KeywordTable;
//# sourceMappingURL=index.js.map