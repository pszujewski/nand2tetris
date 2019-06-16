import BinaryConverter from "./BinaryConverter";
import { Command, CommandType } from "./types";

export default class Code {
    public translateAsm(commands: Command[]): string[] {
        let machineCodes: string[];

        try {
            const codes: string[] = commands.map(this.translate);
            machineCodes = codes.filter((c: string) => c !== "L_COMMAND");
        } catch (err) {
            throw err;
        }

        return machineCodes;
    }

    private translate = (c: Command): string => {
        if (c.commandType === CommandType.ACommand) {
            return this.translateA(c);
        }

        if (c.commandType === CommandType.LCommand) {
            return "L_COMMAND";
        }

        return this.translateC(c);
    };

    private translateA = (c: Command): string => {
        const converter = new BinaryConverter();
        const asStr = c.tokens.value.toString();

        const asBinary: string = converter.getBitsFromDecimalNumber(asStr);
        return `0${asBinary}`;
    };

    private translateC = (c: Command): string => {
        let id: string[] = ["1", "1", "1"];
        const comp: string[] = this.getCompFields(c.tokens.comp);

        const dest: string[] = this.getDestFields(c.tokens.dest);
        const jump: string[] = this.getJumpFields(c.tokens.jump);

        return [...id, ...comp, ...dest, ...jump].join("");
    };

    private getJumpFields(jumpToken: string): string[] {
        if (!jumpToken) return ["0", "0", "0"];

        const jumpMap: any = {
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

    private getDestFields(destToken: string): string[] {
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

    private getCompFields(compToken: string): string[] {
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
                throw new Error(
                    `Failed to match comp mnemonic ${compToken} to binary code.`
                );
        }
    }
}
