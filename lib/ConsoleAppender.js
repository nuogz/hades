import logUpdate from 'log-update';

import symbolLogUpdate from './LogUpdateSymbol.js';


// eslint-disable-next-line no-console
const consoleLog = console.log.bind(console);
// eslint-disable-next-line no-console
const consoleError = console.error.bind(console);


const configureConsole = function(config) {
	return function(event) {
		let isUpdateLog = false;
		if(event.data[0] === symbolLogUpdate) {
			event.data.shift();
			isUpdateLog = true;
		}

		const [logFinal, logError, lengthError] = config.handle(event, config.isHightlight);

		if(isUpdateLog) {
			logUpdate(logFinal);
		}
		else {
			consoleLog(logFinal);
		}

		if(lengthError) { consoleError(logError); }
	};
};


export default configureConsole;