"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Symbol_1 = __importDefault(require("../../types/Symbol"));
var symbols = [
    Symbol_1.default.CurlyRight,
    Symbol_1.default.CurlyLeft,
    Symbol_1.default.ParenRight,
    Symbol_1.default.ParenLeft,
    Symbol_1.default.BracketRight,
    Symbol_1.default.BracketLeft,
    Symbol_1.default.Period,
    Symbol_1.default.Comma,
    Symbol_1.default.Semi,
    Symbol_1.default.Plus,
    Symbol_1.default.Minus,
    Symbol_1.default.Times,
    Symbol_1.default.SlashRight,
    Symbol_1.default.Ampersand,
    Symbol_1.default.Pipe,
    Symbol_1.default.LessThan,
    Symbol_1.default.GreaterThan,
    Symbol_1.default.Equals,
    Symbol_1.default.Not,
];
var amp = "&";
var lt = "<";
var gt = ">";
var SymbolTable = (function () {
    function SymbolTable() {
    }
    SymbolTable.get = function (char) {
        var i;
        if (char === amp) {
            return Symbol_1.default.Ampersand;
        }
        if (char === lt) {
            return Symbol_1.default.LessThan;
        }
        if (char === gt) {
            return Symbol_1.default.GreaterThan;
        }
        for (i = 0; i < symbols.length; i++) {
            if (symbols[i] === char) {
                return symbols[i];
            }
        }
        throw new Error("Failed to identify symbol");
    };
    SymbolTable.includes = function (char) {
        return symbols.includes(char);
    };
    SymbolTable.isSemi = function (char) {
        return char === Symbol_1.default.Semi;
    };
    SymbolTable.isOp = function (char) {
        return [
            Symbol_1.default.Plus,
            Symbol_1.default.Minus,
            Symbol_1.default.Times,
            Symbol_1.default.SlashRight,
            amp,
            Symbol_1.default.Pipe,
            gt,
            lt,
            Symbol_1.default.Equals,
        ].includes(char);
    };
    SymbolTable.isUnaryOp = function (char) {
        var unaries = [Symbol_1.default.Not, Symbol_1.default.Minus];
        return unaries.includes(char);
    };
    return SymbolTable;
}());
exports.default = SymbolTable;
//# sourceMappingURL=index.js.map