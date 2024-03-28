import { Page, TimeoutError } from 'puppeteer';
import { ShopObject } from '../types';
import {
  cleanUpHTML,
  nestedProductName,
  slug,
  waitForSelector,
} from './helpers';
import { ProductRecord } from '../types/product';
import { ICategory } from './getCategories';
import { ProductPage, StatService } from './fs/stats';
import { join } from 'path';

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

  const scanShop = productPagePath !== undefined;

  const { productList } = shop;
  for (let index = 0; index < productList.length; index++) {
    const { sel, product } = productList[index];

    const selector = await waitForSelector(page, sel, 10000, false);

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
          const product: ProductRecord = {
            link: '',
            image: '',
            shop: shop.d,
            category: pageInfo.name === '' ? '' : pageInfo.name,
            name: '',
            price: '',
            createdAt: '',
            year: '',
            updatedAt: '',
            prime: false,
            description: '',
            nameSub: '',
            redirect_link: '',
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
                .catch(e=>{});
              if (el) {
                product[content] = cleanUpHTML(el);
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
                      product[content] = urls.redirect + value;
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
              if (type === 'href' || type === 'src') {
                if (el)
                  if (el.startsWith('https://')) {
                    product[content] = el;
                  } else {
                    product[content] = 'https://' + shop.d + el;
                  }
              }
            }
          }
          product['createdAt'] = new Date().toISOString();
          product['updatedAt'] = new Date().toISOString();
          await addProductCb(product);
        }
      } else {
        if (process.env.DEBUG) {
          await page
            .screenshot({
              type: 'png',
              path: join(
                process.cwd(),
                `/data/shop/debug/${shop.d}_products_missing.${slug(pageInfo.link)}.png`,
              ),
              fullPage: true,
            })
            .then()
            .catch((e) => {});
        }
        if (scanShop) {
          productPage['missing'] = 'Products in ' + ' ' + product.sel;
        }
      }
    } else {
      if (process.env.DEBUG) {
        await page
          .screenshot({
            type: 'png',
            path: join(
              process.cwd(),
              `/data/shop/debug/${shop.d}_container_missing.${slug(pageInfo.link)}.png`,
            ),
            fullPage: true,
          })
          .catch((e) => {});
      }
      if (scanShop) {
        productPage['missing'] = 'ProductContainer in ' + ' ' + sel;
      }
    }
  }
  scanShop && statService.set(path, productPage);
};
