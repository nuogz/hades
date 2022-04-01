import { resolve, parse } from 'path';
import { readdirSync, readFileSync } from 'fs';

import I18N from 'i18next';

import { dirPackage } from './dir.js';


const dirLocale = resolve(dirPackage, 'locale');

export const localesSupport = readdirSync(dirLocale).filter(path => path.endsWith('.json')).map(path => parse(path).name);


const T = await I18N.init({
	fallbackLng: 'en',
	resources: {
		en: { translation: JSON.parse(readFileSync(resolve(dirLocale, 'en.json'))) },
		zh: { translation: JSON.parse(readFileSync(resolve(dirLocale, 'zh.json'))) },
	},
});


I18N.services.formatter.add('hadesValue', value => `~{${value}}`);
I18N.services.formatter.add('hadesTerm', value => `~[${value}]`);


export default T;
