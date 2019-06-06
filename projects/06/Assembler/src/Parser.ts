/**
 * Breaks each assembly command into its underlying components (fields and symbols)
 */

export default class Parser {
    private pathToAsmFile: string = null;

    public constructor(pathToAsmFile: string) {
        this.pathToAsmFile = pathToAsmFile;
    }

    public parse(): void {
        
    }
}