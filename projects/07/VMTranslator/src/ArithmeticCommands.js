import * as util from "./util";

export const ACommands = {
	eq: "eq",
	lt: "lt",
	gt: "gt",
	add: "add",
	sub: "sub",
	neg: "neg",
	and: "and",
	or: "or",
	not: "not",
};

export default class ArithmeticCommands {
	eq(statementCount) {
		return util.flatten([
			this.popTwoOperands(),
			"D=M-D",
			this.getComparisonBlocks(statementCount, "JEQ"),
		]);
	}

	lt(statementCount) {
		return util.flatten([
			this.popTwoOperands(),
			"D=M-D",
			this.getComparisonBlocks(statementCount, "JLT"),
		]);
	}

	gt(statementCount) {
		return util.flatten([
			this.popTwoOperands(),
			"D=M-D",
			this.getComparisonBlocks(statementCount, "JGT"),
		]);
	}

	add() {
		return util.flatten([
			this.popTwoOperands(),
			"D=D+M",
			this.pushDToStack(),
			this.advanceSP(),
		]);
	}

	sub() {
		return util.flatten([
			this.popTwoOperands(),
			"D=M-D",
			this.pushDToStack(),
			this.advanceSP(),
		]);
	}

	and() {
		return util.flatten([
			this.popTwoOperands(),
			"D=M&D",
			this.pushDToStack(),
			this.advanceSP(),
		]);
	}

	or() {
		return util.flatten([
			this.popTwoOperands(),
			"D=M|D",
			this.pushDToStack(),
			this.advanceSP(),
		]);
	}

	not() {
		return util.flatten([
			this.popOneOperand(),
			"D=!M",
			this.pushDToStack(),
			this.advanceSP(),
		]);
	}

	neg() {
		return util.flatten([
			this.popOneOperand(),
			"D=-M",
			this.pushDToStack(),
			this.advanceSP(),
		]);
	}

	popOneOperand() {
		return ["@SP", "M=M-1", "A=M"]; // one operand popped off and saved in 'M' register
	}

	popTwoOperands() {
		return [
			"@SP",
			"M=M-1",
			"A=M",
			"D=M", // First operand 'y' popped off and saved in 'D' register
			"@SP",
			"M=M-1",
			"A=M", // Second operand 'x' now saved in 'M' register
		];
	}

	getComparisonBlocks(statementCount, jumpCommand) {
		const ct = statementCount;
		return util.flatten([
			`@COMP.${ct}.TRUE`,
			`D;${jumpCommand}`,
			`@COMP.${ct}.FALSE`,
			"0;JMP",
			`(COMP.${ct}.TRUE)`,
			"@SP",
			"A=M",
			"M=-1", // -1 means true
			this.advanceSP(),
			`@COMP.${ct}.END`,
			"0;JMP",
			`(COMP.${ct}.FALSE)`,
			"@SP",
			"A=M",
			"M=0", // 0 means false
			this.advanceSP(),
			`(COMP.${ct}.END)`,
		]);
	}

	pushDToStack() {
		return ["@SP", "A=M", "M=D"];
	}

	advanceSP() {
		return ["@SP", "M=M+1"];
	}
}
