import { expect } from "chai";
import Assembler from "../src/Assembler";

describe("Assembler getASMTokens for a source ASM file", () => {
    const assembler: Assembler = new Assembler();
    
    it("Should parse Max.asm into its tokens", async () => {
        const path = `${__dirname}/asmExamples/Max.asm`;
        let result: string[];

        result = await assembler.getASMTokens(path);
    });
});