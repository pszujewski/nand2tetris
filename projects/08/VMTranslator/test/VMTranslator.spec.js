import { expect } from "chai";
import VMTranslator from "../src/VMTranslator";
import VMFile from "../src/File";
import { LabelCounter } from "../src/index";

const setupTranslator = (mockFilePath = "./SimpleAdd/SimpleAdd.vm") => {
	const vmFile = new VMFile(mockFilePath);
	const vm = new VMTranslator(vmFile, new LabelCounter());
	return { vm, vmFile };
};

describe("VMTranslator", () => {
	it("Should translate the 'push constant' command successfully", () => {
		const { vm } = setupTranslator();
		const asmTokens = vm.translateCommandToHack("push constant 7");

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
		const { vm } = setupTranslator();
		const tokens = vm.translateCommandToHack("eq");

		expect(tokens).to.deep.equal([
			"@SP", // Pop 2 operands off the stack
			"M=M-1",
			"A=M",
			"D=M",
			"@SP",
			"M=M-1",
			"A=M", // 2 operands saved in 'D' and 'M' registers
			"D=M-D", // If they are 'eq', subtracting them should equal zero
			"@COMP.1.TRUE",
			"D;JEQ", // Is zero?
			"@COMP.1.FALSE",
			"0;JMP",
			"(COMP.1.TRUE)",
			"@SP",
			"A=M",
			"M=-1", // -1 means true
			"@SP",
			"M=M+1",
			"@COMP.1.END", // Go straight to the end
			"0;JMP",
			"(COMP.1.FALSE)",
			"@SP",
			"A=M",
			"M=0", // 0 means false
			"@SP",
			"M=M+1",
			"(COMP.1.END)", // Anything can come after
		]);
	});

	it("Should translate the 'lt' operation successfully (M < D?)", () => {
		const { vm } = setupTranslator();
		const tokens = vm.translateCommandToHack("lt");

		expect(tokens).to.deep.equal([
			"@SP", // Pop 2 operands off the stack, y = D and M = x
			"M=M-1",
			"A=M",
			"D=M",
			"@SP",
			"M=M-1",
			"A=M", // 2 operands saved in 'D' and 'M' registers
			"D=M-D", // If M < D, then D will be less than 0
			"@COMP.1.TRUE",
			"D;JLT", // Is less than zero?
			"@COMP.1.FALSE",
			"0;JMP",
			"(COMP.1.TRUE)",
			"@SP",
			"A=M",
			"M=-1", // -1 means true
			"@SP",
			"M=M+1",
			"@COMP.1.END", // Go straight to the end
			"0;JMP",
			"(COMP.1.FALSE)",
			"@SP",
			"A=M",
			"M=0", // 0 means false
			"@SP",
			"M=M+1",
			"(COMP.1.END)", // Anything can come after
		]);
	});

	it("Should translate the 'gt' operation successfully (M > D?)", () => {
		const { vm } = setupTranslator();
		const tokens = vm.translateCommandToHack("gt");

		expect(tokens).to.deep.equal([
			"@SP", // Pop 2 operands off the stack
			"M=M-1",
			"A=M",
			"D=M",
			"@SP",
			"M=M-1",
			"A=M", // 2 operands saved in 'D' and 'M' registers
			"D=M-D",
			"@COMP.1.TRUE",
			"D;JGT", // Is greater than zero?
			"@COMP.1.FALSE",
			"0;JMP",
			"(COMP.1.TRUE)",
			"@SP",
			"A=M",
			"M=-1", // -1 means true
			"@SP",
			"M=M+1",
			"@COMP.1.END", // Go straight to the end
			"0;JMP",
			"(COMP.1.FALSE)",
			"@SP",
			"A=M",
			"M=0", // 0 means false
			"@SP",
			"M=M+1",
			"(COMP.1.END)", // Anything can come after
		]);
	});

	it("Should translate the 'add' operation successfully", () => {
		const { vm } = setupTranslator();
		const tokens = vm.translateCommandToHack("add");

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
		const { vm } = setupTranslator();
		const tokens = vm.translateCommandToHack("sub");

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
		const { vm } = setupTranslator();
		const tokens = vm.translateCommandToHack("neg");

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
		const { vm } = setupTranslator();
		const tokens = vm.translateCommandToHack("and");

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
		const { vm } = setupTranslator();
		const tokens = vm.translateCommandToHack("or");

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
		const { vm } = setupTranslator();
		const tokens = vm.translateCommandToHack("not");

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
		const { vm } = setupTranslator();
		const tokens = vm.translateCommandToHack("pop local 0");

		expect(tokens).to.deep.equal([
			"@LCL", // "ARegister = LCL address integer"
			"D=M", // Now M & D === RAM[LCL]. The value of LCL is the RAM address that corresponds to the base of the 'local' memory segment for the VM
			"@0", // The index of the 'local' memory segment to access from 0. Here it is just 0.
			"D=D+A", // Get the address of the memory segment we need to access.
			"@R13", // Temp memory
			"M=D", // Save address to access at RAM[R13]
			"@SP", // POP from the stack
			"M=M-1",
			"A=M",
			"D=M", // 'D' holds value from the top of the stack
			"@R13",
			"A=M", // RAM[R13] === adress to correct idx of memory segment
			"M=D", // Set segment[idx] = value popped off stack
		]);
	});

	it("Should translate 'pop' to the 'argument' virtual memory segment", () => {
		const { vm } = setupTranslator();
		const tokens = vm.translateCommandToHack("pop argument 2");

		expect(tokens).to.deep.equal([
			"@ARG", // Points to base of 'argument' segment
			"D=M", // M is the integer address of the base of the 'argument' segment
			"@2",
			"D=D+A",
			"@R13",
			"M=D",
			"@SP",
			"M=M-1",
			"A=M",
			"D=M", // 'D' holds value from the top of the stack
			"@R13",
			"A=M", // RAM[R13] === adress to correct idx of memory segment
			"M=D", // Set segment[idx] = value popped off stack
		]);
	});

	it("Should translate 'pop' to the 'this' virtual memory segment", () => {
		const { vm } = setupTranslator();
		const tokens = vm.translateCommandToHack("pop this 6");

		expect(tokens).to.deep.equal([
			"@THIS",
			"D=M",
			"@6",
			"D=D+A",
			"@R13",
			"M=D",
			"@SP",
			"M=M-1",
			"A=M",
			"D=M", // 'D' holds value from the top of the stack
			"@R13",
			"A=M",
			"M=D",
		]);
	});

	it("Should translate 'pop' to the 'that' virtual memory segment", () => {
		const { vm } = setupTranslator();
		const tokens = vm.translateCommandToHack("pop that 5");

		expect(tokens).to.deep.equal([
			"@THAT",
			"D=M",
			"@5",
			"D=D+A",
			"@R13",
			"M=D",
			"@SP",
			"M=M-1",
			"A=M",
			"D=M", // 'D' holds value from the top of the stack
			"@R13",
			"A=M",
			"M=D",
		]);
	});

	it("Should translate 'push' from the argument segment to the stack top", () => {
		const { vm } = setupTranslator();
		const tokens = vm.translateCommandToHack("push argument 1");

		expect(tokens).to.deep.equal([
			"@ARG", // Address to the base address of 'argument'
			"D=M", // D = RAM[ARG], which is the base address to 'argument' segment
			"@1",
			"D=D+A",
			"A=D", // After adding the constant to the 'argument' address base, we set it to the A register
			"D=M", // The value of argument[index] is in 'D'
			"@SP",
			"A=M",
			"M=D", // pushed to stack now
			"@SP",
			"M=M+1", // Since we pushed to the stack we must advance the stack pointer value
		]);
	});

	it("Should translate 'push' to stack from temp segment at a certain index", () => {
		const { vm } = setupTranslator();
		const tokens = vm.translateCommandToHack("push temp 6");

		expect(tokens).to.deep.equal([
			"@R5",
			"D=A",
			"@6",
			"D=D+A",
			"A=D",
			"D=M",
			"@SP",
			"A=M",
			"M=D", // pushed to stack now
			"@SP",
			"M=M+1", // Advance the pointer
		]);
	});

	it("Should translate 'pop' to pointer segment at a certain index", () => {
		const { vm } = setupTranslator();
		const tokens = vm.translateCommandToHack("pop pointer 1");

		expect(tokens).to.deep.equal([
			"@THIS",
			"D=A", // The address of the base of the 'pointer' segment
			"@1",
			"D=D+A", // Adding to the address
			"@R13",
			"M=D", // Save the computed address in temp memory
			"@SP",
			"M=M-1", // Reduce the value of the stack pointer
			"A=M",
			"D=M", // Top stack value is in the 'D' register
			"@R13", // Get computed address
			"A=M",
			"M=D",
		]);
	});

	it("Should translate 'push' to stack from pointer segment at a certain index", () => {
		const { vm } = setupTranslator();
		const tokens = vm.translateCommandToHack("push pointer 1");

		expect(tokens).to.deep.equal([
			"@THIS",
			"D=A",
			"@1",
			"A=D+A",
			"D=M",
			"@SP",
			"A=M",
			"M=D",
			"@SP",
			"M=M+1",
		]);
	});

	it("Should translate 'pop' from stack to static segment at a certain index", () => {
		const { vm } = setupTranslator("./test/Test.vm");
		const tokens = vm.translateCommandToHack("pop static 8");

		expect(tokens).to.deep.equal([
			"@SP",
			"M=M-1",
			"A=M",
			"D=M", // top of the stack value is in D
			"@Test.8",
			"M=D",
		]);
	});

	it("Should translate 'push' to stack from static segment at a certain index of the segment", () => {
		const { vm } = setupTranslator("./test/Test.vm");
		const tokens = vm.translateCommandToHack("push static 3");

		expect(tokens).to.deep.equal([
			"@Test.3",
			"D=M",
			"@SP",
			"A=M",
			"M=D",
			"@SP",
			"M=M+1",
		]);
	});

	it("Should translate 'push' to stack from this segment at a certain index", () => {
		const { vm } = setupTranslator();
		const tokens = vm.translateCommandToHack("push this 2");

		expect(tokens).to.deep.equal([
			"@THIS",
			"D=M",
			"@2",
			"D=D+A",
			"A=D",
			"D=M",
			"@SP",
			"A=M",
			"M=D", // pushed to stack now
			"@SP",
			"M=M+1", // Advance the pointer
		]);
	});

	it("Should translate 'pop' from the top of the stack to the 'temp' memory segment", () => {
		const { vm } = setupTranslator();
		const tokens = vm.translateCommandToHack("pop temp 3");

		expect(tokens).to.deep.equal([
			"@R5",
			"D=A",
			"@3",
			"D=D+A",
			"@R13",
			"M=D",
			"@SP",
			"M=M-1",
			"A=M",
			"D=M", // 'D' holds value from the top of the stack
			"@R13",
			"A=M", // RAM[R13] === adress to correct idx of memory segment
			"M=D",
		]);
	});

	it("Should transanslate a VM function definition and initialize the function's LCL segment values to 0", () => {
		const { vm } = setupTranslator();

		const vmCommand = "function SimpleFunction.test 2";
		const tokens = vm.translateCommandToHack(vmCommand);

		expect(tokens).to.deep.equal([
			"(SimpleFunction.test)",
			"@0", // Push 0 to the stack
			"D=A",
			"@SP",
			"A=M",
			"M=D",
			"@SP",
			"M=M+1",
			"@0", // Push 0 to the stack again
			"D=A",
			"@SP",
			"A=M",
			"M=D",
			"@SP",
			"M=M+1",
		]);
	});

	it("Should return from a function, restoring the state of the calling function", () => {
		const { vm } = setupTranslator();
		const tokens = vm.translateCommandToHack("return");

		// R15 holds 'old' LCL and R14 holds return-address

		expect(tokens).to.deep.equal([
			"@LCL",
			"D=M",
			"@R15",
			"M=D", // RAM[LCL] = R15
			"@R15",
			"D=M",
			"@5",
			"A=D-A",
			"D=M", // D = return-address
			"@R14",
			"M=D", // RAM[14] = return-address
			"@SP", // pop stack-top to *ARG (RAM[ARG])
			"A=M-1",
			"D=M", // top of the stack is in D
			"@ARG",
			"A=M",
			"M=D", // RAM[ARG] = D (which was holding top of stack value). This is where our return value needs to live
			"@ARG",
			"D=M+1",
			"@SP",
			"M=D", // SP restored
			"@R15",
			"D=M",
			"@1",
			"A=D-A",
			"D=M",
			"@THAT",
			"M=D", // THAT is retored
			"@R15",
			"D=M",
			"@2",
			"A=D-A",
			"D=M",
			"@THIS",
			"M=D", // THIS is retored
			"@R15",
			"D=M",
			"@3",
			"A=D-A",
			"D=M",
			"@ARG",
			"M=D", // ARG is retored
			"@R15",
			"D=M",
			"@4",
			"A=D-A",
			"D=M",
			"@LCL",
			"M=D", // LCL is restored
			"@R14",
			"A=M", // Return Address is in A
			"0;JMP",
		]);
	});

	it("Should call a given VM function and initialize its stack frame", () => {
		const { vm } = setupTranslator();

		const vmCommand = "call Main.fibonacci 2";
		const tokens = vm.translateCommandToHack(vmCommand);

		expect(tokens).to.deep.equal([
			"@RETURN.1.ADDRESS", // Push return address
			"D=A",
			"@SP",
			"A=M",
			"M=D",
			"@SP",
			"M=M+1",
			"@LCL", // Push LCL
			"D=M",
			"@SP",
			"A=M",
			"M=D",
			"@SP",
			"M=M+1",
			"@ARG", // Push ARG
			"D=M",
			"@SP",
			"A=M",
			"M=D",
			"@SP",
			"M=M+1",
			"@THIS", // Push THIS
			"D=M",
			"@SP",
			"A=M",
			"M=D",
			"@SP",
			"M=M+1",
			"@THAT", // Push THAT
			"D=M",
			"@SP",
			"A=M",
			"M=D",
			"@SP",
			"M=M+1",
			"@7", // Reposition ARG; n = 2
			"D=A",
			"@SP",
			"D=M-D",
			"@ARG",
			"M=D",
			"@SP", // Reposition LCL
			"D=M",
			"@LCL",
			"M=D",
			"@Main.fibonacci",
			"0;JMP",
			"(RETURN.1.ADDRESS)",
		]);
	});

	it("Should translate the VM 'label' command", () => {
		const { vm } = setupTranslator();
		const vmCommand = "label LOOP";

		vm.setCurrentFunc("Main.fibonacci");
		const tokens = vm.translateCommandToHack(vmCommand);

		expect(tokens).to.deep.equal(["(Main.fibonacci$LOOP)"]);
	});

	it("Should transalte the VM 'if-goto' command", () => {
		const { vm } = setupTranslator();
		const vmCommand = "if-goto IF_TRUE";

		vm.setCurrentFunc("Main.fibonacci");
		const tokens = vm.translateCommandToHack(vmCommand);

		expect(tokens).to.deep.equal([
			"@SP",
			"M=M-1",
			"A=M",
			"D=M",
			"@Main.fibonacci$IF_TRUE",
			"D;JNE",
		]);
	});

	it("Should translate the unconditional jump 'goto' command", () => {
		const { vm } = setupTranslator();
		const vmCommand = "goto IF_FALSE";

		vm.setCurrentFunc("Main.fibonacci");
		const tokens = vm.translateCommandToHack(vmCommand);

		expect(tokens).to.deep.equal(["@Main.fibonacci$IF_FALSE", "0;JMP"]);
	});
});
