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
