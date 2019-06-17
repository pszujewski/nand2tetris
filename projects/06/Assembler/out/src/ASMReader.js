"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
class ASMReader {
    getTokens(path) {
        return __awaiter(this, void 0, void 0, function* () {
            let tokens;
            try {
                const source = yield this.readFileAsync(path);
                const rawFile = source.toString();
                tokens = rawFile.replace(/\r/g, "").split("\n");
                tokens = tokens
                    .map(t => t.trim())
                    .filter(t => t && t.length > 0 && t.indexOf("//") !== 0)
                    .map(t => {
                    const idx = t.indexOf("//");
                    if (idx > -1) {
                        return t.replace(/\/\/.+/g, "").trim();
                    }
                    return t;
                });
            }
            catch (err) {
                throw err;
            }
            return tokens;
        });
    }
    readFileAsync(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }
}
exports.default = ASMReader;
//# sourceMappingURL=ASMReader.js.map