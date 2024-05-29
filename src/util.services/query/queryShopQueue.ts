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
import { reduceTargetShopCandidates } from '../../util/query/matchTargetShopProdsWithRawProd';

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
      const currentTargetRetailerList = targetRetailerList || standardTargetRetailerList;

      const { foundProds, candidatesToSave: candidates } =
      reduceTargetShopCandidates(products as Product[]);
  
      let { procProd, rawProd } = prodInfo;

      const { arbitrage, bestMatch } = addBestMatchToProduct(
        foundProds,
        targetShop,
        prodInfo,
      );
      if (bestMatch) {
        if (bestMatch.vendor) {
          //direct vertrieb
          const vendor = bestMatch.vendor.toLowerCase();
          const targetShopIndex = currentTargetRetailerList.findIndex((shop) =>
            vendor.includes(shop.name),
          );
          if (targetShopIndex !== -1) {
            // search in either amazon and ebay

            const arbitrage = calculateArbitrage(
              procProd.prc,
              bestMatch,
              currentTargetRetailerList[targetShopIndex],
            );
            procProd = { ...procProd, ...arbitrage };

            await closePage(page);

            isFinished &&
              isFinished({
                candidates,
                targetShops: [
                  currentTargetRetailerList[targetShopIndex === 0 ? 1 : 0],
                ],
                intermProcProd: procProd,
              });
          } else if (vendor.includes((rawProd.shop as string).split('.')[0])) {
            // search in amazon and ebay
            await closePage(page);
            isFinished &&
              isFinished({
                candidates,
                targetShops: currentTargetRetailerList,
                intermProcProd: procProd,
              });
          } else {
            await closePage(page);
            isFinished &&
              isFinished({
                candidates,
                targetShops: currentTargetRetailerList,
                intermProcProd: procProd,
              });
          }
        } else {
          //goto page
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

          await crawlProducts(page, shop,  addProductCb, pageInfo);

          await closePage(page);

          let missingShops: TargetShop[] = currentTargetRetailerList;
          foundShops.forEach((shop) => {
            const vendor = (shop.vendor as string).toLowerCase();
            if (vendor) {
              const targetShopIndex = currentTargetRetailerList.findIndex(
                (targetShop) => (vendor as string).includes(targetShop.name),
              );
              if (targetShopIndex !== -1) {
                const arbitrage = calculateArbitrage(
                  procProd.prc,
                  {
                    ...shop,
                    image: rawProd.image,
                    shop: currentTargetRetailerList[targetShopIndex].d,
                    name: shop.name,
                  } as Product,
                  currentTargetRetailerList[targetShopIndex],
                );
                missingShops = missingShops.filter(
                  (shop) => shop.d !== currentTargetRetailerList[targetShopIndex].d,
                );
                procProd = { ...procProd, ...arbitrage };
              }
            }
          });

          isFinished &&
            isFinished({
              candidates,
              targetShops: missingShops,
              intermProcProd: procProd,
            });
        }
      } else {
        isFinished &&
          isFinished({
            candidates,
            targetShops: currentTargetRetailerList,
            intermProcProd: procProd,
          });
        await closePage(page);
      }
    } else {
      isFinished && isFinished();
      await closePage(page);
    }
  }
};
