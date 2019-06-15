import { Command, CommandType } from "./types";
/**
 * Breaks each assembly command into its underlying components (fields and symbols)
 * Parser receives an array of assembly code instructions. Each index in the array contains
 * one line from the source file.
 */

export default class Parser {
    private asmInstructions: string[] = null;

    public constructor(asmInstructions: string[]) {
        this.asmInstructions = asmInstructions;
    }

    public parse(): Command[] {
        let commands: Command[];

        try {
            commands = this.asmInstructions.map(this.parseOneInstruction);
        } catch (err) {
            throw err;
        }

        return commands;
    }

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
        return instruction.match(/^\([\w\d]*\)$/g).length > 0;
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
        console.log(asmSymbol);
        return null;
    }

    private getCCommand(instruction: string): Command {
        // const dest =

        return {
            commandType: CommandType.CCommand,
            tokens: {
                symbol: null,
                value: 0,
                dest: null,
                comp: null,
                jump: null,
            },
        };
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
