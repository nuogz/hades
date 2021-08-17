import Chalk from 'chalk';
import Moment from 'moment';


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


export default function({ startTime, level: { colour, levelStr }, data: datas }, isHightlight) {
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

	if(isHightlight) {
		where = highlight(where);
		action = highlight(action);
		resultAll = highlight(resultAll);
	}

	let logFinal =
		`[${time}][${level}] ${where}` +
		(action ? ` >  ${action}` : '') +
		(resultAll ? `  ${resultAll}` : '')
		;
	if(isHightlight) { logFinal = Chalk[color](logFinal); }

	const logError = [
		logFinal,
		'-------------- Stack --------------',
		errors
			.map(error =>
				(isHightlight ? Chalk[color](highlight(error.message)) : error.message) +
				(error.stack ? `\n${String(error.stack).replace(/ {4}/g, '\t')}` : '') +
				(error.data ? `\n[Data] ${error.data}` : '')
			)
			.join('\n--------------\n'),
		'===================================\n',
	].join('\n');

	return [logFinal, errors.length ? logError : undefined];
}