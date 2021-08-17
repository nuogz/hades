import { join } from 'path';

import Log4JS from 'log4js';

import formatLog from './lib/formatLog.js';
import configureFile from './lib/FileAppender.js';
import configureConsole from './lib/ConsoleAppender.js';

import symbolLogUpdate from './lib/LogUpdateSymbol.js';


/**
 * 接口配置
 * @typedef {Object} HadesConfig
 * @property {boolean} isHightlight 是否使用彩色编码保存日志
 * @property {boolean} isLogInited 是否在加载后立即输出日志
 */


/**
 * Log4JS 总配置
 * @type {Object}
 */
export const configure = {
	appenders: {
		default: { type: 'console' }
	},
	categories: {
		default: { appenders: ['default'], level: 'off' }
	},
	pm2: true
};


/**
 * 是否已经加载过任意日志器（全局）
 * @type {boolean}
 */
export let hasFirstInited = false;


/**
 * #### 日志系统（哈迪斯）
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
 * @version 3.1.0-2021.08.17.02
 * @class
 * @requires chalk(4)
 * @requires log-update(4)
 * @requires log4js(6)
 * @requires moment(2)
 */
const Hades = class Hades {
	/**
	 * @param {string} nameLog 日志名称
	 * @param {string} levelLog 日志等级
	 * @param {string} pathSave 保存路径
	 * @param {HadesConfig} option 日志选项
	 * @returns {import('log4js').Logger} Logger，日志系统自身
	 */
	constructor(name = 'default', level = 'all', pathSave = null, option) {
		/**
		 * 日志名称
		 *  @type {string}
		 */
		this.name = name;
		/**
		 * 日志等级
		 *  @type {string}
		 */
		this.level = level;
		/**
		 * 保存路径
		 *  @type {string}
		 */
		this.pathSave = pathSave;
		/**
		 * 是否使用彩色编码保存日志
		 * @type {boolean}
		 */
		this.isHightlight = option?.isHightlight ?? true;
		/**
		 * 是否使用彩色编码保存日志
		 * @type {boolean}
		 */
		this.isLogInited = option?.isLogInited ?? true;

		/**
		 * 是否已经
		 * @type {boolean}
		 */
		this.isInited = false;

		if(!hasFirstInited) { this.init(); }
	}

	/**
	 * 初始化日志
	 */
	init() {
		const { name, level, pathSave, isHightlight } = this;

		const keyAppenderConsole = `${name}-Console`;
		const keyAppenderFile = `${name}-File`;
		const keyAppenderFileStack = `${name}-FileStack`;

		configure.appenders[keyAppenderConsole] = {
			type: { configure: configureConsole },
			isHightlight,
			handle: formatLog,
		};
		configure.appenders[keyAppenderFile] = {
			type: { configure: configureFile },
			path: join(pathSave, name + '.log'),
			isHightlight, maxLogSize: 1024 * 1024 * 20, eol: '\n',
			handle: (event, isHightlight) => formatLog(event, isHightlight)[0],
		};
		configure.appenders[keyAppenderFileStack] = {
			type: { configure: configureFile },
			path: join(pathSave, name + '.stack.log'),
			isHightlight, maxLogSize: 1024 * 1024 * 20, eol: '\n',
			handle: (event, isHightlight) => formatLog(event, isHightlight)[1],
		};


		configure.categories[name] = {
			appenders: pathSave ?
				[keyAppenderConsole, keyAppenderFile, keyAppenderFileStack] :
				[keyAppenderConsole],
			level
		};


		this.logger = Log4JS.configure(configure).getLogger(this.name);

		this.isInited = true;
		hasFirstInited = true;


		if(this.isLogInited) {
			if(pathSave) {
				this.info();
				// this.info('日志', '加载', '✔ ', `日志路径{${pathSave}}`);
			}
			else {
				this.info('日志', '加载', '✔ ');
			}
		}

		return this;
	}

	/**
	 * 异步重载日志
	 */
	async reload() {
		return new Promise((resolve, reject) =>
			Log4JS.shutdown(error => error ? resolve(this.init()) : reject(error))
		);
	}

	/**
	 * 控制台输入更新标记
	 */
	get U() { return symbolLogUpdate; }

	/**
	 * 跟踪（trace）
	 * - 用于`可能大量`显示的底层的数据跟踪
	 * - 如循环中的循环量的`i`等
	 * - 不应在生产环境中使用，也不应出现在提交的代码中，通常调试后立即删除
	 * - 颜色：blue
	 * @param {any} where 在哪里发生
	 * @param {any} where 在做什么
	 * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	  */
	// eslint-disable-next-line no-unused-vars
	trace(where, what, ...infos) { this.logger.trace(...arguments); }
	/**
	  * 调试（debug）
	  * - 用于`频率不高`的`经历过计算`的数据跟踪
	  * - 如某个函数的结果、不重要的心跳回复等
	  * - 颜色：cyan
	  * @param {any} where 在哪里发生
	  * @param {any} where 在做什么
	  * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	  */
	// eslint-disable-next-line no-unused-vars
	debug(where, what, ...infos) { this.logger.debug(...arguments); }
	/**
	 * 信息（info）
	 * - 用于常规的业务摘要或`非正常但非异常`的数据记录
	 * - 颜色：green
	 * @param {any} where 在哪里发生
	 * @param {any} where 在做什么
	 * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	 */
	// eslint-disable-next-line no-unused-vars
	info(where, what, ...infos) { this.logger.info(...arguments); }
	/**
	 * 警告（warn）
	 * - 用于`有可能`导致异常的运行记录
	 * - 如程序启动时，数据库测试连接超时，但程序认为可以稍后再次测试
	 * - 颜色：yellow
	 * @param {any} where 在哪里发生
	 * @param {any} where 在做什么
	 * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	 */
	// eslint-disable-next-line no-unused-vars
	warn(where, what, ...infos) { this.logger.warn(...arguments); }
	/**
	 * 错误（error）
	 * - 用于`异常`逻辑、`错误`数据的运行记录
	 * - 如业务运行时，数据库运行失败。必要字段为空导致业务中止等
	 * - 颜色：red
	 * @param {any} where 在哪里发生
	 * @param {any} where 在做什么
	 * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	 */
	// eslint-disable-next-line no-unused-vars
	error(where, what, ...infos) { this.logger.error(...arguments); }
	/**
	 * 致命（fatal）
	 * - 用于可能导致`程序退出`的严重的运行记录
	 * - 如未捕获的异常、意外的文件读写
	 * - 颜色：magenta
	 * @param {any} where 在哪里发生
	 * @param {any} where 在做什么
	 * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	 */
	// eslint-disable-next-line no-unused-vars
	fatal(where, what, ...infos) { this.logger.fatal(...arguments); }
	/**
	 * 标记（mark）
	 * - 最高级的日记记录，通常用于无关运行情况的必要的说明
	 * - 除非关闭日志，否则都会输出日志
	 * - 如版权说明、注意事项等
	 * - 颜色：grey
	 * @param {any} where 在哪里发生
	 * @param {any} where 在做什么
	 * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	 */
	// eslint-disable-next-line no-unused-vars
	mark(where, what, ...infos) { this.logger.mark(...arguments); }


	/**
	 * 跟踪（trace、行内更新）
	 * - 用于`可能大量`显示的底层的数据跟踪
	 * - 如循环中的循环量的`i`等
	 * - 不应在生产环境中使用，也不应出现在提交的代码中，通常调试后立即删除
	 * - 颜色：blue
	 * @param {any} where 在哪里发生
	 * @param {any} where 在做什么
	 * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	  */
	// eslint-disable-next-line no-unused-vars
	traceU(where, what, ...infos) { this.logger.trace(symbolLogUpdate, ...arguments); }
	/**
	  * 调试（debug、行内更新）
	  * - 用于`频率不高`的`经历过计算`的数据跟踪
	  * - 如某个函数的结果、不重要的心跳回复等
	  * - 颜色：cyan
	  * @param {any} where 在哪里发生
	  * @param {any} where 在做什么
	  * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	  */
	// eslint-disable-next-line no-unused-vars
	debugU(where, what, ...infos) { this.logger.debug(symbolLogUpdate, ...arguments); }
	/**
	 * 信息（info、行内更新）
	 * - 用于常规的业务摘要或`非正常但非异常`的数据记录
	 * - 颜色：green
	 * @param {any} where 在哪里发生
	 * @param {any} where 在做什么
	 * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	 */
	// eslint-disable-next-line no-unused-vars
	infoU(where, what, ...infos) { this.logger.info(symbolLogUpdate, ...arguments); }
	/**
	 * 警告（warn、行内更新）
	 * - 用于`有可能`导致异常的运行记录
	 * - 如程序启动时，数据库测试连接超时，但程序认为可以稍后再次测试
	 * - 颜色：yellow
	 * @param {any} where 在哪里发生
	 * @param {any} where 在做什么
	 * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	 */
	// eslint-disable-next-line no-unused-vars
	warnU(where, what, ...infos) { this.logger.warn(symbolLogUpdate, ...arguments); }
	/**
	 * 错误（error、行内更新）
	 * - 用于`异常`逻辑、`错误`数据的运行记录
	 * - 如业务运行时，数据库运行失败。必要字段为空导致业务中止等
	 * - 颜色：red
	 * @param {any} where 在哪里发生
	 * @param {any} where 在做什么
	 * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	 */
	// eslint-disable-next-line no-unused-vars
	errorU(where, what, ...infos) { this.logger.error(symbolLogUpdate, ...arguments); }
	/**
	 * 致命（fatal、行内更新）
	 * - 用于可能导致`程序退出`的严重的运行记录
	 * - 如未捕获的异常、意外的文件读写
	 * - 颜色：magenta
	 * @param {any} where 在哪里发生
	 * @param {any} where 在做什么
	 * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	 */
	// eslint-disable-next-line no-unused-vars
	fatalU(where, what, ...infos) { this.logger.fatal(symbolLogUpdate, ...arguments); }
	/**
	 * 标记（mark、行内更新）
	 * - 最高级的日记记录，通常用于无关运行情况的必要的说明
	 * - 除非关闭日志，否则都会输出日志
	 * - 如版权说明、注意事项等
	 * - 颜色：grey
	 * @param {any} where 在哪里发生
	 * @param {any} where 在做什么
	 * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	 */
	// eslint-disable-next-line no-unused-vars
	markU(where, what, ...infos) { this.logger.mark(symbolLogUpdate, ...arguments); }
};


export default Hades;