import { CheerioAPI } from 'cheerio';
import { extractInfoFromScript, extractRegexFromString } from '.';

export const extractFromVariousLocations = (
  $: CheerioAPI,
  raw_selector: string,
  regexp?: RegExp,
) => {
  let result: null | string = null;
  // _attribute;<selector>;<attribute>
  if (raw_selector.includes('_attribute')) {
    const selector = raw_selector.split(';')[1];
    const attribute = raw_selector.split(';')[2];
    const elem = $(selector);
    if (elem.length > 0) {
      const content = elem.attr(attribute);
      return content;
    }else{
        return null;
    }
  }
  if (raw_selector.includes('meta')) {
    const elem = $(raw_selector);
    if (elem.length > 0) {
      const content = elem.attr('content');
      if (regexp && content) {
        const match = extractRegexFromString(content, regexp);
        if (match) {
          return match;
        }
      }
      if (content) {
        return content;
      }
    }
  }
  if (raw_selector.includes('script') || raw_selector.includes('NEXT_DATA')) {
    const value = extractInfoFromScript($, raw_selector);
    if (value) {
      return value;
    }
  }

  if (regexp) {
    const elem = $(raw_selector);
    if (elem.length > 0) {
      let match = elem.text().match(regexp);
      if (match) {
        return match[0];
      } else {
        const dataRegex = raw_selector.match(/(?<=\[).+?(?=\])/gi);
        const attributes = elem.attr();
        if (dataRegex && attributes) {
          return attributes[dataRegex[0]];
        }
      }
    }
  } else {
    const elem = $(raw_selector);
    if (elem.length > 0) {
      const _text = elem.text();
      const text = elem.first().text();
      if (raw_selector.includes('data-content')) {
      }
      result = text;
    }
  }
  return result;
};
