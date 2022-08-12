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


const fileAppender = (path, sizeFileLog, countBackup, option) => {
	path = normalize(path);

	countBackup = countBackup === undefined ? 5 : countBackup;
	countBackup = countBackup === 0 ? 1 : countBackup;

	let writer = openTheStream(path, sizeFileLog, countBackup, option);

	const app = event => {
		if(option.removeColor === true) {
			// eslint-disable-next-line no-control-regex
			const regex = /\x1b[[0-9;]*m/g;
			event.data = event.data.map(d => {
				if(typeof d === 'string') return d.replace(regex, '');

				return d;
			});
		}

		if(typeof option.handle != 'function') {
			throw TypeError(option.T('error.optionHandleType', { handle: option.handle, type: typeof option.handle }));
		}

		const log = option.handle(event, option.isHighlight, option.T);
		if(log !== undefined && !writer.write(log + (option.eol ?? EOL), 'utf8')) {
			process.emit('log4js:pause', true);
		}
	};

	app.reopen = () => writer.end(() => writer = openTheStream(path, sizeFileLog, countBackup, option));

	app.sighupHandler = () => app.reopen();

	app.shutdown = complete => {
		process.removeListener('SIGHUP', app.sighupHandler);

		writer.end('', 'utf-8', complete);
	};

	process.on('SIGHUP', app.sighupHandler);

	return app;
};

const configureFile = config => {
	return fileAppender(config.path, config.maxLogSize, config.backups, config);
};



export default configureFile;
