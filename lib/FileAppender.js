import { normalize } from 'path';
import { EOL } from 'os';

import streams from 'streamroller';



const console = globalThis.console;
const consoleError = console.error.bind(console);

const openTheStream = (path, sizeFileLog, countBuckup, option) => {
	return new streams.RollingFileStream(path, sizeFileLog, countBuckup, option)
		.on('error', err => consoleError('log4js.fileAppender - Writing to file %s, error happened ', path, err))
		.on('drain', () => process.emit('log4js:pause', false));
};



/** @type {import('log4js').AppenderModule} */
const moduleAppenderFile = {
	configure: config => {
		const path = normalize(config.path);
		const sizeFileLog = config.maxLogSize;

		const countBackupTemp = config.backups === undefined ? 5 : config.backups;
		const countBackup = countBackupTemp === 0 ? 1 : countBackupTemp;


		let writer = openTheStream(path, sizeFileLog, countBackup, config);

		/** @type {import('log4js').AppenderFunction} */
		const app = event => {
			if(config.removeColor === true) {
				// eslint-disable-next-line no-control-regex
				const regex = /\x1b[[0-9;]*m/g;
				event.data = event.data.map(d => {
					if(typeof d === 'string') return d.replace(regex, '');

					return d;
				});
			}

			if(typeof config.handle != 'function') {
				throw TypeError(config.T('error.invalidOptionHandle', { handle: config.handle, type: typeof config.handle }));
			}

			const log = config.handle(event, config.isHighlight, config.T);
			if(log !== undefined && !writer.write(log + (config.eol ?? EOL), 'utf8')) {
				process.emit('log4js:pause', true);
			}
		};

		app.reopen = () => writer.end(() => writer = openTheStream(path, sizeFileLog, countBackup, config));

		app.sighupHandler = () => app.reopen();

		app.shutdown = complete => {
			process.removeListener('SIGHUP', app.sighupHandler);

			writer.end('', 'utf-8', complete);
		};

		process.on('SIGHUP', app.sighupHandler);


		return app;
	}
};



export default moduleAppenderFile;
