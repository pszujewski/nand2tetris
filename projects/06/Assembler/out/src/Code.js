"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BinaryConverter_1 = require("./BinaryConverter");
const types_1 = require("./types");
class Code {
    constructor() {
        this.translate = (c) => {
            if (c.commandType === types_1.CommandType.ACommand) {
                return this.translateA(c);
            }
            if (c.commandType === types_1.CommandType.LCommand) {
                return "L_COMMAND";
            }
            return this.translateC(c);
        };
        this.translateA = (c) => {
            const converter = new BinaryConverter_1.default();
            const asStr = c.tokens.value.toString();
            const asBinary = converter.getBitsFromDecimalNumber(asStr);
            return `0${asBinary}`;
        };
        this.translateC = (c) => {
            let id = ["1", "1", "1"];
            const comp = this.getCompFields(c.tokens.comp);
            const dest = this.getDestFields(c.tokens.dest);
            const jump = this.getJumpFields(c.tokens.jump);
            return [...id, ...comp, ...dest, ...jump].join("");
        };
    }
    translateAsm(commands) {
        let machineCodes;
        try {
            const codes = commands.map(this.translate);
            machineCodes = codes.filter((c) => c !== "L_COMMAND");
        }
        catch (err) {
            throw err;
        }
        return machineCodes;
    }
    getJumpFields(jumpToken) {
        if (!jumpToken)
            return ["0", "0", "0"];
        const jumpMap = {
            JGT: ["0", "0", "1"],
            JEQ: ["0", "1", "0"],
            JGE: ["0", "1", "1"],
            JLT: ["1", "0", "0"],
            JNE: ["1", "0", "1"],
            JLE: ["1", "1", "0"],
            JMP: ["1", "1", "1"],
        };
        if (jumpMap[jumpToken]) {
            return jumpMap[jumpToken];
        }
        throw new Error(`Failed to match jump mnemonic ${jumpToken} to code.`);
    }
    getDestFields(destToken) {
        switch (destToken) {
            case "M":
                return ["0", "0", "1"];
            case "D":
                return ["0", "1", "0"];
            case "MD":
                return ["0", "1", "1"];
            case "A":
                return ["1", "0", "0"];
            case "AM":
                return ["1", "0", "1"];
            case "AD":
                return ["1", "1", "0"];
            case "AMD":
                return ["1", "1", "1"];
            default:
            case null:
                return ["0", "0", "0"];
        }
    }
    getCompFields(compToken) {
        switch (compToken) {
            case "0":
                return ["0", "1", "0", "1", "0", "1", "0"];
            case "1":
                return ["0", "1", "1", "1", "1", "1", "1"];
            case "-1":
                return ["0", "1", "1", "1", "0", "1", "0"];
            case "D":
                return ["0", "0", "0", "1", "1", "0", "0"];
            case "A":
                return ["0", "1", "1", "0", "0", "0", "0"];
            case "M":
                return ["1", "1", "1", "0", "0", "0", "0"];
            case "!D":
                return ["0", "0", "0", "1", "1", "0", "1"];
            case "!A":
                return ["0", "1", "1", "0", "0", "0", "1"];
            case "!M":
                return ["1", "1", "1", "0", "0", "0", "1"];
            case "-D":
                return ["0", "0", "0", "1", "1", "1", "1"];
            case "-A":
                return ["0", "1", "1", "0", "0", "1", "1"];
            case "-M":
                return ["1", "1", "1", "0", "0", "1", "1"];
            case "D+1":
                return ["0", "0", "1", "1", "1", "1", "1"];
            case "A+1":
                return ["0", "1", "1", "0", "1", "1", "1"];
            case "M+1":
                return ["1", "1", "1", "0", "1", "1", "1"];
            case "D-1":
                return ["0", "0", "0", "1", "1", "1", "0"];
            case "A-1":
                return ["0", "1", "1", "0", "0", "1", "0"];
            case "M-1":
                return ["1", "1", "1", "0", "0", "1", "0"];
            case "D+A":
                return ["0", "0", "0", "0", "0", "1", "0"];
            case "D+M":
                return ["1", "0", "0", "0", "0", "1", "0"];
            case "D-A":
                return ["0", "0", "1", "0", "0", "1", "1"];
            case "D-M":
                return ["1", "0", "1", "0", "0", "1", "1"];
            case "A-D":
                return ["0", "0", "0", "0", "1", "1", "1"];
            case "M-D":
                return ["1", "0", "0", "0", "1", "1", "1"];
            case "D&A":
                return ["0", "0", "0", "0", "0", "0", "0"];
            case "D&M":
                return ["1", "0", "0", "0", "0", "0", "0"];
            case "D|A":
                return ["0", "0", "1", "0", "1", "0", "1"];
            case "D|M":
                return ["1", "0", "1", "0", "1", "0", "1"];
            default:
                throw new Error(`Failed to match comp mnemonic ${compToken} to binary code.`);
        }
    }
}
exports.default = Code;
//# sourceMappingURL=Code.js.map