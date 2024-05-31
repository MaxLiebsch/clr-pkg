import {  Page } from 'puppeteer1';
import {
  AttributeDetailExtractor,
  ExctractorClasses,
  ExistDetailExtractor,
  NestedDetailExtractor,
  ParseJSONDetailExtractor,
  TextDetailExtractor,
} from './productDetail.services';
import { Details } from '../../types/productInfoDetails';
import { waitForSelector } from '../helpers';

const detailExtractorRegistry = {
  text: TextDetailExtractor,
  href: AttributeDetailExtractor,
  src: AttributeDetailExtractor,
  srcset: AttributeDetailExtractor,
  parse_json: ParseJSONDetailExtractor,
  nested: NestedDetailExtractor,
  exist: ExistDetailExtractor,
};

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
      const elementHandle = await waitForSelector(
        page,
        extractor.detail.parent ?? extractor.detail.sel,
        300,
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
