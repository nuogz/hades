import Chalk from 'chalk';
import Moment from 'moment';



const chalkTextWord = Chalk.underline.bold('$1');
const chalkTextValue = Chalk.white('[$1]');
const highlight = string => String(string)
	.replace(/~\[(.*?)\]/g, chalkTextWord)
	.replace(/~\{(.*?)\}/g, chalkTextValue)
	;


const formatLog = ({ startTime, level: { colour, levelStr }, data: datas }, isHighlight, T) => {
	if(!datas.length) { return ['']; }

	const color = colour;
	const level = T(levelStr);
	const time = Moment(startTime).format('YY-MM-DD HH:mm:ss:SSS');


	const texts = [];
	const errors = [];
	for(let i = 2; i < datas.length; i++) {
		const data = datas[i];

		if(data === undefined) { continue; }

		if(data instanceof Error || (data.stack && data.message)) {
			errors.push(data);

			texts.push(String(data.message));
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
