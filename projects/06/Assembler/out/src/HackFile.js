"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const fspath = require("path");
const Util_1 = require("./Util");
class HackFile {
    constructor(fileName) {
        this.fileName = fileName;
    }
    write(machineCodes) {
        const name = this.fileName.replace(".asm", ".hack");
        const path = fspath.resolve(__dirname, `../bin/${name}`);
        const content = this.getContent(machineCodes);
        return new Promise(resolve => {
            fs.writeFile(path, content, err => {
                if (err) {
                    Util_1.default.error("Unable to write data to cache");
                }
                resolve();
            });
        });
    }
    getContent(machineCodes) {
        return machineCodes.map((c) => `${c}\n`).join("");
    }
}
exports.default = HackFile;
//# sourceMappingURL=HackFile.js.map