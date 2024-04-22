import { Page, TimeoutError } from 'puppeteer';
import { ShopObject } from '../types';
import {
  cleanUpHTML,
  extractPart,
  nestedProductName,
  slug,
  waitForSelector,
} from './helpers';
import { ProductRecord } from '../types/product';
import { ICategory } from './getCategories';
import { ProductPage, StatService } from './fs/stats';
import { prefixLink } from './compare_helper';
import { removeRandomKeywordInURL } from './sanitize';

export const crawlProducts = async (
  page: Page,
  shop: ShopObject,
  pageNo: number,
  addProductCb: (product: ProductRecord) => Promise<void>,
  pageInfo: ICategory,
  productPagePath?: string,
) => {
  let productPage: ProductPage = {
    offset: 0,
    link: '',
    cnt: 0,
  };
  const statService = StatService.getSingleton(shop.d);
  let path = `${productPagePath}.productpages.[${pageNo - 1}]`;

  if (productPagePath) {
    productPage = statService.get(path);
  }

  if (shop?.pauseOnProductPage && shop.pauseOnProductPage.pause) {
    const { min, max } = shop.pauseOnProductPage;
    let pause = Math.floor(Math.random() * max) + min;
    await new Promise((r) => setTimeout(r, pause));
  }
  const scanShop = productPagePath !== undefined;

  const { productList } = shop;
  for (let index = 0; index < productList.length; index++) {
    const { sel, product, timeout } = productList[index];
    const selector = await waitForSelector(page, sel, timeout?? 5000, false);

    if (selector !== 'missing' && selector) {
      const productEls = await page.$$(product.sel).catch((e) => {
        if (e instanceof TimeoutError) {
          return 'missing';
        }
      });
      if (productEls !== 'missing' && productEls) {
        if (scanShop) {
          delete productPage.missing;
          productPage['offset'] = (pageNo - 1) * productEls.length;
        }
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

          const product: ProductRecord = {
            link: '',
            image: '',
            shop: shop.d,
            category,
            name: '',
            van: '',
            vendor: '',
            price: '',
            promoPrice: '',
            createdAt: '',
            year: '',
            updatedAt: '',
            prime: false,
            description: '',
            nameSub: '',
            redirect_link: '',
            vendorLink: '',
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
          let proprietaryProducts: null | string = null;

          for (const index in details) {
            const detail = details[index];

            if (detail?.proprietaryProducts)
              proprietaryProducts = detail.proprietaryProducts;

            const { sel, type, content } = detail;
            if (type === 'text') {
              const el = await productEl
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
                product[content] = cleanUpHTML(foundEl);
              }
            } else if (type === 'nested') {
              const name = await nestedProductName(productEl, detail);
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
              try {
                const el = await productEl
                  .$eval(sel, (i, attr) => i.getAttribute(attr!), attr)
                  .catch((e) => {});
                if (el) {
                  const parsed = JSON.parse(el);
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
              } catch (error) {
                console.error('error:', error);
              }
            } else {
              const el = await productEl
                .$eval(sel, (i, type) => i.getAttribute(type), type)
                .catch((e) => {});
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
          product['createdAt'] = new Date().toISOString();
          product['updatedAt'] = new Date().toISOString();

          if (shop?.ece && shop.ece.length) {
            product.link = removeRandomKeywordInURL(
              product.link as string,
              shop.ece,
            );
          }
          if (proprietaryProducts) {
            product.name = proprietaryProducts + ' ' + product.name;
          }
          await addProductCb(product);
        }
      }
      break;
    }
  }
  scanShop && statService.set(path, productPage);
};
