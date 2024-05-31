import { Page } from 'puppeteer1';
import { browseProductpages } from '../../util/crawl/browseProductPages';
import { submitQuery } from './submitQuery';
import { Product, ProductRecord } from '../../types/product';
import { closePage } from '../../util/browser/closePage';
import {
  addBestMatchToProduct,
  calculateArbitrage,
} from '../../util/matching/compare_helper';
import { crawlProducts } from '../../util/crawl/crawlProducts';
import { runActions } from '../../util/query/runActions';
import { TargetShop } from '../../types';
import { QueryRequest } from '../../types/query-request';
import {
  ProductOriginPath,
  reduceTargetShopCandidates,
} from '../../util/query/matchTargetShopProdsWithRawProd';

export const standardTargetRetailerList = [
  { d: 'amazon.de', prefix: 'a_', name: 'amazon' },
  { d: 'ebay.de', prefix: 'e_', name: 'ebay' },
];

export const queryShopQueue = async (page: Page, request: QueryRequest) => {
  const {
    shop,
    query,
    pageInfo,
    addProduct,
    isFinished,
    limit,
    prodInfo,
    extendedLookUp,
    targetShop,
    targetRetailerList,
  } = request;
  const { queryActions, waitUntil } = shop;

  const products: ProductRecord[] = [];
  const addProductCb = async (product: ProductRecord) => {
    products.push(product);
  };

  await submitQuery(page, queryActions, waitUntil, query);

  const res = await browseProductpages(
    page,
    shop,
    extendedLookUp ? addProductCb : addProduct,
    pageInfo,
    limit,
    query,
  );

  if (res === 'crawled' && !page.isClosed()) {
    if (extendedLookUp && prodInfo && targetShop) {
      const currentTargetRetailerList =
        targetRetailerList || standardTargetRetailerList;

      // These are the products that we found on I D E A L O
      const { foundProds, candidatesToSave: candidates } =
        reduceTargetShopCandidates(products as Product[]);

      let { procProd, rawProd } = prodInfo;

      const { arbitrage, bestMatch } = addBestMatchToProduct(
        foundProds,
        targetShop,
        prodInfo,
      );
      // No match found on I D E A L O => we need to search on the A M A Z O N and E B A Y
      if (!bestMatch) {
        isFinished &&
          isFinished({
            path: 'no_bm_search_all',
            candidates,
            missingShops: currentTargetRetailerList,
            intermProcProd: procProd,
          });
        await closePage(page);
      } else {
        // Best match on I D E A L O
        if (bestMatch.vendor) {
          const vendor = bestMatch.vendor.toLowerCase().trim();
          const isEbay = vendor.includes('ebay');
          const isAmazon = vendor.includes('amazon');
          const isSelfVendor = vendor.includes(
            (rawProd.shop as string).split('.')[0],
          );
          // best match vendor is the same as the raw product
          //Verkauft durch ... e.g. r e i c h e l t . . .
          // => we need check if we need to search on the A M A Z O N and E B A Y
          if (isSelfVendor) {
            await closePage(page);
            isFinished &&
              isFinished({
                path: 'bm_v_self_vendor_search_all',
                candidates,
                missingShops: currentTargetRetailerList,
                intermProcProd: procProd,
              });
          }
          // best match vendor is neither ebay nor amazon
          if (!isEbay && !isAmazon) {
            await closePage(page);
            isFinished &&
              isFinished({
                path: 'bm_v_catch_all_search_all',
                candidates,
                missingShops: currentTargetRetailerList,
                intermProcProd: procProd,
              });
          }
          // best match vendor is ebay or amazon
          if (isEbay || isAmazon) {
            const path = isEbay ? 'bm_v_m_amazon' : 'bm_v_m_ebay';
            const targetShopIndex = currentTargetRetailerList.findIndex(
              (shop) => {
                return vendor.includes(shop.name);
              },
            );
            const missingShops = [
              currentTargetRetailerList[targetShopIndex === 0 ? 1 : 0],
            ];

            if (targetShopIndex !== -1) {
              // we found A M A Z O N or E B A Y in I D E A L O best match
              const foundShop = currentTargetRetailerList[targetShopIndex];

              const arbitrage = calculateArbitrage(
                procProd.prc,
                bestMatch,
                foundShop,
              );
              procProd = { ...procProd, ...arbitrage };

              await closePage(page);

              isFinished &&
                isFinished({
                  path,
                  candidates,
                  missingShops,
                  intermProcProd: procProd,
                });
            }
          }
        } else {
          //Happy path We found a match on I D E A L O but no vendor
          const foundShops: ProductRecord[] = [];
          const addProductCb = async (product: ProductRecord) => {
            foundShops.push(product);
          };
          await page
            .goto(bestMatch.link, {
              waitUntil: waitUntil ? waitUntil.product : 'load',
            })
            .catch((e) => {
              console.log(e);
            });
          await runActions(page, shop);

          await crawlProducts(page, shop, addProductCb, pageInfo);

          await closePage(page);

          let missingShops: TargetShop[] = currentTargetRetailerList;

          foundShops.forEach((shop) => {
            const vendor = (shop.vendor as string).toLowerCase().trim();
            if (!vendor) return;

            const targetShopIndex = currentTargetRetailerList.findIndex(
              (targetShop) => (vendor as string).includes(targetShop.name),
            );
            if (targetShopIndex !== -1) {
              const foundShop = currentTargetRetailerList[targetShopIndex];
              const arbitrage = calculateArbitrage(
                procProd.prc,
                {
                  ...shop,
                  image: rawProd.image,
                  shop: foundShop.d,
                  name: shop.name,
                } as Product,
                foundShop,
              );
              missingShops = missingShops.filter(
                (shop) => shop.d !== foundShop.d,
              );
              procProd = { ...procProd, ...arbitrage };
            }
          });

          let path: ProductOriginPath;

          switch (missingShops.length) {
            case 1:
              path =
                missingShops[0].name === 'ebay' ? 'hp_m_ebay' : 'hp_m_amazon';
              break;
            case 2:
              path = 'hp_search_all';
              break;
            default:
              path = 'hp_found_all';
              break;
          }

          isFinished &&
            isFinished({
              path,
              candidates,
              missingShops,
              intermProcProd: procProd,
            });
        }
      }
    } else {
      isFinished && isFinished();
      await closePage(page);
    }
  }
};
