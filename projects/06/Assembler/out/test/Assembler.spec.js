"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Assembler_1 = require("../src/Assembler");
var CommandType;
(function (CommandType) {
    CommandType["ACommand"] = "ACommand";
    CommandType["CCommand"] = "CCommand";
    CommandType["LCommand"] = "LCommand";
})(CommandType || (CommandType = {}));
const asmTests = [
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
const commandsExample = [
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
        const assembler = new Assembler_1.default();
        let asmTest;
        it("Should parse asm file input into its tokens", () => __awaiter(this, void 0, void 0, function* () {
            let result;
            for (asmTest of asmTests) {
                try {
                    result = yield assembler.getASMTokens(asmTest.path);
                }
                catch (err) {
                    result = err;
                }
                chai_1.expect(result).to.deep.equal(asmTest.expectedTokens);
            }
        }));
    });
    describe("Assember::parseASMInstructions to get the Commands", () => {
        const assembler = new Assembler_1.default();
        it("Should parse the tokens from Add.asm into commands", () => {
            let commands;
            const exTokens = [
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
            }
            catch (err) {
                commands = err;
            }
            chai_1.expect(commands).to.deep.equal(commandsExample);
        });
    });
    describe("Assembler::translateToMachineCode", () => {
        const assembler = new Assembler_1.default();
        it("Should parse commands array into array of binary codes", () => {
            let result;
            try {
                result = assembler.translateToMachineCode(commandsExample);
            }
            catch (err) {
                result = err;
            }
            chai_1.expect(result).to.deep.equal(binaryCodesExample);
        });
    });
    describe("Assembler", () => {
        const assembler = new Assembler_1.default();
        it("Should read commands from a file and parse them into binary machine code", () => __awaiter(this, void 0, void 0, function* () {
            let result;
            let tokens;
            let commands;
            try {
                tokens = yield assembler.getASMTokens(`${__dirname}/asmExamples/Rect.asm`);
                commands = assembler.parseASMInstructions(tokens);
                result = assembler.translateToMachineCode(commands);
                yield assembler.write(result, "testing.asm");
            }
            catch (err) {
                result = err;
            }
            chai_1.expect(result[0]).to.equal("0000000000000000");
        }));
    });
});
//# sourceMappingURL=Assembler.spec.js.map