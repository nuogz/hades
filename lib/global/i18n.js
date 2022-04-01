import { resolve, parse } from 'path';
import { readdirSync, readFileSync } from 'fs';

import I18N from 'i18next';

import { dirPackage } from './dir.js';


const dirLocale = resolve(dirPackage, 'locale');

export const localesSupport = readdirSync(dirLocale).filter(path => path.endsWith('.json')).map(path => parse(path).name);


const i18n = I18N.createInstance();

const T = await i18n.init({
	fallbackLng: 'en',
	resources: {
		en: { translation: JSON.parse(readFileSync(resolve(dirLocale, 'en.json'))) },
		zh: { translation: JSON.parse(readFileSync(resolve(dirLocale, 'zh.json'))) },
	},
});

i18n.services.formatter.add('hadesValue', value => `~{${value}}`);
i18n.services.formatter.add('hadesTerm', value => `~[${value}]`);


export default T;
