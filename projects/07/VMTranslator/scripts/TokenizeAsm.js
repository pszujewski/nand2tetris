const fs = require("fs");
const fspath = require("path");

const SA = "/StackArithmetic";
const MA = "/MemoryAccess";

const asmFiles = [
	`${SA}/SimpleAdd/SimpleAdd.asm`,
	`${SA}/StackTest/StackTest.asm`,
	`${MA}/BasicTest/BasicTest.asm`,
];

function tokenizeAsm() {
	const asm = new ASMFile();
	asmFiles.map(relPath => asm.tokenize(relPath));
}

class ASMFile {
	tokenize(relPath) {
		const path = fspath.join(__dirname, `../..${relPath}`);
		return this.getTokens(path).then(tokens => {
			return this.write(tokens, relPath);
		});
	}

	getTokens(path) {
		return this.readFileAsync(path).then(source =>
			this.parseRawAsmString(source)
		);
	}

	parseRawAsmString(sourceAsm) {
		const raw = sourceAsm.toString();

		const tokens = raw.replace(/\r/g, "").split("\n");
		return tokens
			.map(t => t.trim())
			.filter(t => t && t.length > 0 && t.indexOf("//") !== 0)
			.map(t => {
				const idx = t.indexOf("//");
				if (idx > -1) {
					return t.replace(/\/\/.+/g, "").trim();
				}
				return t;
			});
	}

	readFileAsync(path) {
		return new Promise((resolve, reject) => {
			fs.readFile(path, (err, data) => {
				if (err) {
					reject(err);
				}
				resolve(data);
			});
		});
	}

	write(tokens, relPath) {
		const name = relPath.replace(".asm", ".json");

		const path = fspath.resolve(__dirname, `../..${name}`);

		const content = JSON.stringify(tokens, null, 4);

		return new Promise(resolve => {
			fs.writeFile(path, content, err => {
				if (err) {
					console.error("Unable to write data");
				}
				resolve();
			});
		});
	}
}

tokenizeAsm();
