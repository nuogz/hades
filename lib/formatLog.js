import Chalk from 'chalk';
import Day from 'dayjs';

import DayCustomParseFormatPlugin from 'dayjs/plugin/customParseFormat.js';



Day.extend(DayCustomParseFormatPlugin);


const chalkTextWord = Chalk.underline.bold('$1');
const chalkTextValue = Chalk.white('[$1]');

/**
 * @param {string} string
 * @returns {string}
 */
export const highlight = string =>
	String(string)
		.replace(/(?<!\\)~(?<!\\)\[(.*?)(?<!\\)\]/g, chalkTextWord)
		.replace(/(?<!\\)~(?<!\\)\{(.*?)(?<!\\)\}/g, chalkTextValue)
		.replace(/\\([~{}[\]])/g, '$1')
	;


const isErrorLike = object => object instanceof Error || (object?.stack && object?.message);



/**
 *
 * @param {import('log4js').LoggingEvent} event
 * @param {boolean} isHighlight
 * @param {import('@nuogz/i18n').TranslatorWithGlobalLocale} T
 * @returns
 */
const formatLog = (event, isHighlight, T) => {
	const { startTime, level: { colour, levelStr }, data: datas } = event;
	if(!datas.length) { return ['']; }


	const color = colour;
	const level = T(`level.${levelStr}`);
	const time = Day(startTime).format('YY-MM-DD HH:mm:ss:SSS');


	const texts = [];
	const errors = [];
	for(let i = 2; i < datas.length; i++) {
		const data = datas[i];

		if(data === undefined) { continue; }

		if(isErrorLike(data)) {
			errors.push(data);

			texts.push(String(data.message));

			let causeNow = data.cause;
			while(isErrorLike(causeNow)) {
				errors.push(causeNow);

				texts.push(`--> ${causeNow.message}`);

				causeNow = causeNow.cause;
			}

			if(causeNow) { texts.push(`--> ${causeNow}`); }
		}
		else if(data.message) {
			texts.push(String(data.message));
		}
		else {
			texts.push(String(data));
		}
	}


	let where = datas[0];
	let action = datas[1];
	let resultAll = texts.join('\n\t');

	if(isHighlight) {
		where = highlight(where);
		action = highlight(action);
		resultAll = highlight(resultAll);
	}


	let logFinal =
		`[${time}][${level}] ${where}` +
		(action ? ` >  ${action}` : '') +
		(resultAll ? `  ${resultAll}` : '')
		;
	if(isHighlight) { logFinal = Chalk[color](logFinal); }


	const logError = [
		logFinal,
		'-------------- Stack --------------',
		errors
			.map(error =>
				(isHighlight ? Chalk[color](highlight(error.message)) : error.message) +
				(error.stack ? `\n${String(error.stack).replace(/ {4}/g, '\t')}` : '') +
				(error.data ? `\n[Data] ${error.data}` : '')
			)
			.join('\n--------------\n'),
		'===================================\n',
	].join('\n');


	return errors.length ? [logFinal, logError] : [logFinal];
};



export default formatLog;
