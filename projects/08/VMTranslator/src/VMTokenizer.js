export default class VMTokenizer {
	static getTokens(sourceVMCode) {
		const tokens = sourceVMCode.replace(/\r/g, "").split("\n");
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
}
