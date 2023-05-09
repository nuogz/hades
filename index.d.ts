/**
 * Hades Option
 * @typedef {Object} HadesOption
 * @property {number} sizeLogFileMax
 * @property {boolean} isHighlight
 * @property {boolean} isOutputInited
 * @property {boolean} isOutputDirLog
 * @property {boolean} isInitImmediate
 */
/**
 * Log4JS Total Configuration
 * @type {Log4JS.Configuration}
 */
export const configureStatic: Log4JS.Configuration;
export function ErrorCause(message: Error | string, cause?: any): Error;
export function ErrorData(message: Error | string, data?: any): Error;
/**
 * - Log system in the format of `where, what, and result`
 * - The error stack will not output by default，saved in file `*.stack.log` instead
 * - 7 log level：
 *   - trace
 *   - debug
 *   - info
 *   - warn
 *   - error
 *   - fatal
 *   - mark
 * @class
 */
export default class Hades {
    /**
     * @param {string} [name]
     * @param {string} [level]
     * @param {string} [dirLog]
     * @param {HadesOption} [option]
     * @returns {Log4JS.Logger}
     */
    constructor(name?: string, level?: string, dirLog?: string, option?: HadesOption);
    /**
     * logger name (file name by default)
     * @type {string}
     */
    name: string;
    /**
     * log max level
     * @type {string}
     */
    level: string;
    /**
     * dir of log saved
     * @type {string}
     */
    dirLog: string;
    /**
     * max size of one log file;
     * @type {string}
     */
    sizeLogFileMax: string;
    /**
     * the template for log time formatting
     * @type {string}
     */
    templateTime: string;
    /**
     * detect use colorful highhight to render logs
     * @type {boolean}
     */
    isHighlight: boolean;
    /**
     * detect output the initial result after init
     * @type {boolean}
     */
    isOutputInited: boolean;
    /**
     * detect output the dir of logs
     * @type {boolean}
     */
    isOutputDirLog: boolean;
    /**
     * detect init logger immediately when new instance
     * @type {boolean}
     */
    isInitImmediate: boolean;
    /**
     * is inited logger or not
     * @type {boolean}
     */
    isInited: boolean;
    /**
     * Log4JS's Logger
     * @type {Log4JS.Logger}
     */
    logger: Log4JS.Logger;
    /** init Hades */
    init(): Hades;
    /**
     * reload logger asynchronously
     * @returns {Promise<Hades>}
     */
    reload(): Promise<Hades>;
    /**
     * the symbol of console line update
     */
    get symbolLogUpdate(): symbol;
    /**
     * the symbol of console line update ended
     */
    get symbolLogDone(): symbol;
    /**
     * trace
     * - used to record `low-level` data with `high` frequency
     * - such as `i` in loop
     * - should not be used in the `production` environment,
     *   nor should `submit` any trace code. it is usually deleted immediately after debugging
     * - blue color
     * @param {string} where
     * @param {string} what
     * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
      */
    trace(where: string, what: string, ...infos: any[]): void;
    /**
     * debug
     * - used to record `calculation results` with `low` frequency
     * - such as the result of a function, or not important heartbeat
     * - cyan color
     * @param {string} where
     * @param {string} what
     * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
     */
    debug(where: string, what: string, ...infos: any[]): void;
    /**
     * info
     * - used to record regular summaries, or expected exception datas that can be handled
     * - green color
     * @param {string} where
     * @param {string} what
     * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
     */
    info(where: string, what: string, ...infos: any[]): void;
    /**
     * warn
     * - used to record operation datas that may cause exceptions
     * - such as the database connection timed out during the startup of the program,
     *   but the program can be connected again later
     * - yellow color
     * @param {string} where
     * @param {string} what
     * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
     */
    warn(where: string, what: string, ...infos: any[]): void;
    /**
     * error
     * - used to record abnormal logic and unexpected error datas
     * - such as when inserting data into the database.
     *   but the necessary fields are empty, resulting in business interruption
     * - red color
     * @param {string} where
     * @param {string} what
     * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
     */
    error(where: string, what: string, ...infos: any[]): void;
    /**
     * fatal
     * - used to record critical logs that cause the program to exit
     * - such as unhandled exception, unexpected file read and write
     * - magenta color
     * @param {string} where
     * @param {string} what
     * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
     */
    fatal(where: string, what: string, ...infos: any[]): void;
    /**
     * mark
     * - used to record the necessary descriptions of unrelated operation conditions
     * - unless the log is turned off, it will be output
     * - such as copyright description and precautions
     * - grey color
     * @param {string} where
     * @param {string} what
     * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
     */
    mark(where: string, what: string, ...infos: any[]): void;
    /**
     * traceU
     * - mark as inline update
     * - used to record `low-level` data with `high` frequency
     * - such as `i` in loop
     * - should not be used in the `production` environment,
     *   nor should `submit` any trace code. it is usually deleted immediately after debugging
     * - blue color
     * @param {string} where
     * @param {string} what
     * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
      */
    traceU(where: string, what: string, ...infos: any[]): void;
    /**
     * debugU
     * - mark as inline update
     * - used to record `calculation results` with `low` frequency
     * - such as the result of a function, or not important heartbeat
     * - cyan color
     * @param {string} where
     * @param {string} what
     * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
     */
    debugU(where: string, what: string, ...infos: any[]): void;
    /**
     * infoU
     * - mark as inline update
     * - used to record regular summaries, or expected exception datas that can be handled
     * - green color
     * @param {string} where
     * @param {string} what
     * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
     */
    infoU(where: string, what: string, ...infos: any[]): void;
    /**
     * warnU
     * - mark as inline update
     * - used to record operation datas that may cause exceptions
     * - such as the database connection timed out during the startup of the program,
     *   but the program can be connected again later
     * - yellow color
     * @param {string} where
     * @param {string} what
     * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
     */
    warnU(where: string, what: string, ...infos: any[]): void;
    /**
     * errorU
     * - mark as inline update
     * - used to record abnormal logic and unexpected error datas
     * - such as when inserting data into the database.
     *   but the necessary fields are empty, resulting in business interruption
     * - red color
     * @param {string} where
     * @param {string} what
     * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
     */
    errorU(where: string, what: string, ...infos: any[]): void;
    /**
     * fatalU
     * - mark as inline update
     * - used to record critical logs that cause the program to exit
     * - such as unhandled exception, unexpected file read and write
     * - magenta color
     * @param {string} where
     * @param {string} what
     * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
     */
    fatalU(where: string, what: string, ...infos: any[]): void;
    /**
     * markU
     * - mark as inline update
     * - used to record the necessary descriptions of unrelated operation conditions
     * - unless the log is turned off, it will be output
     * - such as copyright description and precautions
     * - grey color
     * @param {string} where
     * @param {string} what
     * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
     */
    markU(where: string, what: string, ...infos: any[]): void;
    /**
     * traceD
     * - mark as inline update ended
     * - used to record `low-level` data with `high` frequency
     * - such as `i` in loop
     * - should not be used in the `production` environment,
     *   nor should `submit` any trace code. it is usually deleted immediately after debugging
     * - blue color
     * @param {string} where
     * @param {string} what
     * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
      */
    traceD(where: string, what: string, ...infos: any[]): void;
    /**
      * debugD
     * - mark as inline update ended
     * - used to record `calculation results` with `low` frequency
     * - such as the result of a function, or not important heartbeat
     * - cyan color
     * @param {string} where
      * @param {string} what
      * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
      */
    debugD(where: string, what: string, ...infos: any[]): void;
    /**
     * infoD
     * - mark as inline update ended
     * - used to record regular summaries, or expected exception datas that can be handled
     * - green color
     * @param {string} where
     * @param {string} what
     * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
     */
    infoD(where: string, what: string, ...infos: any[]): void;
    /**
     * warnD
     * - mark as inline update ended
     * - used to record operation datas that may cause exceptions
     * - such as the database connection timed out during the startup of the program,
     *   but the program can be connected again later
     * - yellow color
     * @param {string} where
     * @param {string} what
     * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
     */
    warnD(where: string, what: string, ...infos: any[]): void;
    /**
     * errorD
     * - mark as inline update ended
     * - used to record abnormal logic and unexpected error datas
     * - such as when inserting data into the database.
     *   but the necessary fields are empty, resulting in business interruption
     * - red color
     * @param {string} where
     * @param {string} what
     * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
     */
    errorD(where: string, what: string, ...infos: any[]): void;
    /**
     * fatalD
     * - mark as inline update ended
     * - used to record critical logs that cause the program to exit
     * - such as unhandled exception, unexpected file read and write
     * - magenta color
     * @param {string} where
     * @param {string} what
     * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
     */
    fatalD(where: string, what: string, ...infos: any[]): void;
    /**
     * markD
     * - mark as inline update ended
     * - used to record the necessary descriptions of unrelated operation conditions
     * - unless the log is turned off, it will be output
     * - such as copyright description and precautions
     * - grey color
     * @param {string} where
     * @param {string} what
     * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
     */
    markD(where: string, what: string, ...infos: any[]): void;
    /**
      * fatalU
     * - exit with detect exit code
     * - used to record critical logs that cause the program to exit
     * - such as unhandled exception, unexpected file read and write
     * - magenta color
     * @param {number} code exit code
     * @param {string} where
     * @param {string} what
     * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
     */
    fatalE(code: number, where: string, what: string, ...infos: any[]): void;
}
/**
 * Hades Option
 */
export type HadesOption = {
    sizeLogFileMax: number;
    isHighlight: boolean;
    isOutputInited: boolean;
    isOutputDirLog: boolean;
    isInitImmediate: boolean;
};
import Log4JS from 'log4js';
