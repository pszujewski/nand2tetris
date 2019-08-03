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

	pushToStackGeneric(vmCommand) {
		return util.flatten([
			`${this.getSegmentBasePointer(vmCommand)}`,
			"D=M",
			`@${this.getSegmentIndex(vmCommand)}`,
			"D=D+A",
			"A=D",
			"D=M",
			this.arithmetic.pushDToStack(),
			this.arithmetic.advanceSP(),
		]);
	}

	popToTemp(vmCommand) {
		return util.flatten([
			`${this.getSegmentBasePointer(vmCommand)}`,
			"D=A",
			`@${this.getSegmentIndex(vmCommand)}`,
			"D=D+A",
			this.saveDRegisterValueInTemp(),
			this.arithmetic.popOneOperand(),
			"D=M",
			this.setMRegisterToValueInTemp(),
		]);
	}

	pushToTemp(vmCommand) {
		return util.flatten([
			`${this.getSegmentBasePointer(vmCommand)}`,
			"D=A",
			`@${this.getSegmentIndex(vmCommand)}`,
			"D=D+A",
			"A=D",
			"D=M",
			this.arithmetic.pushDToStack(),
			this.arithmetic.advanceSP(),
		]);
	}

	popFromStackGeneric(vmCommand) {
		return util.flatten([
			`${this.getSegmentBasePointer(vmCommand)}`,
			"D=M",
			`@${this.getSegmentIndex(vmCommand)}`,
			"D=D+A",
			this.saveDRegisterValueInTemp(),
			this.arithmetic.popOneOperand(),
			"D=M",
			this.setMRegisterToValueInTemp(),
		]);
	}

	getSegmentIndex(vmCommand) {
		const tokens = vmCommand.split(" ");
		return tokens[tokens.length - 1];
	}

	getSegmentBasePointer(vmCommand) {
		const hasToken = lookFor => vmCommand.indexOf(lookFor) > -1;

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

		throw new Error(`No base pointer for ${vmCommand}`);
	}

	saveDRegisterValueInTemp() {
		return ["@R13", "M=D"];
	}

	setMRegisterToValueInTemp() {
		return ["@R13", "A=M", "M=D"];
	}
}
