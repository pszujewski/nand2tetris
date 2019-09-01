const fs = require("fs");
const fspath = require("path");

export default class VMFile {
	constructor(fullPathToVmFile) {
		this.fullPathToVmFile = fullPathToVmFile;
	}

	getVMFileName() {
		const tokens = this.fullPathToVmFile.split("/");
		return tokens[tokens.length - 1].replace(".vm", "").trim();
	}

	isSysInitFile() {
		return this.getVMFileName().indexOf("Sys") > -1;
	}

	read() {
		const path = this.fullPathToVmFile;

		return new Promise((resolve, reject) => {
			fs.readFile(path, (err, data) => {
				if (err) {
					reject(err);
				}
				resolve(data.toString());
			});
		});
	}
}

export class VMDirectoryReader {
	constructor(relPathToDirWithVmFiles) {
		this.relPathToDir = relPathToDirWithVmFiles;
	}

	getRootDirectoryName() {
		const tokens = this.relPathToDir.split("/");
		return tokens[tokens.length - 1].trim();
	}

	getRelPathTokens() {
		return this.relPathToDir.split("/");
	}

	getPathsToVmFiles() {
		const pathToDir = this.getFullPath(this.relPathToDir);

		if (!this.isDirectory(pathToDir)) {
			return new Promise(resolve => resolve([pathToDir]));
		}

		return new Promise((resolve, reject) => {
			fs.readdir(pathToDir, (err, fileNames) => {
				if (err) {
					console.error("Unable to write");
					reject("Unable to write");
				}
				resolve(this.getFullPathsToVMFiles(fileNames));
			});
		});
	}

	getFullPathsToVMFiles(fileNames) {
		const names = fileNames
			.map(f => f.trim())
			.filter(f => f.indexOf(".vm") > -1)
			.map(f => {
				const testDir = this.getTestFileDirName();
				const root = this.getRootDirectoryName();

				const relPath = `../../${testDir}/${root}/${f}`;
				return fspath.join(__dirname, relPath);
			});

		const isSysFile = f => f.indexOf("Sys.vm") > -1;
		const isMainFile = f => f.indexOf("Main.vm") > -1;

		return names.sort((a, b) => {
			const AIsSys = isSysFile(a);
			const BIsSys = isSysFile(b);

			const AIsMain = isMainFile(a);
			const BIsMain = isMainFile(b);

			if (AIsSys || (AIsMain && !BIsSys)) {
				-1;
			}

			if (BIsSys || BIsMain) {
				return 1;
			}

			return 0;
		});
	}

	getTestFileDirName() {
		const tokens = this.getRelPathTokens();
		return tokens[tokens.length - 2];
	}

	isDirectory(fullPath) {
		const p = fullPath;
		return fs.existsSync(p) && fs.lstatSync(p).isDirectory();
	}

	getFullPath(relPath) {
		return fspath.join(__dirname, relPath);
	}
}

export class ASMWriter {
	constructor(outputFileName) {
		this.outputFileName = outputFileName;
	}

	writeJSON(tokens) {
		const content = JSON.stringify(tokens, null, 4);
		return this.write(content, ".json");
	}

	writeASM(tokens) {
		const content = tokens.join("\n");
		return this.write(content, ".asm");
	}

	write(content, extension) {
		const name = `${this.outputFileName}${extension}`;

		const path = fspath.join(__dirname, `/../asm/${name}`);

		return new Promise(resolve => {
			fs.writeFile(path, content, err => {
				if (err) {
					console.error("Unable to write");
				}
				resolve(path);
			});
		});
	}
}
