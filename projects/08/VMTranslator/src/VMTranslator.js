import ArithmeticCommands, { ACommands } from "./ArithmeticCommands";
import MemoryCommands from "./MemoryCommands";
import FunctionProtocol from "./FunctionProtocol";
import VMTokenizer from "./VMTokenizer";
import * as util from "./util";

export default class VMTranslator {
	constructor(vmFile) {
		this.fp;
		this.arithmetic = new ArithmeticCommands();
		this.memory = new MemoryCommands();
		this.vmFile = vmFile;
	}

	getVMFileName() {
		return this.vmFile.getVMFileName();
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
		this.fp = new FunctionProtocol(vmCommand);
		const idx = statementIdx;

		if (ACommands[vmCommand]) {
			return this.translateArithmeticCommand(vmCommand, idx);
		}

		if (this.fp.isCall()) {
			return this.fp.callCommand();
		}

		if (this.fp.isDeclaration()) {
			return this.fp.funcDeclaration();
		}

		if (this.fp.isReturn()) {
			return this.fp.returnCommand();
		}

		return this.translateMemoryCommand(vmCommand);
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

	translateMemoryCommand = vmCommand => {
		const isMemoryCommand = this.isMemoryCommandInit(vmCommand);

		if (isMemoryCommand("push constant")) {
			return this.memory.pushConstant(vmCommand);
		}
		if (isMemoryCommand("pop local")) {
			return this.memory.popLocal(vmCommand);
		}
		if (isMemoryCommand("pop argument")) {
			return this.memory.popArgument(vmCommand);
		}
		if (isMemoryCommand("pop this")) {
			return this.memory.popThis(vmCommand);
		}
		if (isMemoryCommand("pop that")) {
			return this.memory.popThat(vmCommand);
		}
		if (isMemoryCommand("push argument")) {
			return this.memory.pushArgument(vmCommand);
		}
		if (isMemoryCommand("pop pointer")) {
			return this.memory.popPointer(vmCommand);
		}
		if (isMemoryCommand("push pointer")) {
			return this.memory.pushPointer(vmCommand);
		}
		if (isMemoryCommand("pop static")) {
			return this.memory.popStatic(vmCommand, this.getVMFileName());
		}
		if (isMemoryCommand("push static")) {
			return this.memory.pushStatic(vmCommand, this.getVMFileName());
		}
		if (isMemoryCommand("pop temp")) {
			return this.memory.popToTemp(vmCommand);
		}
		if (isMemoryCommand("push temp")) {
			return this.memory.pushToTemp(vmCommand);
		}
		if (isMemoryCommand("push")) {
			return this.memory.pushToStackGeneric(vmCommand);
		}
		if (isMemoryCommand("pop")) {
			return this.memory.popFromStackGeneric(vmCommand);
		}
		throw new Error(`Failed to identify command ${vmCommand}`);
	};

	isMemoryCommandInit = vmCommand => matcher => {
		return vmCommand.indexOf(matcher) > -1;
	};
}
