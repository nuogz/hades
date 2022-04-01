import './lib/init.js';

import { resolve } from 'path';

import Log4JS from 'log4js';

import T, { localesSupport } from './lib/global/i18n.js';

import formatLog from './lib/formatLog.js';
import configureFile from './lib/FileAppender.js';
import configureConsole from './lib/ConsoleAppender.js';

import symbolLogUpdate from './lib/LogUpdateSymbol.js';
import symbolLogDone from './lib/LogDoneSymbol.js';


/**
 * 接口配置
 * @typedef {Object} HadesOption
 * @property {number} sizeLogFileMax 单个日志文件最大尺寸
 * @property {boolean} isHighlight 是否使用彩色编码保存日志
 * @property {boolean} isOutputInited 是否输出初始化结果
 * @property {boolean} isOutputDirLog 是否输出日志位置
 * @property {boolean} isInitImmediate 是否立即加载日志
 * @property {string} locale 日志语言
 */


/**
 * Log4JS 总配置
 * @type {Log4JS.Configuration}
 */
export const configureStatic = {
	appenders: {
		default: { type: 'console' }
	},
	categories: {
		default: { appenders: ['default'], level: 'off' }
	},
	pm2: true,
};


const parseFlagsEnv = () => {
	let textRaw = process.env.HADES_OPTIONS;

	if(textRaw !== undefined && !textRaw.trim()) { return {}; }


	const flagsRaw = textRaw.split(',');

	const flagHighlight = flagsRaw.find(f => /^!?Highlight$/i.test(f));
	const flagOutputInited = flagsRaw.find(f => /^!?OutputInited$/i.test(f));
	const flagOutputDirLog = flagsRaw.find(f => /^!?OutputDirLog$/i.test(f));
	const flagInitImmediate = flagsRaw.find(f => /^!?InitImmediate$/i.test(f));

	return {
		isHighlight: flagHighlight === undefined ? void 0 : !flagHighlight.startsWith('!'),
		isOutputInited: flagOutputInited === undefined ? void 0 : !flagOutputInited.startsWith('!'),
		isOutputDirLog: flagOutputDirLog === undefined ? void 0 : !flagOutputDirLog.startsWith('!'),
		isInitImmediate: flagInitImmediate === undefined ? void 0 : !flagInitImmediate.startsWith('!'),
	};
};


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
 * @version 4.0.0-2022.04.01.01
 * @class
 * @requires chalk(4)
 * @requires log-update(4)
 * @requires log4js(6)
 * @requires moment(2)
 */
