"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var SymbolTable_1 = __importDefault(require("../SymbolTable"));
var Source_1 = __importDefault(require("./Source"));
var DoubleQuote = '"';
var Tokens = (function () {
    function Tokens(baseTokens) {
        var _this = this;
        this.parseOneBaseToken = function (baseToken) {
            var baseTokenSource;
            var tokens;
            try {
                baseTokenSource = new Source_1.default(baseToken);
                tokens = _this.recursiveParse(baseTokenSource);
            }
            catch (err) {
                throw err;
            }
            return tokens;
        };
        this.baseTokens = baseTokens;
    }
    Tokens.prototype.parse = function () {
        return this.baseTokens
            .map(this.parseOneBaseToken)
            .reduce(function (prev, curr) {
            return __spreadArrays(prev, curr);
        }, [])
            .filter(function (t) { return t.length > 0; });
    };
    Tokens.prototype.recursiveParse = function (base, tokens) {
        if (tokens === void 0) { tokens = []; }
        var currChar = base.getNextChar();
        var lastIdx = tokens.length - 1;
        var end = tokens[lastIdx];
        if (currChar.length === 0) {
            return tokens;
        }
        if (SymbolTable_1.default.includes(currChar) && end) {
            return this.recursiveParse(base, __spreadArrays(tokens, [currChar]));
        }
        if (currChar && Array.isArray(currChar.match(/\s/))) {
            return this.recursiveParse(base, __spreadArrays(tokens, [""]));
        }
        if (currChar === DoubleQuote) {
            var str = this.buildStringToken(base);
            return this.recursiveParse(base, __spreadArrays(tokens, [str]));
        }
        if (SymbolTable_1.default.includes(end)) {
            return this.recursiveParse(base, __spreadArrays(tokens, [currChar]));
        }
        if (typeof end !== "string") {
            return this.recursiveParse(base, [currChar]);
        }
        tokens[lastIdx] = end.concat(currChar);
        return this.recursiveParse(base, tokens);
    };
    Tokens.prototype.buildStringToken = function (base, stringConstant) {
        if (stringConstant === void 0) { stringConstant = ""; }
        var currChar = base.getNextChar();
        if (currChar === DoubleQuote) {
            return "stringConstant=" + stringConstant;
        }
        return this.buildStringToken(base, stringConstant.concat(currChar));
    };
    return Tokens;
}());
exports.default = Tokens;
//# sourceMappingURL=Tokens.js.map