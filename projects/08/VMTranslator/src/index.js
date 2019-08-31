import VMTranslator from "./VMTranslator";
import VMFile, { VMDirectoryReader, ASMWriter } from "./File";
import * as util from "./util";

// Assume all paths are to a directory with one or more VM files in it.
// You need to collect an array of all the VM file paths (full joined paths)
// and loop over it.
// You append the compiled asm output array together until the loop is done.
// Then you finally write all the hack asm tokens at once as JSON and asm separately.

class Main {
	static async exec() {
		const relPathToDirWithVmFiles = process.argv[2];
		const vmDirReader = new VMDirectoryReader(relPathToDirWithVmFiles);

		const hackASMTokens = await this.getASMTokens(vmDirReader);
		const asmWriter = new ASMWriter(vmDirReader.getRootDirectoryName());

		return Promise.all([
			asmWriter.writeJSON(hackASMTokens),
			asmWriter.writeASM(hackASMTokens),
		]);
	}

	static async getASMTokens(vmDirReader) {
		let asmPromises = [];

		const fullPaths = await vmDirReader.getPathsToVmFiles();

		fullPaths.map(async fullPath => {
			asmPromises.push(this.tranlateVMFileToHackASMTokens(fullPath));
		});

		return Promise.all(asmPromises).then(asmTranslations => {
			return util.flatten(asmTranslations);
		});
	}

	static async tranlateVMFileToHackASMTokens(pathToVmFile) {
		const file = new VMFile(pathToVmFile);
		const rawVMCode = await file.read();

		const vm = new VMTranslator(file);
		const hackASMTokens = vm.translate(rawVMCode);

		if (file.getVMFileName().indexOf("Sys") > -1) {
			return util.flatten([vm.getBootstrapCode(), ...hackASMTokens]);
		}
		return hackASMTokens;
	}
}

Main.exec().then(writtenTo => console.log(`ASM written to ${writtenTo[1]}`));
