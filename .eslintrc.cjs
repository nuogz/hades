const parseKey = (raw, target) => {
	const key = raw.split(/(?=[A-Z])/).join('-').toLowerCase();

	if(key != raw) {
		target[key] = target[raw]; delete target[raw];
	}
};
const parseKeys = rc => {
	Object.keys(rc.rules).forEach(key => parseKey(key, rc.rules));

	return rc;
};



const rcNode = parseKeys({
	root: true,
	ignorePatterns: ['dist'],
	env: { es2022: true, node: true },
	extends: ['eslint:recommended'],
	parserOptions: { sourceType: 'module' },
	rules: {
		indent: [2, 'tab', { ignoreComments: true, SwitchCase: 1 }],
		linebreakStyle: [2],
		quotes: [2, 'single', { allowTemplateLiterals: true }],
		semi: [2],
		noUnusedVars: [2, { vars: 'all', args: 'none' }],
		noVar: [2],
		noConsole: [2],
		requireAtomicUpdates: [1, { allowProperties: true }],
	},
	overrides: []
});



module.exports = rcNode;
