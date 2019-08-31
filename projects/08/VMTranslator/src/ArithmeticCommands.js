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
	constructor(labelCounter) {
		this.labelCounter = labelCounter;
	}

	eq() {
		const labelId = this.labelCounter.getNextId();

		return util.flatten([
			this.popTwoOperands(),
			"D=M-D",
			this.getComparisonBlocks(labelId, "JEQ"),
		]);
	}

	lt() {
		const labelId = this.labelCounter.getNextId();

		return util.flatten([
			this.popTwoOperands(),
			"D=M-D",
			this.getComparisonBlocks(labelId, "JLT"),
		]);
	}

	gt() {
		const labelId = this.labelCounter.getNextId();

		return util.flatten([
			this.popTwoOperands(),
			"D=M-D",
			this.getComparisonBlocks(labelId, "JGT"),
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

	getComparisonBlocks(id, jumpCommand) {
		return util.flatten([
			`@COMP.${id}.TRUE`,
			`D;${jumpCommand}`,
			`@COMP.${id}.FALSE`,
			"0;JMP",
			`(COMP.${id}.TRUE)`,
			"@SP",
			"A=M",
			"M=-1", // -1 means true
			this.advanceSP(),
			`@COMP.${id}.END`,
			"0;JMP",
			`(COMP.${id}.FALSE)`,
			"@SP",
			"A=M",
			"M=0", // 0 means false
			this.advanceSP(),
			`(COMP.${id}.END)`,
		]);
	}

	pushDToStack() {
		return ["@SP", "A=M", "M=D"];
	}

	advanceSP() {
		return ["@SP", "M=M+1"];
	}
}
