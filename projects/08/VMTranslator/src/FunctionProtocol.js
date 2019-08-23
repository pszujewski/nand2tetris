import * as util from "./util";

export default class FunctionProtocol {
	constructor(vmCommand) {
		this.vmCommand = vmCommand;
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

	callCommand() {
		return [""];
	}

	funcDeclaration() {
		const name = this.tokens[1];
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
			"@R15",
			"D=M",
			"@5",
			"A=D-A",
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
