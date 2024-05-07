import { ElementHandle } from 'puppeteer';
import {
  Details,
  ExistDetail,
  IAttributeDetail,
  IParseJSONDetail,
  ITextDetail,
  NestedNameDetail,
} from '../../types/productInfoDetails';
import { cleanUpHTML, extractPart, nestedProductName } from '../helpers';

export abstract class ExtractProductDetail {
  constructor() {}
  abstract extractDetail(
    element: ElementHandle,
    detail: Details,
  ): Promise<string | null>;
}
export class TextDetailExtractor implements ExtractProductDetail {
  async extractDetail(element: ElementHandle, detail: ITextDetail) {
    const { sel, type, content } = detail;
    const el = await element
    .$eval(sel, (i) => {
      const innerText = (i as HTMLElement).innerText.trim();
      if (innerText !== '') {
        return innerText;
      } else {
        const innerHTML = (i as HTMLElement).innerHTML;
        return innerHTML;
      }
    })
    .catch((e) => {});
    if (el) {
      let foundEl = el;
      if (content === 'price') {
        foundEl = foundEl.replace(/\s/g, '');
      }
      if (content === 'image' && 'regexp' in detail) {
        foundEl = extractPart(
          foundEl,
          detail.regexp!,
          detail?.extractPart ?? 1,
        );
      }
      return cleanUpHTML(foundEl);
    } else {
      return null;
    }
  }
}
export class ParseJSONDetailExtractor implements ExtractProductDetail {
  async extractDetail(element: ElementHandle, detail: IParseJSONDetail) {
    const { key, attr, urls, redirect_regex, sel } = detail;
    try {
      const el = await element
        .$eval(sel, (i, attr) => i.getAttribute(attr!), attr)
        .catch((e) => {});

      if (el) {
        const parsed = JSON.parse(el);
        const value = parsed[key!];
        if (value) {
          const redirect = new RegExp(redirect_regex!);
          if (redirect.test(value)) {
            return urls.redirect.replace('<key>', value);
          } else {
            return urls.default + value;
          }
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
    const el = await element
    .$eval(sel, (i, type) => i.getAttribute(type), type)
    .catch((e) => {});
    if (el) {
      let foundAttr = el;
      if (type === 'href' || type === 'src' || type === 'srcset') {
        if ('regexp' in detail && 'baseUrl' in detail) {
          const regex = new RegExp(regexp!);
          if (regex.test(foundAttr)) {
            const match = foundAttr.match(regexp!);
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
  | ParseJSONDetailExtractor
  | AttributeDetailExtractor
  | NestedDetailExtractor
  | ExistDetailExtractor;
