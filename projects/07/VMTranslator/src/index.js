import VMTranslator from "./VMTranslator";
import File from "./File";

async function Main() {
	const relPathToVmFile = process.argv[2];

	const vm = new VMTranslator();
	const file = new File(relPathToVmFile);

	const rawVMCode = await file.read();
	const hackASMTokens = vm.translate(rawVMCode);

	return Promise.all([
		file.writeJSON(hackASMTokens),
		file.writeASM(hackASMTokens),
	]);
}

Main().then(() => console.log("ASM written to disk!"));
