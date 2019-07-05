import ArithmeticCommands, { ACommands } from "./ArithmeticCommands";
import MemoryCommands from "./MemoryCommands";

export default class VMTranslator {
	constructor() {
		this.arithmetic = new ArithmeticCommands();
		this.memory = new MemoryCommands();
	}

	tokenize() {
		return null;
	}

	translateToHackASM(vmTokens) {
		return vmTokens.map(this.translateCommandToHack).reduce((acc, curr) => {
			return [...acc, ...curr];
		}, []);
	}

	translateCommandToHack = (vmCommand, statementIdx) => {
		const idx = statementIdx;

		if (ACommands[vmCommand]) {
			return this.translateArithmeticCommand(vmCommand, idx);
		}

		return this.memory.pushConstant(vmCommand);
	};

	translateArithmeticCommand = (vmCommand, statementIdx) => {
		switch (vmCommand) {
			case ACommands.eq:
				return this.arithmetic.eq(statementIdx);
			case ACommands.lt:
				return this.arithmetic.lt(statementIdx);
			case ACommands.gt:
				return this.arithmetic.gt(statementIdx);
			case ACommands.add:
				return this.arithmetic.add();
			case ACommands.sub:
				return this.arithmetic.sub();
			case ACommands.neg:
				return this.arithmetic.neg();
			case ACommands.and:
				return this.arithmetic.and();
			case ACommands.or:
				return this.arithmetic.or();
			case ACommands.not:
				return this.arithmetic.not();
			default:
				return "";
		}
	};
}
