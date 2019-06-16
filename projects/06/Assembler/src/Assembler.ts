import ASMReader from "./ASMReader";
import Parser from "./Parser";
import Code from "./Code";
import Log from "./Util";
import { Command } from "./types";

export default class Assembler {
    private code: Code;
    private parser: Parser;
    private asmReader: ASMReader;

    public constructor() {
        this.code = new Code();
        this.parser = new Parser();
        this.asmReader = new ASMReader();
    }

    public async getASMTokens(pathToFile: string): Promise<string[]> {
        let tokens: string[];

        try {
            tokens = await this.asmReader.getTokens(pathToFile);
        } catch (err) {
            Log.error(err.message);
        }
        return tokens;
    }

    public parseASMInstructions(asmTokens: string[]) {
        let commands: Command[];

        try {
            commands = this.parser.parse(asmTokens);
        } catch (err) {
            Log.error(err.message);
        }

        return commands;
    }

    public translateToMachineCode(commands: Command[]): string[] {
        let binaryCodes: string[];

        try {
            binaryCodes = this.code.translateAsm(commands);
        } catch (err) {
            Log.error(err.message);
        }

        return binaryCodes;
    }
}
