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
const ASMReader_1 = require("./ASMReader");
const Parser_1 = require("./Parser");
const HackFile_1 = require("./HackFile");
const Code_1 = require("./Code");
const Util_1 = require("./Util");
class Assembler {
    constructor() {
        this.code = new Code_1.default();
        this.parser = new Parser_1.default();
        this.asmReader = new ASMReader_1.default();
    }
    getASMTokens(pathToFile) {
        return __awaiter(this, void 0, void 0, function* () {
            let tokens;
            try {
                tokens = yield this.asmReader.getTokens(pathToFile);
            }
            catch (err) {
                Util_1.default.error(err.message);
            }
            return tokens;
        });
    }
    parseASMInstructions(asmTokens) {
        let commands;
        try {
            commands = this.parser.parse(asmTokens);
        }
        catch (err) {
            Util_1.default.error(err.message);
        }
        return commands;
    }
    translateToMachineCode(commands) {
        let binaryCodes;
        try {
            binaryCodes = this.code.translateAsm(commands);
        }
        catch (err) {
            Util_1.default.error(err.message);
        }
        return binaryCodes;
    }
    write(machineCodes, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            this.hackFile = new HackFile_1.default(fileName);
            try {
                yield this.hackFile.write(machineCodes);
            }
            catch (err) {
                Util_1.default.error(err.message);
            }
            return Promise.resolve(true);
        });
    }
}
exports.default = Assembler;
//# sourceMappingURL=Assembler.js.map