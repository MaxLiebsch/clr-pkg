import { Page } from 'puppeteer1';
import {
  AttributeDetailExtractor,
  ExctractorClasses,
  ExistDetailExtractor,
  NestedDetailExtractor,
  ParseJSONDetailExtractor,
  TextDetailExtractor,
  ParseJSONFromElementExtractor,
  TableExtractor,
  ListExtractor,
} from './productDetail.services';
import { Details } from '../../types/productInfoDetails';
import { shadowRootSelector, waitForSelector } from '../helpers';

const sharedExtractorTypes = [
  'href',
  'src',
  'srcset',
  'data-flix-ean',
  'data-loadbee-gtin',
  'value',
  'content',
  'data-srcset',
  'value',
  'label',
  'data-src',
  'alt',
  'data-llsrc',
  'data-original',
];
export const detailExtractorRegistry = sharedExtractorTypes.reduce(
  (acc: { [key: string]: any }, type) => {
    acc[type] = AttributeDetailExtractor;
    return acc;
  },
  {
    list: ListExtractor,
    table: TableExtractor,
    text: TextDetailExtractor,
    parse_json_element: ParseJSONFromElementExtractor,
    parse_json: ParseJSONDetailExtractor,
    nested: NestedDetailExtractor,
    exist: ExistDetailExtractor,
  },
);

export class PageParser {
  public detailExtractors: { class: ExctractorClasses; detail: Details }[];
  public shopDomain: string;
  public category: string[];
  constructor(shopDomain: string, category: string[]) {
    this.shopDomain = shopDomain;
    this.category = category;
    this.detailExtractors = [];
  }
  registerDetailExtractor(
    detailType: keyof typeof detailExtractorRegistry,
    detail: Details,
  ) {
    const extractorClass = detailExtractorRegistry[detailType];
    if (extractorClass) {
      this.detailExtractors.push({ class: new extractorClass(), detail });
    } else {
      throw new Error(`No extractor found for detail: ${detailType}`);
    }
  }
  async parse(page: Page) {
    const details: { [key: string]: any } = {};
    for (const extractor of this.detailExtractors) {
      const { parent, sel, content, timeout } = extractor.detail;
      let elementHandle = null;
      if ('shadowRoot' in extractor.detail) {
        elementHandle = await shadowRootSelector(page, parent ?? sel);
      }
      elementHandle = await waitForSelector(
        page,
        parent ?? sel,
        timeout ?? 500,
        false,
      );
      if (elementHandle) {
        const result = await extractor.class.extractDetail(
          elementHandle,
          //@ts-ignore
          extractor.detail,
        );
        if (result) {
          details[extractor.detail.content] = result;
        }
      }
    }
    return details;
  }
}
