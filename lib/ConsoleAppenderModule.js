import logUpdate from 'log-update';

import { symbolLogDone, symbolLogUpdate } from './symbol.js';



const console = globalThis.console;
const consoleLog = console.log.bind(console);
const consoleError = console.error.bind(console);


/** @type {import('log4js').AppenderModule} */
const moduleAppenderConsole = {
	configure: config => {
		return event => {
			let symbolLog;
			if(event.data[0] === symbolLogUpdate || event.data[0] === symbolLogDone) {
				symbolLog = event.data.shift();
			}


			const [logFinal, logError, lengthError] = config.handle(event, config.isHighlight, config.T);

			if(symbolLog === symbolLogUpdate) {
				logUpdate(logFinal);
			}
			else if(symbolLog === symbolLogDone) {
				logUpdate(logFinal);
				logUpdate.done();
			}
			else {
				consoleLog(logFinal);
			}

			if(lengthError) {
				consoleError(logError);
			}
		};
	}
};



export default moduleAppenderConsole;
