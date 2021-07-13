/**
 * #### 日志系统
 * - 以`在哪里、做什么、结果`为格式的基于`log4js`的日志系统
 * - 不输出错误的堆栈，转而存放在`*.stack.log`
 * - 默认提供七个日志等级：
 *   - trace: 跟踪
 *   - debug: 调试
 *   - info: 信息
 *   - warn: 警告
 *   - error: 错误
 *   - fatal: 致命
 *   - mark: 标记
 * @version 2.5.0-2021.07.13.01
 * @class
 * @requires log4js(6)
 * @requires chalk(4)
 * @requires moment(2)
 */
const Hades = class Hades {
	/**
	 * @param {string} nameLog 日志名称
	 * @param {string} levelLog 日志等级
	 * @param {string} pathSave 保存路径
	 * @param {boolean} isColorText 是否使用彩色编码保存日志
	 * @returns {import('log4js').Logger} Logger，日志系统自身
	 */
	constructor(nameLog = 'default', levelLog = 'all', pathSave = null, isColorText = true) {
		const PA = require('path');

		const Log4js = require('log4js');
		const Chalk = require('chalk');
		const Moment = require('moment');

		const levelStrCH = {
			ALL: '信息',
			TRACE: '跟踪', DEBUG: '调试', INFO: '信息', WARN: '警告',
			ERROR: '错误', FATAL: '致命', MARK: '标记',
			OFF: '关闭',
		};

		const chalkTextWord = Chalk.underline.bold('$1');
		const chalkTextValue = Chalk.white('[$1]');

		const highlight = function(str) {
			return String(str)
				.replace(/\[(.*?)\]/g, chalkTextWord)
				.replace(/\{(.*?)\}/g, chalkTextValue);
		};

		let loggerStack;

		const logFormatterConsole = function({ startTime, level: { colour, levelStr }, data: datas }) {
			const color = colour;
			const level = levelStrCH[levelStr];
			const time = Moment(startTime).format('YY-MM-DD HH:mm:ss:SSS');


			const texts = [];
			const errors = [];
			for(let i = 2; i < datas.length; i++) {
				const data = datas[i];

				if(data === undefined) { continue; }

				if(data instanceof Error || (data.stack && data.message)) {
					errors.push(data);

					texts.push(String(data.message).trim());
				}
				else if(data.message) {
					texts.push(String(data.message).trim());
				}
				else {
					texts.push(String(data).trim());
				}
			}


			let where = datas[0];
			let action = datas[1];
			let resultAll = texts.join('\n\t');

			if(isColorText) {
				where = highlight(where);
				action = highlight(action);
				resultAll = highlight(resultAll);
			}

			let logFinal =
				`[${time}][${level}] ${where}` +
				(action ? ` >  ${action}` : '') +
				(resultAll ? `  ${resultAll}` : '')
				;
			if(isColorText) { logFinal = Chalk[color](logFinal); }


			if(errors.length) {
				loggerStack[levelStr.toLowerCase()](
					[
						logFinal,
						'-------------- Stack --------------',
						errors
							.map(error =>
								(isColorText ? Chalk[color](highlight(error.message)) : error.message) +
								(error.stack ? `\n${String(error.stack).replace(/ {4}/g, '\t')}` : '') +
								(error.data ? `\n[Data] ${error.data}` : '')
							)
							.join('\n--------------\n'),
						'===================================\n',
					].join('\n')
				);
			}


			return logFinal;
		};
		const logFormatterFile = function({ startTime, level: { colour, levelStr }, data: datas }) {
			const color = colour;
			const level = levelStrCH[levelStr];
			const time = Moment(startTime).format('YY-MM-DD HH:mm:ss:SSS');

			const texts = [];
			const errors = [];
			for(let i = 2; i < datas.length; i++) {
				const data = datas[i];

				if(data === undefined) { continue; }

				if(data instanceof Error || (data.stack && data.message)) {
					errors.push(data);

					texts.push(String(data.message).trim());
				}
				else if(data.message) {
					texts.push(String(data.message).trim());
				}
				else {
					texts.push(String(data).trim());
				}
			}


			let where = datas[0];
			let action = datas[1];
			let resultAll = texts.join('\n\t');

			if(isColorText) {
				where = highlight(where);
				action = highlight(action);
				resultAll = highlight(resultAll);
			}

			let logFinal =
				`[${time}][${level}] ${where}` +
				(action ? ` >  ${action}` : '') +
				(resultAll ? `  ${resultAll}` : '')
				;
			if(isColorText) { logFinal = Chalk[color](logFinal); }

			return logFinal;
		};

		Log4js.addLayout('colorConsole', function() { return logFormatterConsole; });

		const appenders = pathSave ?
			{
				console: {
					type: 'console',
					layout: { type: 'colorConsole' }
				},
				file: {
					type: 'file',
					filename: PA.join(pathSave, nameLog + '.log'),
					maxLogSize: 1024 * 1024 * 20,
					layout: { type: 'pattern', pattern: '%x{message}', tokens: { message: logFormatterFile } }
				},
				fileStack: {
					type: 'file',
					filename: PA.join(pathSave, nameLog + '.stack.log'),
					maxLogSize: 1024 * 1024 * 20,
					layout: { type: 'pattern', pattern: '%m' }
				},
				stack: {
					type: 'logLevelFilter',
					appender: 'fileStack',
					level: 'all'
				}
			} :
			{
				console: {
					type: 'console',
					layout: { type: 'colorConsole' }
				},
				stack: {
					type: 'console',
				},
			};

		Log4js.configure({
			appenders,
			categories: {
				default: { appenders: pathSave ? ['console', 'file'] : ['console'], level: levelLog },
				stack: { appenders: ['stack'], level: levelLog },
			},
			pm2: true
		});

		loggerStack = Log4js.getLogger('stack');

		const logger = Log4js.getLogger('default');
		logger.info('日志', '加载', pathSave ? `✔ 日志路径{${pathSave}}` : '✔ ');

		return logger;
	}
};

module.exports = Hades;