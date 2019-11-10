"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var TokenType_1 = __importDefault(require("../../types/TokenType"));
var KeywordTable_1 = __importDefault(require("../KeywordTable"));
var SymbolTable_1 = __importDefault(require("../SymbolTable"));
var JackTokenizer = (function () {
    function JackTokenizer(syntacticElements) {
        this.syntacticElements = syntacticElements;
        this.pointer = 0;
        this.currentToken = "";
        this.lookAheadToken = "";
    }
    JackTokenizer.prototype.isFirstTokenClassKeyword = function () {
        return KeywordTable_1.default.isClass(this.syntacticElements[0]);
    };
    JackTokenizer.prototype.hasMoreTokens = function () {
        return this.pointer < this.syntacticElements.length;
    };
    JackTokenizer.prototype.advance = function () {
        if (!this.currentToken) {
            this.currentToken = this.syntacticElements[this.pointer];
        }
        else {
            this.pointer = this.pointer + 1;
            this.currentToken = this.syntacticElements[this.pointer];
        }
        this.advanceLookAhead();
    };
    JackTokenizer.prototype.advanceLookAhead = function () {
        var lookAheadPointer = this.pointer + 1;
        if (this.syntacticElements[lookAheadPointer]) {
            this.lookAheadToken = this.syntacticElements[lookAheadPointer];
        }
    };
    JackTokenizer.prototype.lookAhead = function () {
        var lookAheadPointer = this.pointer + 1;
        return this.syntacticElements[lookAheadPointer];
    };
    JackTokenizer.prototype.getTokenType = function () {
        var token = this.currentToken;
        if (KeywordTable_1.default.includes(token)) {
            return TokenType_1.default.Keyword;
        }
        if (SymbolTable_1.default.includes(token)) {
            return TokenType_1.default.Symbol;
        }
        if (token.indexOf("stringConstant=") > -1) {
            return TokenType_1.default.StringConst;
        }
        if (!isNaN(parseInt(token))) {
            return TokenType_1.default.IntConst;
        }
        return TokenType_1.default.Identifier;
    };
    JackTokenizer.prototype.getCurrentToken = function () {
        return this.currentToken;
    };
    JackTokenizer.prototype.getCurrentTokenState = function () {
        var value = this.getCurrentToken();
        var type = this.getTokenType();
        return {
            value: value,
            type: type,
            isSymbol: type === TokenType_1.default.Symbol,
            isKeyword: type === TokenType_1.default.Keyword,
            isIntConst: type === TokenType_1.default.IntConst,
            isStringConst: type === TokenType_1.default.StringConst,
            isIdentifier: type === TokenType_1.default.Identifier,
        };
    };
    JackTokenizer.prototype.getKeyword = function () {
        return KeywordTable_1.default.get(this.currentToken);
    };
    JackTokenizer.prototype.getSymbol = function () {
        return SymbolTable_1.default.get(this.currentToken);
    };
    JackTokenizer.prototype.getIdentifier = function () {
        return this.currentToken.trim();
    };
    JackTokenizer.prototype.getIntVal = function () {
        return parseInt(this.currentToken);
    };
    JackTokenizer.prototype.getStringVal = function () {
        var token = this.currentToken;
        var toReplace = "stringConstant=";
        return token.replace(toReplace, "");
    };
    return JackTokenizer;
}());
exports.default = JackTokenizer;
//# sourceMappingURL=index.js.map