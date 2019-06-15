import ASMReader from "./ASMReader";
import Parser from "./Parser";
import Log from "./Util";
import { Command } from "./types";

export default class Assembler {
    private asmReader: ASMReader;
    private parser: Parser;

    public async getASMTokens(pathToFile: string): Promise<string[]> {
        this.asmReader = new ASMReader();
        let tokens: string[];

        try {
            tokens = await this.asmReader.getTokens(pathToFile);
        } catch (err) {
            Log.error(err.message);
        }
        return tokens;
    }

    public parseASMInstructions(asmTokens: string[]) {
        this.parser = new Parser(asmTokens);
        let commands: Command[];

        try {
            commands = this.parser.parse();
        } catch (err) {
            Log.error(err.message);
        }

        return commands;
    }
}
