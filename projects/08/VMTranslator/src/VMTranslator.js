import ArithmeticCommands, { ACommands } from "./ArithmeticCommands";
import MemoryCommands from "./MemoryCommands";
import FunctionProtocol from "./FunctionProtocol";
import VMTokenizer from "./VMTokenizer";
import * as util from "./util";

export default class VMTranslator {
	constructor(vmFile, labelCounter) {
		this.vmFile = vmFile;
		this.labelCounter = labelCounter;
	}

	state = {
		currentFunc: "",
	};

	setCurrentFunc = funcName => {
		this.state.currentFunc = funcName;
	};

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

	getBootstrapCode() {
		const cmd = "call Sys.init 0";
		const fp = new FunctionProtocol(cmd, {}, this.labelCounter);
		return util.flatten(["@256", "D=A", "@SP", "M=D", fp.callCommand()]);
	}

	translateCommandToHack = vmCommand => {
		const state = this.state;

		const program = {
			currentFunc: state.currentFunc,
			setCurrentFunc: funcName => this.setCurrentFunc(funcName),
		};

		const fp = new FunctionProtocol(vmCommand, program, this.labelCounter);

		if (ACommands[vmCommand]) {
			return this.translateArithmeticCommand(vmCommand);
		}

		if (fp.isCall()) {
			return fp.callCommand();
		}

		if (fp.isDeclaration()) {
			return fp.funcDeclaration();
		}

		if (fp.isReturn()) {
			return fp.returnCommand();
		}

		if (fp.isLabel()) {
			return fp.labelCommand();
		}

		if (fp.isIfGoto()) {
			return fp.ifGoto();
		}

		if (fp.isUnconditionalGoto()) {
			return fp.goto();
		}

		return this.translateMemoryCommand(vmCommand);
	};

	translateArithmeticCommand = vmCommand => {
		const arithmetic = new ArithmeticCommands(this.labelCounter);

		switch (vmCommand) {
			case ACommands.eq:
				return arithmetic.eq();
			case ACommands.lt:
				return arithmetic.lt();
			case ACommands.gt:
				return arithmetic.gt();
			case ACommands.add:
				return arithmetic.add();
			case ACommands.sub:
				return arithmetic.sub();
			case ACommands.neg:
				return arithmetic.neg();
			case ACommands.and:
				return arithmetic.and();
			case ACommands.or:
				return arithmetic.or();
			case ACommands.not:
				return arithmetic.not();
			default:
				return "";
		}
	};

	translateMemoryCommand = vmCommand => {
		const memory = new MemoryCommands(vmCommand);
		const isMemoryCommand = this.isMemoryCommandInit(vmCommand);

		if (isMemoryCommand("push constant")) {
			return memory.pushConstant();
		}
		if (isMemoryCommand("pop local")) {
			return memory.popLocal();
		}
		if (isMemoryCommand("pop argument")) {
			return memory.popArgument();
		}
		if (isMemoryCommand("pop this")) {
			return memory.popThis();
		}
		if (isMemoryCommand("pop that")) {
			return memory.popThat();
		}
		if (isMemoryCommand("push argument")) {
			return memory.pushArgument();
		}
		if (isMemoryCommand("pop pointer")) {
			return memory.popPointer();
		}
		if (isMemoryCommand("push pointer")) {
			return memory.pushPointer();
		}
		if (isMemoryCommand("pop static")) {
			return memory.popStatic(this.getVMFileName());
		}
		if (isMemoryCommand("push static")) {
			return memory.pushStatic(this.getVMFileName());
		}
		if (isMemoryCommand("pop temp")) {
			return memory.popToTemp();
		}
		if (isMemoryCommand("push temp")) {
			return memory.pushToTemp();
		}
		if (isMemoryCommand("push")) {
			return memory.pushToStackGeneric();
		}
		if (isMemoryCommand("pop")) {
			return memory.popFromStackGeneric();
		}
		throw new Error(`Failed to identify command ${vmCommand}`);
	};

	isMemoryCommandInit = vmCommand => matcher => {
		return vmCommand.indexOf(matcher) > -1;
	};
}
