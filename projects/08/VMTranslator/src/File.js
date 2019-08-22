const fs = require("fs");
const fspath = require("path");

export default class File {
	constructor(relPath) {
		this.relPath = relPath;
	}

	read() {
		const path = fspath.join(__dirname, this.relPath);

		return new Promise((resolve, reject) => {
			fs.readFile(path, (err, data) => {
				if (err) {
					reject(err);
				}
				resolve(data.toString());
			});
		});
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
		const name = `${this.getVMFileName()}${extension}`;

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

	getVMFileName() {
		const tokens = this.relPath.split("/");
		return tokens[tokens.length - 1].replace(".vm", "").trim();
	}
}
