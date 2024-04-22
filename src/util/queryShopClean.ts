import { Page } from 'puppeteer';
import { browseProductpages } from './browseProductPages';
import { submitQuery } from './submitQuery';
import { QueryRequest } from './QueryQueue';
import { Product, ProductRecord } from '../types/product';
import { closePage } from './closePage';
import {
  addBestMatchToProduct,
  calculateArbitrage,
  segmentFoundProds,
} from './compare_helper';
import { crawlProducts } from './crawlProducts';
import { runActions } from './runActions';
import { TargetShop } from '../types';

export const targetRetailerList = [
  { d: 'amazon.de', prefix: 'a_', name: 'amazon' },
  { d: 'ebay.de', prefix: 'e_', name: 'ebay' },
];

export const queryShopClean = async (page: Page, request: QueryRequest) => {
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
    undefined,
    query,
  );

  if (res === 'crawled' && !page.isClosed()) {
    if (extendedLookUp && prodInfo && targetShop) {
      const candidates = segmentFoundProds(
        (products as Product[]).filter((p) => p.price !== ''),
      );
      let { procProd, rawProd } = prodInfo;

      const { arbitrage, bestMatch } = addBestMatchToProduct(
        candidates,
        targetShop,
        prodInfo, //TODO use mnfctr.name for namesplit
      );
      if (bestMatch) {
        if (bestMatch.vendor) {
          //direct vertrieb
          const vendor = bestMatch.vendor.toLowerCase();
          const targetShopIndex = targetRetailerList.findIndex((shop) =>
            vendor.includes(shop.name),
          );
          if (targetShopIndex !== -1) {
            // search in either amazon and ebay
            // console.log(
            //   'found in amazon or ebay, search in missing',
            //   targetRetailerList[targetShopIndex === 0 ? 1 : 0],
            // );
            const arbitrage = calculateArbitrage(
              procProd.prc,
              bestMatch,
              targetRetailerList[targetShopIndex],
            );
            procProd = { ...procProd, ...arbitrage };
            
            await closePage(page);
            
            isFinished &&
              isFinished({
                targetShops: [
                  targetRetailerList[targetShopIndex === 0 ? 1 : 0],
                ],
                intermProcProd: procProd,
              });
          } else if (vendor.includes((rawProd.shop as string).split('.')[0])) {
            // search in amazon and ebay
            // console.log('found vendor, search in amazon and ebay');
            await closePage(page);
            isFinished &&
              isFinished({
                targetShops: targetRetailerList,
                intermProcProd: procProd,
              });
          } else {
            await closePage(page);
            isFinished &&
              isFinished({
                targetShops: targetRetailerList,
                intermProcProd: procProd,
              });
            // console.log('Nor targetshops [amazon, ebay], nor idealo');
          }
        } else {
          //goto page
          const foundShops: ProductRecord[] = [];
          const addProductCb = async (product: ProductRecord) => {
            foundShops.push(product);
          };
          const res = await Promise.all([
            page
              .goto(bestMatch.link, {
                waitUntil: waitUntil ? waitUntil.product : 'load',
              })
              .catch((e) => {
                console.log(e);
              }),
            runActions(page, shop),
          ]);
          if (res) {
            await crawlProducts(
              page,
              shop,
              1,
              addProductCb,
              pageInfo,
              undefined,
            );
          }
          await closePage(page);

          let missingShops: TargetShop[] = targetRetailerList;
          foundShops.forEach((shop) => {
            const vendor = (shop.vendor as string).toLowerCase();
            if (vendor) {
              const targetShopIndex = targetRetailerList.findIndex(
                (targetShop) => (vendor as string).includes(targetShop.name),
              );
              if (targetShopIndex !== -1) {
                const arbitrage = calculateArbitrage(
                  procProd.prc,
                  {
                    ...shop,
                    image: rawProd.image,
                    shop: targetRetailerList[targetShopIndex].d,
                    name: rawProd.name,
                  } as Product,
                  targetRetailerList[targetShopIndex],
                );
                missingShops = missingShops.filter(
                  (shop) => shop.d !== targetRetailerList[targetShopIndex].d,
                );
                procProd = { ...procProd, ...arbitrage };
              }
            }
          });

          isFinished &&
            isFinished({
              targetShops: missingShops,
              intermProcProd: procProd,
            });
          console.log('goto page product page and get shops');
        }
      } else {
        isFinished &&
          isFinished({
            targetShops: targetRetailerList,
            intermProcProd: procProd,
          });
        await closePage(page);
        console.log('No best match found');
      }
    } else {
      await closePage(page);
    }
  }
  isFinished && !extendedLookUp && isFinished();
};
