import ArithmeticCommands, { ACommands } from "./ArithmeticCommands";
import MemoryCommands from "./MemoryCommands";
import VMTokenizer from "./VMTokenizer";
import * as util from "./util";

export default class VMTranslator {
	constructor(relPathToVmFile) {
		this.arithmetic = new ArithmeticCommands();
		this.memory = new MemoryCommands();
		this.relPathToVmFile = relPathToVmFile;
	}

	getVMFileName() {
		this.relPathToVmFile;
	}

	translate(sourceVMCode) {
		return this.translateToHackASM(this.tokenize(sourceVMCode));
	}

	tokenize(sourceVMCode) {
		return VMTokenizer.getTokens(sourceVMCode);
	}

	translateToHackASM(vmTokens) {
		return util.flatten(vmTokens.map(this.translateCommandToHack));
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
