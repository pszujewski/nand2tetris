"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var XMLWriter = (function () {
    function XMLWriter(tokenizer) {
        this.tokenizer = tokenizer;
    }
    XMLWriter.prototype.getKeyword = function () {
        return "<keyword> " + this.tokenizer.getKeyword() + " </keyword>";
    };
    XMLWriter.prototype.getIdentifier = function () {
        return "<identifier> " + this.tokenizer.getIdentifier() + " </identifier>";
    };
    XMLWriter.prototype.getSymbol = function () {
        return "<symbol> " + this.tokenizer.getSymbol() + " </symbol>";
    };
    XMLWriter.prototype.getIntConst = function () {
        return "<integerConstant> " + this.tokenizer.getIntVal() + " </integerConstant>";
    };
    XMLWriter.prototype.getStringConst = function () {
        return "<stringConstant> " + this.tokenizer.getStringVal() + " </stringConstant>";
    };
    return XMLWriter;
}());
exports.default = XMLWriter;
//# sourceMappingURL=XMLWriter.js.map