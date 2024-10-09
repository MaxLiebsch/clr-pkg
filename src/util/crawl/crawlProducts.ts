import { Page } from 'puppeteer1';
import {
  cleanUpHTML,
  extractPart,
  myQuerySelectorAll,
  nestedProductName,
  removeNestedElementAndReturnText,
  replaceAllHiddenCharacters,
  waitForSelector,
} from '../helpers';
import { ProductRecord } from '../../types/product';
import { ICategory } from './getCategories';
import { prefixLink } from '../matching/compare_helper';
import { removeRandomKeywordInURL } from '../sanitize';

import { extractTextFromElementHandle } from '../extract/extractTextFromHandle';
import {
  attrFromEleInEleHandle,
  extractAttributeElementHandle,
} from '../extract/extractAttributeFromHandle';
import { get } from 'lodash';
import { safeJSONParse } from '../extract/saveParseJSON';
import { detectCurrency, safeParsePrice } from '../safeParsePrice';
import { Shop } from '../../types/shop';

export const crawlProducts = async (
  page: Page,
  shop: Shop,
  addProductCb: (product: ProductRecord) => Promise<void>,
  pageInfo: ICategory,
) => {
  const { pauseOnProductPage } = shop;
  if (pauseOnProductPage && pauseOnProductPage.pause) {
    const { min, max } = pauseOnProductPage;
    let pause = Math.floor(Math.random() * max) + min;
    await new Promise((r) => setTimeout(r, pause));
  }

  const { productList } = shop;
  for (let index = 0; index < productList.length; index++) {
    const { sel, product, timeout } = productList[index];
    const selector = await waitForSelector(page, sel, timeout ?? 5000, false);
    if (!selector) continue;

    const productEls = await myQuerySelectorAll(page, product.sel);
    if (!productEls) continue;

    const { type, details } = product;
    for (let i = 0; i < productEls.length; i++) {
      const productEl = productEls[i];
      const category: string[] = [];
      if (pageInfo.entryCategory) {
        category.push(pageInfo.entryCategory);
      }
      if (pageInfo.name) {
        category.push(pageInfo.name);
      }

      let proprietaryProducts: null | string = null;
      const product: ProductRecord = {
        link: '',
        image: '',
        category,
        name: '',
        vendor: '',
        mnfctr: '',
        hasMnfctr: false,
        price: 0,
        promoPrice: 0,
        description: '',
        nameSub: '',
      };

      if (type === 'link') {
        const href = await productEl
          .evaluate((el) => el.getAttribute('href'))
          .catch((e) => {});
        if (href) {
          if (href?.startsWith('https://')) {
            product.link = href;
          } else {
            product.link = 'https://' + shop.d + href;
          }
        }
      }

      for (const index in details) {
        const detail = details[index];

        if (detail?.proprietaryProducts)
          proprietaryProducts = detail.proprietaryProducts;

        const { sel, type, content } = detail;

        if (type === 'text') {
          const el = await extractTextFromElementHandle(productEl, sel);
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
            product[content] = cleanUpHTML(foundEl);
          }
        } else if (type === 'nested') {
          const name = await nestedProductName(productEl, detail);
          if (name) {
            product[content] = name;
          }
        } else if (type === 'nested_remove') {
          const name = await removeNestedElementAndReturnText(
            productEl,
            detail,
          );
          if (name) {
            product[content] = name;
          }
        } else if (type === 'exist') {
          const el = await productEl
            .$eval(sel, (i, type) => i, type)
            .catch((e) => {});
          if (el) {
            product[content] = true;
          } else {
            product[content] = false;
          }
        } else if (
          type === 'parse_json' &&
          'key' in detail &&
          'attr' in detail &&
          'urls' in detail &&
          'redirect_regex' in detail
        ) {
          const { key, attr, urls, redirect_regex } = detail;
          const el = await attrFromEleInEleHandle(productEl, sel, attr!);
          if (el) {
            const parsed = safeJSONParse(el);
            if (parsed) {
              const value = parsed[key!];
              if (value) {
                const redirect = new RegExp(redirect_regex!);
                if (redirect.test(value)) {
                  product[content] = urls.redirect.replace('<key>', value);
                } else {
                  product[content] = urls.default + value;
                }
              }
            }
          }
        } else if (
          type === 'parse_object_property' &&
          'key' in detail &&
          'attr' in detail
        ) {
          const { key, attr } = detail;
          const el = await extractAttributeElementHandle(productEl, attr!);
          if (el) {
            const parsed = safeJSONParse(el);
            if (parsed) {
              const value = get(parsed, key!, '');
              if (value) {
                product[content] = value;
              }
            }
          }
        } else {
          const el = await attrFromEleInEleHandle(productEl, sel, type);
          if (el) {
            let foundAttr = el;
            if (type === 'href' || type === 'src' || type === 'srcset') {
              if ('regexp' in detail && 'baseUrl' in detail) {
                const regexp = new RegExp(detail.regexp!);
                if (regexp.test(foundAttr)) {
                  const match = foundAttr.match(regexp);
                  if (match) {
                    foundAttr = detail.baseUrl + match[0].trim();
                  }
                }
              }
              product[content] = prefixLink(foundAttr, shop.d);
            } else {
              product[content] = foundAttr;
            }
          }
        }
      }
      if (product.name) {
        product.name = replaceAllHiddenCharacters(product.name as string);
      }

      if (product.price && product.price !== 0) {
        const currency = detectCurrency(product.price as string);
        if (currency) {
          product['cur'] = currency;
        }
        product.price = safeParsePrice(product.price);
        if (product.price === 0) {
          const detail = details.find((d) => d.content === 'price');
          if (detail && detail.fallback) {
            const el = await extractTextFromElementHandle(
              productEl,
              detail.fallback,
            );
            if (el) {
              const currency = detectCurrency(el);
              if (currency) {
                product['cur'] = currency;
              }
              product.price = safeParsePrice(el);
            }
          }
        }
      }

      if (product.promoPrice && product.promoPrice !== 0) {
        const currency = detectCurrency(product.promoPrice as string);
        if (currency) {
          product['cur'] = currency;
        }
        product.promoPrice = safeParsePrice(product.promoPrice);
      }
      // Remove random keywords from the URL
      if (shop?.ece && shop.ece.length) {
        product.link = removeRandomKeywordInURL(
          product.link as string,
          shop.ece,
        );
      }
      // Parse ean from link
      if (shop.ean) {
        const ean = (product.link as string).match(new RegExp(shop.ean, 'g'));
        if (ean) {
          const cleanEan = ean[0].replaceAll(/\D/g, '');
          product['ean'] = cleanEan;
          product['eanList'] = [cleanEan];
        }
      }
      // Add proprietary products to the name
      if (proprietaryProducts) {
        product.name = proprietaryProducts + ' ' + product.name;
      }
      // If the product has a manufacturer, set the hasMnfctr flag to true
      if (product.mnfctr) {
        product.hasMnfctr = true;
      }

      await addProductCb(product);
    }
  }
};
