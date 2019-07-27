import ArithmeticCommands from "./ArithmeticCommands";
import * as util from "./util";

export const MemorySegments = {
	constant: "constant",
};

export default class MemoryCommands {
	constructor() {
		this.arithmetic = new ArithmeticCommands();
	}

	pushConstant(vmCommand) {
		return util.flatten([
			`@${this.getSegmentIndex(vmCommand)}`,
			"D=A",
			this.arithmetic.pushDToStack(),
			this.arithmetic.advanceSP(),
		]);
	}

	popLocal(vmCommand) {
		return util.flatten([
			"@LCL",
			"D=M",
			`@${this.getSegmentIndex(vmCommand)}`,
			"D=D+A",
			this.saveDRegisterValueInTemp(),
			this.arithmetic.popOneOperand(),
			"D=M",
			this.setMRegisterToValueInTemp(),
		]);
	}

	popArgument(vmCommand) {
		return util.flatten([
			"@ARG",
			"D=M",
			`@${this.getSegmentIndex(vmCommand)}`,
			"D=D+A",
			this.saveDRegisterValueInTemp(),
			this.arithmetic.popOneOperand(),
			"D=M",
			this.setMRegisterToValueInTemp(),
		]);
	}

	popThis(vmCommand) {
		return util.flatten([
			"@THIS",
			"D=M",
			`@${this.getSegmentIndex(vmCommand)}`,
			"D=D+A",
			this.saveDRegisterValueInTemp(),
			this.arithmetic.popOneOperand(),
			"D=M",
			this.setMRegisterToValueInTemp(),
		]);
	}

	popThat(vmCommand) {
		return util.flatten([
			"@THAT",
			"D=M",
			`@${this.getSegmentIndex(vmCommand)}`,
			"D=D+A",
			this.saveDRegisterValueInTemp(),
			this.arithmetic.popOneOperand(),
			"D=M",
			this.setMRegisterToValueInTemp(),
		]);
	}

	pushArgument(vmCommand) {
		return util.flatten([
			"@ARG",
			"D=M",
			`@${this.getSegmentIndex(vmCommand)}`,
			"D=D+A",
			"A=D",
			"D=M",
			this.arithmetic.pushDToStack(),
			this.arithmetic.advanceSP(),
		]);
	}

	pushTemp(vmCommand) {
		return util.flatten([
			"@R5",
			"D=M",
			`@${this.getSegmentIndex(vmCommand)}`,
			"D=D+A",
			"A=D",
			"D=M",
			this.arithmetic.pushDToStack(),
			this.arithmetic.advanceSP(),
		]);
	}

	popPointer(vmCommand) {
		return util.flatten([
			"@THIS",
			"D=A",
			`@${this.getSegmentIndex(vmCommand)}`,
			"D=D+A",
			this.saveDRegisterValueInTemp(),
			this.arithmetic.popOneOperand(),
			"D=M",
			this.setMRegisterToValueInTemp(),
		]);
	}

	pushPointer(vmCommand) {
		return util.flatten([
			"@THIS",
			"D=A",
			`@${this.getSegmentIndex(vmCommand)}`,
			"A=D+A",
			"D=M",
			"@SP",
			"A=M",
			"M=D",
			this.arithmetic.advanceSP(),
		]);
	}

	popStatic(vmCommand, fileName) {
		return util.flatten([
			this.arithmetic.popOneOperand(),
			"D=M",
			`@${fileName}.${this.getSegmentIndex(vmCommand)}`,
			"M=D",
		]);
	}

	pushStatic(vmCommand, fileName) {
		return util.flatten([
			`@${fileName}.${this.getSegmentIndex(vmCommand)}`,
			"D=M",
			this.arithmetic.pushDToStack(),
			this.arithmetic.advanceSP(),
		]);
	}

	getSegmentIndex(vmCommand) {
		const tokens = vmCommand.split(" ");
		return tokens[tokens.length - 1];
	}

	saveDRegisterValueInTemp() {
		return ["@R5", "M=D"];
	}

	setMRegisterToValueInTemp() {
		return ["@R5", "A=M", "M=D"];
	}
}
