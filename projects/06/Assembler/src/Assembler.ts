import ASMReader from "./ASMReader";
import Log from "./Util";

export default class Assembler {
    private asmReader: ASMReader;

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
}