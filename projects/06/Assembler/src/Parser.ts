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

    public parse(): void {
        return null;
    }
}