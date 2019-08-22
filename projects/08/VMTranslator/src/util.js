export const flatten = array => {
	return array.reduce((acc, curr) => {
		if (Array.isArray(curr)) {
			return [...acc, ...curr];
		}
		return [...acc, curr];
	}, []);
};
