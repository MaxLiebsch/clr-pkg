import { ShopObject, TargetShop } from '../types';
import { QueueTask } from '../types/QueueTask';
import { DbProduct, Product, ProductRecord } from '../types/product';
import { Query } from '../types/query';
import { ProdInfo, QueryQueue } from './QueryQueue';
import {
  addBestMatchToProduct,
  getPrice,
  segmentFoundProds,
} from './compare_helper';
import { queryShopClean } from './queryShopClean';
import { queryURLBuilder } from './queryURLBuilder';
import parsePrice from 'parse-price';

export interface IntermediateProdInfo {
  intermProcProd: DbProduct;
  targetShops: TargetShop[];
}

export interface TargetShopProducts {
  products?: Product[];
  procProd?: DbProduct;
  targetShop: TargetShop;
}

interface Candidate {
  nm: string;
  nmSegments: string[];
  prc: number;
  lnk: string;
}
export const queryTargetShops = async (
  targetShops: TargetShop[],
  queue: QueryQueue,
  shops: { [key: string]: ShopObject },
  query: Query,
  task: QueueTask,
  prodInfo: ProdInfo,
) =>
  targetShops.map(
    (targetShop) =>
      new Promise<TargetShopProducts>((res, rej) => {
        try {
          const { extendedLookUp, limit } = task;
          let { procProd } = prodInfo;
          const products: Product[] = [];
          const addProduct = async (product: ProductRecord) => {
            products.push(<Product>product);
          };
          const isFinished = async (interm?: IntermediateProdInfo) => {
            if (interm) {
              const { intermProcProd, targetShops: intermTargetShops } = interm;
              procProd = { ...procProd, ...intermProcProd };
              if (intermTargetShops.length) {
                task.extendedLookUp = false;
                const shopQueryPromises = queryTargetShops(
                  intermTargetShops,
                  queue,
                  shops,
                  query,
                  task,
                  prodInfo,
                );
                const targetShopProds = (await Promise.all(
                  await shopQueryPromises,
                )) as TargetShopProducts[];
                const { procProd: arbitragePerMatchedTargetShopProduct } =
                  matchTargetShopProdsWithRawProd(targetShopProds, prodInfo);
                procProd = {
                  ...procProd,
                  ...arbitragePerMatchedTargetShopProduct,
                };
                res({ targetShop, procProd });
              } else {
                res({ targetShop, procProd });
              }
            } else {
              res({ products, targetShop });
            }
          };
  
          const shop = shops[targetShop.d];
  
          queue.pushTask(queryShopClean, {
            retries: 0,
            shop,
            addProduct,
            targetShop,
            queue,
            query,
            prio: 0,
            extendedLookUp,
            limit,
            prodInfo,
            isFinished,
            pageInfo: {
              link: shop.queryUrlSchema.length
                ? queryURLBuilder(shop.queryUrlSchema, query).url
                : shop.entryPoints[0].url,
              name: shop.d,
            },
          });
          
        } catch (error) {
          console.log('error:', error)
          
        }
      }),
  );

const reduceTargetShopCandidates = (products: Product[]) => {
  const foundProds = segmentFoundProds(products.filter((p) => p.price !== ''));

  const candidatesToSave = foundProds.map((candidate) => {
    const { nameSegments: nmSegments, link: lnk, name: nm } = candidate;
    return {
      nm,
      lnk,
      nmSegments,
      prc: parsePrice(getPrice(candidate.price)),
    };
  });
  return { foundProds, candidatesToSave };
};

export const matchTargetShopProdsWithRawProd = (
  targetShopProducts: TargetShopProducts[],
  prodInfo: ProdInfo,
) => {
  let { procProd } = prodInfo;
  const candidates: { [key: string]: Candidate[] } = {};

  targetShopProducts.forEach(({ products, targetShop }) => {
    if (products && products.length) {
      const { foundProds, candidatesToSave } =
        reduceTargetShopCandidates(products);
      
      candidates[targetShop.d] = candidatesToSave;
      const { arbitrage, bestMatch } = addBestMatchToProduct(
        foundProds,
        targetShop,
        prodInfo,
      );
      procProd = { ...procProd, ...arbitrage.arbitrage };
    }
  });
  return { procProd, candidates };
};
