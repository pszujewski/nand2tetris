"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var fspath = __importStar(require("path"));
var XMLWriter = (function () {
    function XMLWriter(tokenizer, writeToPath) {
        this.tokenizer = tokenizer;
        this.writeToPath = writeToPath;
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
    XMLWriter.prototype.toFile = function (xml) {
        var name = "./out/" + this.writeToPath + ".xml";
        var path = fspath.resolve(__dirname, name);
        return new Promise(function (resolve) {
            fs.writeFile(path, xml, function (err) {
                if (err) {
                    console.error("Unable to write data to cache");
                }
                resolve();
            });
        });
    };
    return XMLWriter;
}());
exports.default = XMLWriter;
//# sourceMappingURL=XMLWriter.js.map