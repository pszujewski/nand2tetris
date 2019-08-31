import ArithmeticCommands from "./ArithmeticCommands";
import * as util from "./util";

export const MemorySegments = {
	constant: "constant",
};

export default class MemoryCommands {
	constructor(vmCommand) {
		this.cmd = vmCommand;
		this.arithmetic = new ArithmeticCommands();
	}

	pushConstant() {
		return util.flatten([
			`@${this.getSegmentIndex(this.cmd)}`,
			"D=A",
			this.arithmetic.pushDToStack(),
			this.arithmetic.advanceSP(),
		]);
	}

	popLocal() {
		return util.flatten([
			"@LCL",
			"D=M",
			`@${this.getSegmentIndex(this.cmd)}`,
			"D=D+A",
			this.saveDRegisterValueInTemp(),
			this.arithmetic.popOneOperand(),
			"D=M",
			this.setMRegisterToValueInTemp(),
		]);
	}

	popArgument() {
		return util.flatten([
			"@ARG",
			"D=M",
			`@${this.getSegmentIndex(this.cmd)}`,
			"D=D+A",
			this.saveDRegisterValueInTemp(),
			this.arithmetic.popOneOperand(),
			"D=M",
			this.setMRegisterToValueInTemp(),
		]);
	}

	popThis() {
		return util.flatten([
			"@THIS",
			"D=M",
			`@${this.getSegmentIndex(this.cmd)}`,
			"D=D+A",
			this.saveDRegisterValueInTemp(),
			this.arithmetic.popOneOperand(),
			"D=M",
			this.setMRegisterToValueInTemp(),
		]);
	}

	popThat() {
		return util.flatten([
			"@THAT",
			"D=M",
			`@${this.getSegmentIndex(this.cmd)}`,
			"D=D+A",
			this.saveDRegisterValueInTemp(),
			this.arithmetic.popOneOperand(),
			"D=M",
			this.setMRegisterToValueInTemp(),
		]);
	}

	pushArgument() {
		return util.flatten([
			"@ARG",
			"D=M",
			`@${this.getSegmentIndex(this.cmd)}`,
			"D=D+A",
			"A=D",
			"D=M",
			this.arithmetic.pushDToStack(),
			this.arithmetic.advanceSP(),
		]);
	}

	popPointer() {
		return util.flatten([
			"@THIS",
			"D=A",
			`@${this.getSegmentIndex()}`,
			"D=D+A",
			this.saveDRegisterValueInTemp(),
			this.arithmetic.popOneOperand(),
			"D=M",
			this.setMRegisterToValueInTemp(),
		]);
	}

	pushPointer() {
		return util.flatten([
			"@THIS",
			"D=A",
			`@${this.getSegmentIndex()}`,
			"A=D+A",
			"D=M",
			"@SP",
			"A=M",
			"M=D",
			this.arithmetic.advanceSP(),
		]);
	}

	popStatic(fileName) {
		return util.flatten([
			this.arithmetic.popOneOperand(),
			"D=M",
			`@${fileName}.${this.getSegmentIndex()}`,
			"M=D",
		]);
	}

	pushStatic(fileName) {
		return util.flatten([
			`@${fileName}.${this.getSegmentIndex()}`,
			"D=M",
			this.arithmetic.pushDToStack(),
			this.arithmetic.advanceSP(),
		]);
	}

	pushToStackGeneric() {
		return util.flatten([
			`${this.getSegmentBasePointer()}`,
			"D=M",
			`@${this.getSegmentIndex()}`,
			"D=D+A",
			"A=D",
			"D=M",
			this.arithmetic.pushDToStack(),
			this.arithmetic.advanceSP(),
		]);
	}

	popToTemp() {
		return util.flatten([
			`${this.getSegmentBasePointer()}`,
			"D=A",
			`@${this.getSegmentIndex()}`,
			"D=D+A",
			this.saveDRegisterValueInTemp(),
			this.arithmetic.popOneOperand(),
			"D=M",
			this.setMRegisterToValueInTemp(),
		]);
	}

	pushToTemp() {
		return util.flatten([
			`${this.getSegmentBasePointer()}`,
			"D=A",
			`@${this.getSegmentIndex()}`,
			"D=D+A",
			"A=D",
			"D=M",
			this.arithmetic.pushDToStack(),
			this.arithmetic.advanceSP(),
		]);
	}

	popFromStackGeneric() {
		return util.flatten([
			`${this.getSegmentBasePointer()}`,
			"D=M",
			`@${this.getSegmentIndex()}`,
			"D=D+A",
			this.saveDRegisterValueInTemp(),
			this.arithmetic.popOneOperand(),
			"D=M",
			this.setMRegisterToValueInTemp(),
		]);
	}

	getSegmentIndex() {
		const tokens = this.cmd.split(" ");
		return tokens[tokens.length - 1];
	}

	getSegmentBasePointer() {
		const hasToken = lookFor => this.cmd.indexOf(lookFor) > -1;

		if (hasToken("this")) {
			return "@THIS";
		}
		if (hasToken("that")) {
			return "@THAT";
		}
		if (hasToken("temp")) {
			return "@R5";
		}
		if (hasToken("local")) {
			return "@LCL";
		}

		throw new Error(`No base pointer for ${this.cmd}`);
	}

	saveDRegisterValueInTemp() {
		return ["@R13", "M=D"];
	}

	setMRegisterToValueInTemp() {
		return ["@R13", "A=M", "M=D"];
	}
}
