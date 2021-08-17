// eslint-disable-next-line no-console
const consoleLog = console.log.bind(console);
// eslint-disable-next-line no-console
const consoleError = console.error.bind(console);


const configureConsole = function(config) {
	return function(event) {
		const [logFinal, logError, lengthError] = config.handle(event, config.isHightlight);

		consoleLog(logFinal);

		if(lengthError) { consoleError(logError); }
	};
};


export default configureConsole;