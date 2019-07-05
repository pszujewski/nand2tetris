const fs = require("fs");
const fspath = require("path");

export default class File {
	static read(relPath) {
		const path = fspath.join(__dirname, relPath);

		return new Promise((resolve, reject) => {
			fs.readFile(path, (err, data) => {
				if (err) {
					reject(err);
				}
				resolve(data.toString());
			});
		});
	}

	static write(fileName, tokens) {
		const path = fspath.resolve(__dirname, `./${fileName}`);

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
