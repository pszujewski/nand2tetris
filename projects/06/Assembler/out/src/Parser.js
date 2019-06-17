"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SymbolTable_1 = require("./SymbolTable");
const types_1 = require("./types");
class Parser {
    constructor() {
        this.removeLCommands = (instruction, idx) => {
            if (this.isLCommand(instruction)) {
                const ct = this.lCommands.length;
                const c = this.getLCommand(instruction, idx - ct);
                this.symbolTable.add(c.tokens.symbol, c.tokens.value);
                this.lCommands.push(c.tokens.symbol);
                return false;
            }
            return true;
        };
        this.parseOneInstruction = (instruction, idx) => {
            if (this.isACommand(instruction)) {
                return this.getACommand(instruction);
            }
            if (this.isLCommand(instruction)) {
                return this.getLCommand(instruction, idx);
            }
            return this.getCCommand(instruction);
        };
        this.symbolTable = new SymbolTable_1.default();
        this.lCommands = [];
    }
    parse(asmInstructions) {
        let commands;
        try {
            commands = asmInstructions
                .filter(this.removeLCommands)
                .map(this.parseOneInstruction);
            this.lCommands = [];
        }
        catch (err) {
            throw err;
        }
        return commands;
    }
    isLCommand(instruction) {
        const matches = instruction.match(/^\([\w\d]*\)$/g);
        if (Array.isArray(matches)) {
            return matches.length > 0;
        }
        return false;
    }
    isACommand(instruction) {
        return instruction.indexOf("@") === 0;
    }
    getACommand(instruction) {
        const aValue = instruction.replace("@", "").trim();
        const asInt = parseInt(aValue);
        const isNanVal = Number.isNaN(asInt);
        return {
            commandType: types_1.CommandType.ACommand,
            tokens: {
                symbol: isNanVal ? aValue : null,
                value: isNanVal ? this.resolveSymbol(aValue) : asInt,
                dest: null,
                comp: null,
                jump: null,
            },
        };
    }
    resolveSymbol(asmSymbol) {
        return this.symbolTable.resolveSymbol(asmSymbol);
    }
    getCCommand(instruction) {
        const dest = this.getCDest(instruction);
        const isJump = instruction.indexOf(";J") > -1;
        const comp = this.getCompField(instruction);
        return {
            commandType: types_1.CommandType.CCommand,
            tokens: {
                symbol: null,
                value: null,
                dest,
                comp,
                jump: isJump ? this.getCJump(instruction) : null,
            },
        };
    }
    getCompField(instruction) {
        let comp;
        comp = instruction.replace(/(;J\w+)/g, "").trim();
        comp = comp.replace(/(\w+=)/g, "").trim();
        return comp;
    }
    getCJump(instruction) {
        const idx = instruction.indexOf("J");
        return instruction.substring(idx).trim();
    }
    getCDest(instruction) {
        const idx = instruction.indexOf("=");
        if (idx > -1) {
            return instruction.substring(0, idx).trim();
        }
        return null;
    }
    getLCommand(instruction, idx) {
        const symbol = instruction
            .replace("(", "")
            .replace(")", "")
            .trim();
        return {
            commandType: types_1.CommandType.LCommand,
            tokens: {
                symbol,
                value: idx,
                dest: null,
                comp: null,
                jump: null,
            },
        };
    }
}
exports.default = Parser;
//# sourceMappingURL=Parser.js.map