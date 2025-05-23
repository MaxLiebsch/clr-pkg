import { ElementHandle } from 'rebrowser-puppeteer';
import {
  Details,
  ExistDetail,
  IAttributeDetail,
  IListDetail,
  IParseJSONDetail,
  IParseJSONElementDetail,
  ITableDetail,
  ITextDetail,
  NestedNameDetail,
} from '../../types/productInfoDetails';
import {
  cleanUpHTML,
  extractPart,
  getElementHandleInnerText,
  myQuerySelectorAllElementHandle,
  nestedProductName,
} from '../helpers';
import { extractTextFromElementHandle } from './extractTextFromHandle';
import { attrFromEleInEleHandle } from './extractAttributeFromHandle';
import { safeJSONParse } from './saveParseJSON';
import { get } from 'lodash';
import { findProperty } from './findProperty';
import { TableContent } from '../../types/table';
import { detailExtractorRegistry } from './productDetailPageParser.gateway';
import { Content } from '../../types/DbProductRecord';

export abstract class ExtractProductDetail {
  constructor() {}
  abstract extractDetail(
    element: ElementHandle,
    detail: unknown,
  ): Promise<string | string[] | null>;
}
export class ListExtractor implements ExtractProductDetail {
  async extractDetail(element: ElementHandle, detail: IListDetail) {
    const { sel, listItemType, listItemInnerSel } = detail;
    const list: string[] = [];
    const listItemHandles = await myQuerySelectorAllElementHandle(element, sel);
    if (listItemHandles) {
      for (let i = 0; i < listItemHandles.length; i++) {
        const listItemHandle = listItemHandles[i];
        const ExtractorClass = detailExtractorRegistry[listItemType];
        const extractorClass = new ExtractorClass();
        const value = await extractorClass.extractDetail(listItemHandle, {
          ...detail,
          type: listItemType,
          sel: listItemInnerSel,
        });
        if (value) list.push(value);
      }
      return list;
    }

    return null;
  }
}
export class TableExtractor implements ExtractProductDetail {
  async extractDetail(element: ElementHandle, detail: ITableDetail) {
    const { head, row, content, keys } = detail;
    const keyHandles = await myQuerySelectorAllElementHandle(element, head);
    const valueHandles = await myQuerySelectorAllElementHandle(element, row);
    const table: TableContent[] = [];
    if (keyHandles && valueHandles)
      for (let i = 0; i < keyHandles.length; i++) {
        let valueText = '';
        const keyHandle = keyHandles[i];
        const keyText = await getElementHandleInnerText(keyHandle);
        if (keyText) {
          const innerText = await getElementHandleInnerText(valueHandles[i]);
          if (innerText) {
            valueText = innerText;
          }
          const headerText = keyText.replaceAll(/\W/g, '').trim();
          table.push({
            key: headerText,
            value: valueText.trim(),
          });
          if (keys && keys.length > 0) {
            if (keys.includes(headerText.toLowerCase().trim())) {
              return valueText.trim();
            }
          } else if (headerText.toLowerCase().trim() === content) {
            return valueText.trim();
          }
        }
      }
    return null;
  }
}
export class TextDetailExtractor implements ExtractProductDetail {
  async extractDetail(element: ElementHandle, detail: ITextDetail) {
    const { sel, type, content, regexp } = detail;
    const el = await extractTextFromElementHandle(element, sel);
    if (el) {
      let foundEl = el;
      if (content === 'price') {
        foundEl = foundEl.replace(/\s/g, '');
      }
      if (content === 'image' && regexp) {
        foundEl = extractPart(foundEl, regexp, detail?.extractPart ?? 1);
      }
      return cleanUpHTML(foundEl);
    } else {
      return null;
    }
  }
}

const returnValue = (content: Content, value: any) => {
  if (value) {
    if (content === 'image' && value instanceof Array) {
      return value[0];
    }
    return value;
  }
};

