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
		const tokens = vmCommand.split(" ");
		const constant = tokens[tokens.length - 1];

		return util.flatten([
			`@${constant}`,
			"D=A",
			this.arithmetic.pushDToStack(),
			this.arithmetic.advanceSP(),
		]);
	}
}
