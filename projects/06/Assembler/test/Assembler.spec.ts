import { expect } from "chai";
import Assembler from "../src/Assembler";

interface Command {
    commandType: CommandType;
    tokens: CommandTokens;
}

interface CommandTokens {
    symbol: string;
    value: number;
    dest: string;
    comp: string;
    jump: string;
}

enum CommandType {
    ACommand = "ACommand",
    CCommand = "CCommand",
    LCommand = "LCommand",
}

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

const commandsExample: Command[] = [
    {
        commandType: CommandType.ACommand,
        tokens: {
            symbol: null,
            value: 2,
            dest: null,
            comp: null,
            jump: null,
        },
    },
    {
        commandType: CommandType.CCommand,
        tokens: {
            symbol: null,
            value: null,
            dest: "D",
            comp: "A",
            jump: null,
        },
    },
    {
        commandType: CommandType.ACommand,
        tokens: {
            symbol: null,
            value: 3,
            dest: null,
            comp: null,
            jump: null,
        },
    },
    {
        commandType: CommandType.CCommand,
        tokens: {
            symbol: null,
            value: null,
            dest: "D",
            comp: "D+A",
            jump: null,
        },
    },
    {
        commandType: CommandType.ACommand,
        tokens: {
            symbol: null,
            value: 0,
            dest: null,
            comp: null,
            jump: null,
        },
    },
    {
        commandType: CommandType.CCommand,
        tokens: {
            symbol: null,
            value: null,
            dest: "M",
            comp: "D",
            jump: null,
        },
    },
    {
        commandType: CommandType.ACommand,
        tokens: {
            symbol: null,
            value: 100,
            dest: null,
            comp: null,
            jump: null,
        },
    },
    {
        commandType: CommandType.CCommand,
        tokens: {
            symbol: null,
            value: null,
            dest: "D",
            comp: "A",
            jump: null,
        },
    },
    {
        commandType: CommandType.CCommand,
        tokens: {
            symbol: null,
            value: null,
            dest: null,
            comp: "D",
            jump: "JEQ",
        },
    },
    {
        commandType: CommandType.CCommand,
        tokens: {
            symbol: null,
            value: null,
            dest: null,
            comp: "0",
            jump: "JMP",
        },
    },
];

const binaryCodesExample = [
    "0000000000000010",
    "1110110000010000",
    "0000000000000011",
    "1110000010010000",
    "0000000000000000",
    "1110001100001000",
    "0000000001100100",
    "1110110000010000",
    "1110001100000010",
    "1110101010000111",
];

describe("Assember", () => {
    describe("Assembler getASMTokens for a source ASM file", () => {
        const assembler: Assembler = new Assembler();
        let asmTest: ASMInputTest;

        it("Should parse asm file input into its tokens", async () => {
            let result: string[];

            for (asmTest of asmTests) {
                try {
                    result = await assembler.getASMTokens(asmTest.path);
                } catch (err) {
                    result = err;
                }
                expect(result).to.deep.equal(asmTest.expectedTokens);
            }
        });
    });

    describe("Assember::parseASMInstructions to get the Commands", () => {
        const assembler: Assembler = new Assembler();

        it("Should parse the tokens from Add.asm into commands", () => {
            let commands: Command[];
            const exTokens: string[] = [
                "@2",
                "D=A",
                "@3",
                "D=D+A",
                "@0",
                "M=D",
                "@100",
                "D=A",
                "D;JEQ",
                "0;JMP",
            ];

            try {
                commands = assembler.parseASMInstructions(exTokens);
            } catch (err) {
                commands = err;
            }

            expect(commands).to.deep.equal(commandsExample);
        });
    });

    describe("Assembler::translateToMachineCode", () => {
        const assembler: Assembler = new Assembler();

        it("Should parse commands array into array of binary codes", () => {
            let result: string[];

            try {
                result = assembler.translateToMachineCode(commandsExample);
            } catch (err) {
                result = err;
            }

            expect(result).to.deep.equal(binaryCodesExample);
        });
    });
});
