import ASMReader from "./ASMReader";
import Parser from "./Parser";
import Code from "./Code";
import Log from "./Util";
import { Command } from "./types";

export default class Assembler {
    private asmReader: ASMReader;
    private parser: Parser;
    private code: Code;

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

    public translateToMachineCode(commands: Command[]): string[] {
        this.code = new Code();
        let binaryCodes: string[];

        try {
            binaryCodes = this.code.translateAsm(commands);
        } catch (err) {
            Log.error(err.message);
        }

        return binaryCodes;
    }
}
