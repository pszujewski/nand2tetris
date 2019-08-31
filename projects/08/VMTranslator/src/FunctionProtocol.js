import * as util from "./util";

export default class FunctionProtocol {
	constructor(vmCommand, program) {
		this.vmCommand = vmCommand;
		this.program = program;
		this.tokens = this.getCommandTokens(vmCommand);
	}

	isCall() {
		const first = this.tokens[0];
		return first === "call" && this.tokens.length === 3;
	}

	isDeclaration() {
		const first = this.tokens[0];
		return first === "function" && this.tokens.length === 3;
	}

	isReturn() {
		return this.vmCommand.trim() === "return";
	}

	isLabel() {
		const first = this.tokens[0];
		return first === "label" && this.tokens.length === 2;
	}

	isIfGoto() {
		const first = this.tokens[0];
		return first === "if-goto" && this.tokens.length === 2;
	}

	isUnconditionalGoto() {
		const first = this.tokens[0];
		return first === "goto" && this.tokens.length === 2;
	}

	ifGoto() {
		const label = this.getLabelFromVMCommand();
		return ["@SP", "M=M-1", "A=M", "D=M", `@${label}`, "D;JGT"];
	}

	goto() {
		const label = this.getLabelFromVMCommand();
		return [`@${label}`, "0;JMP"];
	}

	labelCommand() {
		return [`(${this.getLabelFromVMCommand()})`];
	}

	getLabelFromVMCommand() {
		const currentFunc = this.program.currentFunc;
		const labelName = this.tokens[1];
		return `${currentFunc}$${labelName}`;
	}

	callCommand(index) {
		const localVarCount = Number(this.tokens[2]);
		const funcName = this.tokens[1].trim();

		return util.flatten([
			`@RETURN.${index}.ADDRESS`,
			"D=A",
			"@SP",
			"A=M",
			"M=D",
			"@SP",
			"M=M+1",
			this.pushPointerValueToStack("@LCL"),
			this.pushPointerValueToStack("@ARG"),
			this.pushPointerValueToStack("@THIS"),
			this.pushPointerValueToStack("@THAT"),
			`@${localVarCount + 5}`, // Reposition ARG according to n local variables in func
			"D=A",
			"@SP",
			"D=M-D",
			"@ARG",
			"M=D",
			"@SP", // Reposition LCL
			"D=M",
			"@LCL",
			"M=D",
			`@${funcName}`,
			"0;JMP",
			`(RETURN.${index}.ADDRESS)`,
		]);
	}

	pushPointerValueToStack(pointer) {
		return [pointer, "D=M", "@SP", "A=M", "M=D", "@SP", "M=M+1"];
	}

	funcDeclaration() {
		const name = this.tokens[1];
		this.program.setCurrentFunc(name);

		const localVarCount = Number(this.tokens[2]);
		const cmd = [`(${name})`];

		for (let i = 1; i <= localVarCount; i++) {
			cmd.push(this.pushZeroToStack());
		}
		return util.flatten(cmd);
	}

	returnCommand() {
		return util.flatten([
			"@LCL",
			"D=M",
			"@R15",
			"M=D",
			"@R15",
			"D=M",
			"@5",
			"A=D-A",
			"D=M",
			"@R14",
			"M=D",
			"@SP",
			"A=M-1",
			"D=M",
			"@ARG",
			"A=M",
			"M=D",
			"@ARG",
			"D=M+1",
			"@SP",
			"M=D",
			this.restorePointer("@THAT", 1),
			this.restorePointer("@THIS", 2),
			this.restorePointer("@ARG", 3),
			this.restorePointer("@LCL", 4),
			"@R14",
			"A=M", // Return Address is in A
			"0;JMP",
		]);
	}

	getCommandTokens(vmCommand) {
		if (typeof vmCommand !== "string") {
			return [];
		}
		return vmCommand.trim().split(" ");
	}

	pushZeroToStack() {
		return ["@0", "D=A", "@SP", "A=M", "M=D", "@SP", "M=M+1"];
	}

	restorePointer(pointer, idx) {
		return ["@R15", "D=M", `@${idx}`, "A=D-A", "D=M", pointer, "M=D"];
	}
}
