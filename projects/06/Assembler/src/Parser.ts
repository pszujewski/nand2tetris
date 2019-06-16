import SymbolTable from "./SymbolTable";
import { Command, CommandType } from "./types";

/**
 * Breaks each assembly command into its underlying components (fields and symbols)
 * Parser receives an array of assembly code instructions. Each index in the array contains
 * one line from the source file.
 */

export default class Parser {
    private symbolTable: SymbolTable;

    public constructor() {
        this.symbolTable = new SymbolTable();
    }

    public parse(asmInstructions: string[]): Command[] {
        let commands: Command[];

        try {
            asmInstructions.forEach(this.handleLCommands);
            commands = asmInstructions.map(this.parseOneInstruction);
        } catch (err) {
            throw err;
        }

        return commands;
    }

    private handleLCommands = (instruction: string, idx: number) => {
        if (this.isLCommand(instruction)) {
            const c: Command = this.getLCommand(instruction, idx);
            this.symbolTable.add(c.tokens.symbol, idx);
        }
    };

    private parseOneInstruction = (
        instruction: string,
        idx: number
    ): Command => {
        if (this.isACommand(instruction)) {
            return this.getACommand(instruction);
        }

        if (this.isLCommand(instruction)) {
            return this.getLCommand(instruction, idx);
        }

        return this.getCCommand(instruction);
    };

    private isLCommand(instruction: string): boolean {
        const matches: RegExpMatchArray = instruction.match(/^\([\w\d]*\)$/g);
        if (Array.isArray(matches)) {
            return matches.length > 0;
        }
        return false;
    }

    private isACommand(instruction: string): boolean {
        return instruction.indexOf("@") === 0;
    }

    private getACommand(instruction: string): Command {
        const aValue: string = instruction.replace("@", "").trim();
        const asInt: number = parseInt(aValue);
        const isNanVal: boolean = Number.isNaN(asInt);

        return {
            commandType: CommandType.ACommand,
            tokens: {
                symbol: isNanVal ? aValue : null,
                value: isNanVal ? this.resolveSymbol(aValue) : asInt,
                dest: null,
                comp: null,
                jump: null,
            },
        };
    }

    /**
     *
     * @param asmSymbol
     *
     * Returns the memory address for the given symbol, if this is a variable
     * declaration, we need to generate a memory address and savethe record to
     * the symbol table
     */
    private resolveSymbol(asmSymbol: string): number {
        return this.symbolTable.resolveSymbol(asmSymbol);
    }

    private getCCommand(instruction: string): Command {
        const dest: string = this.getCDest(instruction);
        const isJump: boolean = instruction.indexOf(";J") > -1;
        const comp: string = this.getCompField(instruction);

        return {
            commandType: CommandType.CCommand,
            tokens: {
                symbol: null,
                value: null,
                dest,
                comp,
                jump: isJump ? this.getCJump(instruction) : null,
            },
        };
    }

    private getCompField(instruction: string): string {
        let comp: string;
        comp = instruction.replace(/(;J\w+)/g, "").trim();
        comp = comp.replace(/(\w=)/g, "").trim();
        return comp;
    }

    private getCJump(instruction: string): string {
        const idx: number = instruction.indexOf("J");
        return instruction.substring(idx).trim();
    }

    private getCDest(instruction: string): string {
        const idx: number = instruction.indexOf("=");
        if (idx > -1) {
            return instruction.substring(0, idx).trim();
        }
        return null;
    }

    private getLCommand(instruction: string, idx: number): Command {
        const symbol = instruction
            .replace("(", "")
            .replace(")", "")
            .trim();

        return {
            commandType: CommandType.LCommand,
            tokens: {
                symbol,
                value: idx + 1, //just the next instruction location idx. Add this to the symbol table
                dest: null,
                comp: null,
                jump: null,
            },
        };
    }
}
