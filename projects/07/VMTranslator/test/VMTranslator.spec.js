import { expect } from "chai";
import VMTranslator from "../src/VMTranslator";
import File from "../src/File";

/**
 * NOTE:
 * When popping 2 operands off the stack, the first popped off
 * is 'y' and it is saved in the 'D' register. The second popped off
 * is 'x' and it is saved in the 'M' register.
 */

describe("VMTranslator", () => {
	const vm = new VMTranslator();

	it("Should parse raw VM Intermediate source code into string tokens", async () => {
		const path = "../../StackArithmetic/SimpleAdd/SimpleAdd.vm";
		const file = new File(path);

		const source = await file.read(path);

		const expected = ["push constant 7", "push constant 8", "add"];
		expect(vm.tokenize(source)).to.deep.equal(expected);
	});

	it("Should translate the 'push constant' command successfully", () => {
		const asmTokens = vm.translateCommandToHack("push constant 7", 0);

		expect(asmTokens).to.deep.equal([
			"@7",
			"D=A",
			"@SP",
			"A=M",
			"M=D",
			"@SP",
			"M=M+1",
		]);
	});

	it("Should translate the 'eq' operation successfully", () => {
		const tokens = vm.translateCommandToHack("eq", 0);

		expect(tokens).to.deep.equal([
			"@SP", // Pop 2 operands off the stack
			"M=M-1",
			"A=M",
			"D=M",
			"@SP",
			"M=M-1",
			"A=M", // 2 operands saved in 'D' and 'M' registers
			"D=M-D", // If they are 'eq', subtracting them should equal zero
			"@COMP.0.TRUE",
			"D;JEQ", // Is zero?
			"@COMP.0.FALSE",
			"0;JMP",
			"(COMP.0.TRUE)",
			"@SP",
			"A=M",
			"M=-1", // -1 means true
			"@SP",
			"M=M+1",
			"@COMP.0.END", // Go straight to the end
			"0;JMP",
			"(COMP.0.FALSE)",
			"@SP",
			"A=M",
			"M=0", // 0 means false
			"@SP",
			"M=M+1",
			"(COMP.0.END)", // Anything can come after
		]);
	});

	it("Should translate the 'lt' operation successfully (M < D?)", () => {
		const tokens = vm.translateCommandToHack("lt", 0);

		expect(tokens).to.deep.equal([
			"@SP", // Pop 2 operands off the stack, y = D and M = x
			"M=M-1",
			"A=M",
			"D=M",
			"@SP",
			"M=M-1",
			"A=M", // 2 operands saved in 'D' and 'M' registers
			"D=M-D", // If M < D, then D will be less than 0
			"@COMP.0.TRUE",
			"D;JLT", // Is less than zero?
			"@COMP.0.FALSE",
			"0;JMP",
			"(COMP.0.TRUE)",
			"@SP",
			"A=M",
			"M=-1", // -1 means true
			"@SP",
			"M=M+1",
			"@COMP.0.END", // Go straight to the end
			"0;JMP",
			"(COMP.0.FALSE)",
			"@SP",
			"A=M",
			"M=0", // 0 means false
			"@SP",
			"M=M+1",
			"(COMP.0.END)", // Anything can come after
		]);
	});

	it("Should translate the 'gt' operation successfully (M > D?)", () => {
		const tokens = vm.translateCommandToHack("gt", 42);

		expect(tokens).to.deep.equal([
			"@SP", // Pop 2 operands off the stack
			"M=M-1",
			"A=M",
			"D=M",
			"@SP",
			"M=M-1",
			"A=M", // 2 operands saved in 'D' and 'M' registers
			"D=M-D",
			"@COMP.42.TRUE",
			"D;JGT", // Is greater than zero?
			"@COMP.42.FALSE",
			"0;JMP",
			"(COMP.42.TRUE)",
			"@SP",
			"A=M",
			"M=-1", // -1 means true
			"@SP",
			"M=M+1",
			"@COMP.42.END", // Go straight to the end
			"0;JMP",
			"(COMP.42.FALSE)",
			"@SP",
			"A=M",
			"M=0", // 0 means false
			"@SP",
			"M=M+1",
			"(COMP.42.END)", // Anything can come after
		]);
	});

	it("Should translate the 'add' operation successfully", () => {
		const tokens = vm.translateCommandToHack("add", 0);

		expect(tokens).to.deep.equal([
			"@SP", // Pop 2 operands off the stack
			"M=M-1",
			"A=M",
			"D=M",
			"@SP",
			"M=M-1",
			"A=M", // 2 operands saved in 'D' and 'M' registers
			"D=D+M",
			"@SP",
			"A=M",
			"M=D",
			"@SP",
			"M=M+1",
		]);
	});

	it("Should translate the 'sub' operation successfully (x - y)", () => {
		const tokens = vm.translateCommandToHack("sub", 0);

		expect(tokens).to.deep.equal([
			"@SP", // Pop 2 operands off the stack
			"M=M-1",
			"A=M",
			"D=M", // y popped off; D=y
			"@SP",
			"M=M-1",
			"A=M", // 2 operands saved in 'D' and 'M' registers (M=x)
			"D=M-D",
			"@SP",
			"A=M",
			"M=D",
			"@SP",
			"M=M+1",
		]);
	});

	it("Should translate the 'neg' operation successfully", () => {
		const tokens = vm.translateCommandToHack("neg", 0);

		expect(tokens).to.deep.equal([
			"@SP",
			"M=M-1",
			"A=M",
			"D=-M", // y popped off; D=(neg)y
			"@SP",
			"A=M",
			"M=D",
			"@SP",
			"M=M+1", // When you push onto the stack you always advance the pointer
		]);
	});

	it("Should translate the 'and' operation successfully", () => {
		const tokens = vm.translateCommandToHack("and", 0);

		expect(tokens).to.deep.equal([
			"@SP", // Pop 2 operands off the stack
			"M=M-1",
			"A=M",
			"D=M",
			"@SP",
			"M=M-1",
			"A=M", // 2 operands saved in 'D' and 'M' registers
			"D=M&D", // bit-wise AND
			"@SP",
			"A=M",
			"M=D",
			"@SP",
			"M=M+1",
		]);
	});

	it("Should translate the 'or' operation successfully", () => {
		const tokens = vm.translateCommandToHack("or", 0);

		expect(tokens).to.deep.equal([
			"@SP", // Pop 2 operands off the stack
			"M=M-1",
			"A=M",
			"D=M",
			"@SP",
			"M=M-1",
			"A=M", // 2 operands saved in 'D' and 'M' registers
			"D=M|D", // bit-wise OR
			"@SP",
			"A=M",
			"M=D",
			"@SP",
			"M=M+1",
		]);
	});

	it("Should translate the 'not' operation successfully", () => {
		const tokens = vm.translateCommandToHack("not", 0);

		expect(tokens).to.deep.equal([
			"@SP",
			"M=M-1",
			"A=M",
			"D=!M", // y popped off; D=(not)y
			"@SP",
			"A=M",
			"M=D",
			"@SP",
			"M=M+1",
		]);
	});

	it("Should translate the 'pop local' command (pop from the stack onto the 'local' memory segment)", () => {
		const tokens = vm.translateCommandToHack("pop local 0", 0);

		expect(tokens).to.deep.equal([
			"@LCL", // "ARegister = LCL address integer"
			"D=M", // Now M & D === RAM[LCL]. The value of LCL is the RAM address that corresponds to the base of the 'local' memory segment for the VM
			"@0", // The index of the 'local' memory segment to access from 0. Here it is just 0.
			"D=D+A", // Get the address of the memory segment we need to access.
			"@R5", // Temp memory
			"M=D", // Save address to access at RAM[R5]
			"@SP", // POP from the stack
			"M=M-1",
			"A=M",
			"D=M", // 'D' holds value from the top of the stack
			"@R5",
			"A=M", // RAM[R5] === adress to correct idx of memory segment
			"M=D", // Set segment[idx] = value popped off stack
		]);
	});

	it("Should translate 'pop' to the 'argument' virtual memory segment", () => {
		const tokens = vm.translateCommandToHack("pop argument 2", 0);

		expect(tokens).to.deep.equal([
			"@ARG", // Points to base of 'argument' segment
			"D=M", // M is the integer address of the base of the 'argument' segment
			"@2",
			"D=D+A",
			"@R5",
			"M=D",
			"@SP",
			"M=M-1",
			"A=M",
			"D=M", // 'D' holds value from the top of the stack
			"@R5",
			"A=M", // RAM[R5] === adress to correct idx of memory segment
			"M=D", // Set segment[idx] = value popped off stack
		]);
	});

	it("Should translate 'pop' to the 'this' virtual memory segment", () => {
		const tokens = vm.translateCommandToHack("pop this 6", 0);

		expect(tokens).to.deep.equal([
			"@THIS",
			"D=M",
			"@6",
			"D=D+A",
			"@R5",
			"M=D",
			"@SP",
			"M=M-1",
			"A=M",
			"D=M", // 'D' holds value from the top of the stack
			"@R5",
			"A=M",
			"M=D",
		]);
	});

	it("Should translate 'pop' to the 'that' virtual memory segment", () => {
		const tokens = vm.translateCommandToHack("pop that 5", 0);

		expect(tokens).to.deep.equal([
			"@THAT",
			"D=M",
			"@5",
			"D=D+A",
			"@R5",
			"M=D",
			"@SP",
			"M=M-1",
			"A=M",
			"D=M", // 'D' holds value from the top of the stack
			"@R5",
			"A=M",
			"M=D",
		]);
	});

	it("Should translate 'push' from the argument segment to the stack top", () => {
		const tokens = vm.translateCommandToHack("push argument 1", 0);

		expect(tokens).to.deep.equal([
			"@ARG", // Address to the base address of 'argument'
			"D=M", // D = RAM[ARG], which is the base address to 'argument' segment
			"@1",
			"D=D+A",
			"A=D",
			"D=M", // The value of argument[index] is in 'D'
			"@SP",
			"A=M",
			"M=D", // pushed to stack now
			"@SP",
			"M=M+1", // Since we pushed to the stack we must advance teh stack pointer value
		]);
	});

	it("Should translate 'push' to temp segment at a certain index", () => {
		const tokens = vm.translateCommandToHack("push temp 6", 0);

		expect(tokens).to.deep.equal([]);
	});

	// Get more tests from PointerTest and StaticTest
});