const Hades = class Hades {
	/**
	 * 日志名称
	 * @type {string}
	 */
	name;
	/**
	 * 日志等级
	 * @type {string}
	 */
	level;
	/**
	 * 日志存储文件夹
	 * @type {string}
	 */
	dirLog;
	/**
	 * 单个日志文件最大尺寸
	 * @type {string}
	 */
	sizeLogFileMax;


	/**
	 * 是否使用彩色编码保存日志
	 * @type {boolean}
	 */
	isHighlight;
	/**
	 * 是否输出初始化结果
	 * @type {boolean}
	 */
	isOutputInited;
	/**
	 * 是否输出日志位置
	 * @type {boolean}
	 */
	isOutputDirLog;
	/**
	 * 是否立即加载日志
	 * @type {boolean}
	 */
	isInitImmediate;
	/**
	 * 是否已经加载日志
	 * @type {boolean}
	 */
	isInited = false;


	/**
	 * 可用语言
	 * @type {string[]}
	 */
	static localesSupport = localesSupport;

	/**
	 * 日志语言
	 * @type {string}
	 */
	locale;

	/**
	 * 获取翻译
	 */
	T(key, options = {}) {
		return T(key, Object.assign(JSON.copy(options), { lng: this.locale }));
	}


	/**
	 * Log4JS的日志器
	 * @type {Log4JS.Logger}
	 */
	logger;


	/**
	 * @param {string} [name] 日志名称
	 * @param {string} [level] 日志等级
	 * @param {string} [dirLog] 保存路径
	 * @param {HadesOption} [option] 日志选项
	 * @returns {Log4JS.Logger} Logger，日志系统自身
	 */
	constructor(name, level, dirLog, option) {
		const env = process.env;

		this.name = name ?? 'default';
		this.level = level ?? env.HADES_LEVEL ?? 'all';
		this.dirLog = dirLog ?? env.HADES_DIR_LOG;

		this.sizeLogFileMax = option?.sizeLogFileMax ?? 1024 * 1024 * 20;

		const flags = parseFlagsEnv();

		this.isHighlight = option?.isHighlight ?? flags.isHighlight ?? true;
		this.isOutputInited = option?.isOutputInited ?? flags.isOutputInited ?? true;
		this.isOutputDirLog = option?.isOutputDirLog ?? flags.isOutputDirLog ?? false;
		this.isInitImmediate = option?.isInitImmediate ?? flags.isInitImmediate ?? true;

		this.locale = option?.locale ?? 'zh';


		if(this.isInitImmediate) { this.init(); }
	}


	/** 初始化 */
	init() {
		const { name, level, dirLog, isHighlight, isOutputInited, isOutputDirLog } = this;


		const configure = JSON.copy(configureStatic);
		const appenders = [];


		const nameAppenderConsole = `${name}-console`;
		configure.appenders[nameAppenderConsole] = {
			type: { configure: configureConsole },
			isHighlight,
			T: this.T.bind(this),
			handle: (event, isHighlight, T) => formatLog(event, isHighlight, T),
		};
		appenders.push(nameAppenderConsole);


		if(dirLog) {
			const nameAppenderFile = `${name}-file`;
			configure.appenders[nameAppenderFile] = {
				type: { configure: configureFile },
				path: resolve(dirLog, name + '.log'),
				isHighlight, maxLogSize: this.sizeLogFileMax, eol: '\n',
				T: this.T.bind(this),
				handle: (event, isHighlight, T) => formatLog(event, isHighlight, T)[0],
			};
			appenders.push(nameAppenderFile);


			const nameAppenderFileStack = `${name}-file-stack`;
			configure.appenders[nameAppenderFileStack] = {
				type: { configure: configureFile },
				path: resolve(dirLog, name + '.stack.log'),
				isHighlight, maxLogSize: this.sizeLogFileMax, eol: '\n',
				T: this.T.bind(this),
				handle: (event, isHighlight, T) => formatLog(event, isHighlight, T)[1],
			};
			appenders.push(nameAppenderFileStack);
		}


		configure.categories[name] = { appenders, level };


		this.logger = Log4JS.configure(configure).getLogger(name);

		this.isInited = true;


		if(isOutputInited) {
			if(dirLog && isOutputDirLog) {
				this.info(this.T('name'), this.T('init'), '✔ ', `${this.T('init')}~{${dirLog}}`);
			}
			else {
				this.info(this.T('name'), this.T('init'), '✔ ');
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
	 * 控制台输出更新标记
	 */
	get symbolLogUpdate() { return symbolLogUpdate; }
	/**
	 * 控制台输出更新结束标记
	 */
	get symbolLogDone() { return symbolLogDone; }


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
	debug(where, what, ...infos) { this.logger.debug(...arguments); }
	/**
	 * 信息（info）
	 * - 用于常规的业务摘要或`非正常但非异常`的数据记录
	 * - 颜色：green
	 * @param {any} where 在哪里发生
	 * @param {any} where 在做什么
	 * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	 */
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
	mark(where, what, ...infos) { this.logger.mark(...arguments); }


	/**
	 * 记录`跟踪`日志，并标记行内更新
	 * - 用于`可能大量`显示的底层的数据跟踪
	 * - 如循环中的循环量的`i`等
	 * - 不应在生产环境中使用，也不应出现在提交的代码中，通常调试后立即删除
	 * - 颜色：blue
	 * @param {any} where 在哪里发生
	 * @param {any} where 在做什么
	 * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	  */
	traceU(where, what, ...infos) { this.logger.trace(symbolLogUpdate, ...arguments); }
	/**
	  * 记录`调试`日志，并标记行内更新
	  * - 用于`频率不高`的`经历过计算`的数据跟踪
	  * - 如某个函数的结果、不重要的心跳回复等
	  * - 颜色：cyan
	  * @param {any} where 在哪里发生
	  * @param {any} where 在做什么
	  * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	  */
	debugU(where, what, ...infos) { this.logger.debug(symbolLogUpdate, ...arguments); }
	/**
	 * 记录`信息`日志，并标记行内更新
	 * - 用于常规的业务摘要或`非正常但非异常`的数据记录
	 * - 颜色：green
	 * @param {any} where 在哪里发生
	 * @param {any} where 在做什么
	 * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	 */
	infoU(where, what, ...infos) { this.logger.info(symbolLogUpdate, ...arguments); }
	/**
	 * 记录`警告`日志，并标记行内更新
	 * - 用于`有可能`导致异常的运行记录
	 * - 如程序启动时，数据库测试连接超时，但程序认为可以稍后再次测试
	 * - 颜色：yellow
	 * @param {any} where 在哪里发生
	 * @param {any} where 在做什么
	 * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	 */
	warnU(where, what, ...infos) { this.logger.warn(symbolLogUpdate, ...arguments); }
	/**
	 * 记录`错误`日志，并标记行内更新
	 * - 用于`异常`逻辑、`错误`数据的运行记录
	 * - 如业务运行时，数据库运行失败。必要字段为空导致业务中止等
	 * - 颜色：red
	 * @param {any} where 在哪里发生
	 * @param {any} where 在做什么
	 * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	 */
	errorU(where, what, ...infos) { this.logger.error(symbolLogUpdate, ...arguments); }
	/**
	 * 记录`致命`日志，并标记行内更新
	 * - 用于可能导致`程序退出`的严重的运行记录
	 * - 如未捕获的异常、意外的文件读写
	 * - 颜色：magenta
	 * @param {any} where 在哪里发生
	 * @param {any} where 在做什么
	 * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	 */
	fatalU(where, what, ...infos) { this.logger.fatal(symbolLogUpdate, ...arguments); }
	/**
	 * 记录`标记`日志，并标记行内更新
	 * - 最高级的日记记录，通常用于无关运行情况的必要的说明
	 * - 除非关闭日志，否则都会输出日志
	 * - 如版权说明、注意事项等
	 * - 颜色：grey
	 * @param {any} where 在哪里发生
	 * @param {any} where 在做什么
	 * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	 */
	markU(where, what, ...infos) { this.logger.mark(symbolLogUpdate, ...arguments); }


	/**
	 * 记录`跟踪`日志，并标记行内更新结束
	 * - 用于`可能大量`显示的底层的数据跟踪
	 * - 如循环中的循环量的`i`等
	 * - 不应在生产环境中使用，也不应出现在提交的代码中，通常调试后立即删除
	 * - 颜色：blue
	 * @param {any} where 在哪里发生
	 * @param {any} where 在做什么
	 * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	  */
	traceD(where, what, ...infos) { this.logger.trace(symbolLogDone, ...arguments); }
	/**
	  * 记录`调试`日志，并标记行内更新结束
	  * - 用于`频率不高`的`经历过计算`的数据跟踪
	  * - 如某个函数的结果、不重要的心跳回复等
	  * - 颜色：cyan
	  * @param {any} where 在哪里发生
	  * @param {any} where 在做什么
	  * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	  */
	debugD(where, what, ...infos) { this.logger.debug(symbolLogDone, ...arguments); }
	/**
	 * 记录`信息`日志，并标记行内更新结束
	 * - 用于常规的业务摘要或`非正常但非异常`的数据记录
	 * - 颜色：green
	 * @param {any} where 在哪里发生
	 * @param {any} where 在做什么
	 * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	 */
	infoD(where, what, ...infos) { this.logger.info(symbolLogDone, ...arguments); }
	/**
	 * 记录`警告`日志，并标记行内更新结束
	 * - 用于`有可能`导致异常的运行记录
	 * - 如程序启动时，数据库测试连接超时，但程序认为可以稍后再次测试
	 * - 颜色：yellow
	 * @param {any} where 在哪里发生
	 * @param {any} where 在做什么
	 * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	 */
	warnD(where, what, ...infos) { this.logger.warn(symbolLogDone, ...arguments); }
	/**
	 * 记录`错误`日志，并标记行内更新结束
	 * - 用于`异常`逻辑、`错误`数据的运行记录
	 * - 如业务运行时，数据库运行失败。必要字段为空导致业务中止等
	 * - 颜色：red
	 * @param {any} where 在哪里发生
	 * @param {any} where 在做什么
	 * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	 */
	errorD(where, what, ...infos) { this.logger.error(symbolLogDone, ...arguments); }
	/**
	 * 记录`致命`日志，并标记行内更新结束
	 * - 用于可能导致`程序退出`的严重的运行记录
	 * - 如未捕获的异常、意外的文件读写
	 * - 颜色：magenta
	 * @param {any} where 在哪里发生
	 * @param {any} where 在做什么
	 * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	 */
	fatalD(where, what, ...infos) { this.logger.fatal(symbolLogDone, ...arguments); }
	/**
	 * 记录`标记`日志，并标记行内更新结束
	 * - 最高级的日记记录，通常用于无关运行情况的必要的说明
	 * - 除非关闭日志，否则都会输出日志
	 * - 如版权说明、注意事项等
	 * - 颜色：grey
	 * @param {any} where 在哪里发生
	 * @param {any} where 在做什么
	 * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	 */
	markD(where, what, ...infos) { this.logger.mark(symbolLogDone, ...arguments); }

	/**
	 * 记录`致命`日志，并退出程序
	 * - 用于可能导致`程序退出`的严重的运行记录
	 * - 如未捕获的异常、意外的文件读写
	 * - 颜色：magenta
	 * @param {number} code 退出代码
	 * @param {any} where 在哪里发生
	 * @param {any} where 在做什么
	 * @param {any[]} infos 日志内容。第一个内容不换行，第二个内容开始换行并缩进
	 */
	fatalE(code, where, what, ...infos) {
		const args = [...arguments];
		args.shift();

		this.logger.fatal(symbolLogDone, ...args);

		process.exit(code);
	}
};


export default Hades;
