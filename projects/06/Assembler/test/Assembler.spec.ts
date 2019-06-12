import { expect } from "chai";
import Assembler from "../src/Assembler";

interface ASMInputTest {
    path: string;
    expectedTokens: string[];
}

const asmTests: ASMInputTest[] = [
    {
        path: `${__dirname}/asmExamples/Add.asm`,
        expectedTokens: ["@2", "D=A", "@3", "D=D+A", "@0", "M=D"],
    },
    {
        path: `${__dirname}/asmExamples/Max.asm`,
        expectedTokens: [
            "@R0",
            "D=M",
            "@R1",
            "D=D-M",
            "@OUTPUT_FIRST",
            "D;JGT",
            "@R1",
            "D=M",
            "@OUTPUT_D",
            "0;JMP",
            "(OUTPUT_FIRST)",
            "@R0",
            "D=M",
            "(OUTPUT_D)",
            "@R2",
            "M=D",
            "(INFINITE_LOOP)",
            "@INFINITE_LOOP",
            "0;JMP",
        ],
    },
];

describe("Assembler getASMTokens for a source ASM file", () => {
    const assembler: Assembler = new Assembler();
    let asmTest: ASMInputTest;

    it("Should parse asm input into its tokens", async () => {
        let result: string[];

        for (asmTest of asmTests) {
            try {
                result = await assembler.getASMTokens(asmTest.path);
            } catch (err) {
                result = err;
            }
            expect(result).to.equal(asmTest.expectedTokens);
        }
    });
});
