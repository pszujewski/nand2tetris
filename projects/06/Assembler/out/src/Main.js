#!/usr/bin/env node
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
const path = require("path");
const Assembler_1 = require("./Assembler");
const Util_1 = require("./Util");
const assembler = new Assembler_1.default();
class Main {
}
Main.execute = () => {
    const relPath = process.argv[2];
    if (typeof relPath !== "string") {
        throw new Error("Must provide valid relative path to input ASM file");
    }
    Main.assemble(path.resolve(__dirname, relPath));
};
Main.assemble = (pathToFile) => __awaiter(this, void 0, void 0, function* () {
    let tokens;
    let commands;
    let machineCodes;
    let fileName;
    try {
        tokens = yield assembler.getASMTokens(pathToFile);
        commands = assembler.parseASMInstructions(tokens);
        machineCodes = assembler.translateToMachineCode(commands);
        const pathTokens = pathToFile.split("/");
        fileName = pathTokens[pathTokens.length - 1];
        yield assembler.write(machineCodes, fileName);
    }
    catch (err) {
        Util_1.default.error(err.message);
    }
});
Main.execute();
//# sourceMappingURL=Main.js.map