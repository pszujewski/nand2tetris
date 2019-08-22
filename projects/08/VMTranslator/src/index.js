import VMTranslator from "./VMTranslator";
import File from "./File";

async function Main() {
	const relPathToVmFile = process.argv[2];

	const file = new File(relPathToVmFile);
	const vm = new VMTranslator(file);

	const rawVMCode = await file.read();
	const hackASMTokens = vm.translate(rawVMCode);

	return Promise.all([
		file.writeJSON(hackASMTokens),
		file.writeASM(hackASMTokens),
	]);
}

Main().then(writtenTo => console.log(`ASM written to ${writtenTo[1]}`));
