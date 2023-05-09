export function highlight(string: string): string;
export default formatLog;
/**
 *
 * @param {import('log4js').LoggingEvent} event
 * @param {boolean} isHighlight
 * @param {import('@nuogz/i18n').TranslatorWithGlobalLocale} T
 * @returns
 */
declare function formatLog(event: import('log4js').LoggingEvent, isHighlight: boolean, T: import('@nuogz/i18n').TranslatorWithGlobalLocale): string[];