export class ParseJSONFromElementExtractor implements ExtractProductDetail {
  async extractDetail(element: ElementHandle, detail: IParseJSONElementDetail) {
    const { path, sel, content, regexp } = detail;
    try {
      if (detail?.multiple) {
        const elements = await myQuerySelectorAllElementHandle(element, sel);
        if (elements) {
          for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const el = await getElementHandleInnerText(element);
            if (!el) continue;
            if (regexp) {
              const regExp = new RegExp(regexp);
              const match = el.match(regExp);
              if (match && match[1]) {
                return match[1];
              }
            } else {
              const parsed = safeJSONParse(el);
              if (!parsed) continue;
              if (path instanceof Array) {
                for (let j = 0; j < path.length; j++) {
                  const value = findProperty(parsed, path[j]);
                  if (value) {
                    if (content === 'image' && value instanceof Array) {
                      return value[0];
                    }
                    return value;
                  }
                }
              } else {
                const value = findProperty(parsed, path);
                if (value) {
                  if (content === 'image' && value instanceof Array) {
                    return value[0];
                  }
                  return value;
                }
              }
            }
          }
        }
      } else {
        const el = await getElementHandleInnerText(element);
        if (!el) return null;
        if (regexp) {
          const regExp = new RegExp(regexp);
          const match = el.match(regExp);
          if (match && match[1]) {
            return match[1];
          }
        } else {
          const parsed = safeJSONParse(el);
          if (!parsed) return null;
          if (path instanceof Array) {
            for (let j = 0; j < path.length; j++) {
              const value = findProperty(parsed, path[j]);
              if (content === 'image' && value instanceof Array) {
                return value[0];
              }
              return value;
            }
          } else {
            const value = findProperty(parsed, path);
            if (content === 'image' && value instanceof Array) {
              return value[0];
            }
            return value;
          }
        }
      }
    } catch (error) {
      console.error('error:', error);
      return null;
    }
  }
}
export class ParseJSONDetailExtractor implements ExtractProductDetail {
  async extractDetail(element: ElementHandle, detail: IParseJSONDetail) {
    const { key, attr, urls, redirect_regexp, sel } = detail;
    try {
      const el = await attrFromEleInEleHandle(element, sel, attr);
      if (!el) return null;

      const parsed = safeJSONParse(el);
      if (!parsed) return null;

      const value = get(parsed, key, null);

      if (value) {
        const redirect = new RegExp(redirect_regexp);
        if (redirect.test(value)) {
          return urls.redirect.replace('<key>', value);
        } else {
          return urls.default + value;
        }
      }

      return null;
    } catch (error) {
      console.error('error:', error);
      return null;
    }
  }
}
export class AttributeDetailExtractor implements ExtractProductDetail {
  async extractDetail(element: ElementHandle, detail: IAttributeDetail) {
    const { baseUrl, sel, type, regexp } = detail;
    const el = await attrFromEleInEleHandle(element, sel, type);
    if (el) {
      let foundAttr = el;
      if (type === 'href' || type === 'src' || type === 'srcset') {
        if (regexp && detail.baseUrl) {
          const regex = new RegExp(regexp);
          if (regex.test(foundAttr)) {
            const match = foundAttr.match(regexp);
            if (match) {
              foundAttr = baseUrl + match[0].trim();
            }
          }
        }
        return foundAttr;
      } else {
        return foundAttr;
      }
    } else {
      return null;
    }
  }
}
export class NestedDetailExtractor implements ExtractProductDetail {
  async extractDetail(element: ElementHandle, detail: NestedNameDetail) {
    const name = await nestedProductName(element, detail);
    if (name) {
      return name;
    } else {
      return null;
    }
  }
}
export class ExistDetailExtractor implements ExtractProductDetail {
  async extractDetail(element: ElementHandle, detail: ExistDetail) {
    const { sel, type } = detail;
    const el = await element.$eval(sel, (i, type) => i, type).catch((e) => {});
    if (el) {
      return 'true';
    } else {
      return null;
    }
  }
}

export type ExctractorClasses =
  | TextDetailExtractor
  | TableExtractor
  | ListExtractor
  | ParseJSONDetailExtractor
  | AttributeDetailExtractor
  | NestedDetailExtractor
  | ExistDetailExtractor;
