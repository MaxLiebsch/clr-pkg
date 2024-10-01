import { TargetShop } from '../../types';
import { QueueTask } from '../../types/QueueTask';
import { Product, ProductRecord } from '../../types/product';
import { Query } from '../../types/query';
import { ProdInfo, QueryQueue } from '../../util.services/queue/QueryQueue';
import { queryShopQueue } from './queryShopQueue';
import { queryURLBuilder } from '../../util/queryURLBuilder';
import {
  IntermediateProdInfo,
  TargetShopProducts,
  matchTargetShopProdsWithRawProd,
} from '../../util/query/matchTargetShopProdsWithRawProd';
import { Shop } from '../../types/shop';
import { uuid } from '../../util/uuid';
import { NotFoundCause } from '../../types/query-request';
import { RETRY_LIMIT_MATCH_PRODUCTS } from '../../constants';

export const queryTargetShops = async (
  targetShops: TargetShop[],
  queue: QueryQueue,
  shops: { [key: string]: Shop },
  query: Query,
  task: QueueTask,
  prodInfo: ProdInfo,
  srcShop: Shop,
  log?: any,
) => {
  const promises = targetShops.map(
    (targetShop) =>
      new Promise<TargetShopProducts>((resolve, rej) => {
        try {
          const { extendedLookUp, limit } = task;
          let { procProd, rawProd } = prodInfo;
          const { s_hash } = rawProd;
          const products: Product[] = [];
          const addProduct = async (product: ProductRecord) => {
            products.push(<Product>product);
          };
          const isFinished = async (interm?: IntermediateProdInfo) => {
            if (!interm) {
              log && log(`No Itermediate found ${s_hash} in ${targetShop.d}`);
              return resolve({ products, targetShop, path: 'wtf' });
            }

            const { intermProcProd, missingShops, candidates, path } = interm;

            procProd = {
              ...procProd,
              ...intermProcProd,
            };
            const missing =
              path === 'bm_v_catch_all_search_all' ||
              path === 'bm_v_self_vendor_search_all' ||
              path === 'no_bm_search_all' ||
              path === 'hp_search_all';

            if ((path.includes('amazon') || missing) && procProd.a_lnk) {
              procProd.a_orgn = path;
            }

            if ((path.includes('ebay') || missing) && procProd.e_lnk) {
              procProd.e_orgn = path;
            }

            if (missingShops.length) {
              // WE DID NOT FIND ALL IN I D E A L O
              log &&
                log(
                  `Missing shops ${missingShops.map((s) => s.d).join(', ')} - ${s_hash}`,
                );
              const shopQueryPromises = await queryTargetShops(
                missingShops,
                queue,
                shops,
                query,
                { ...task, extendedLookUp: false },
                prodInfo,
                srcShop,
                log,
              );

              const targetShopProducts = await Promise.all(shopQueryPromises);

              // CALCULATE ARBIBTRAGE FOR THE REMAINING SHOP(S)
              const {
                procProd: arbitragePerMatchedTargetShopProduct,
                candidates,
              } = matchTargetShopProdsWithRawProd(targetShopProducts, prodInfo);

              procProd = {
                ...procProd,
                ...arbitragePerMatchedTargetShopProduct,
              };

              const missing =
                path === 'bm_v_catch_all_search_all' ||
                path === 'bm_v_self_vendor_search_all' ||
                path === 'no_bm_search_all' ||
                path === 'hp_search_all';

              if ((path.includes('amazon') || missing) && procProd.a_lnk) {
                procProd.a_orgn = path;
              }

              if ((path.includes('ebay') || missing) && procProd.e_lnk) {
                procProd.e_orgn = path;
              }

              resolve({ targetShop, procProd, candidates, path });
            } else {
              log(`Found all azn, eby for ${s_hash} in ${targetShop.d}`);
              // WE FOUND A M A Z O N AND E B A Y IN I D E A L O
              let origin: { [key: string]: any } = { a_orgn: 'i', e_orgn: 'i' };
              if (srcShop.hasEan || srcShop.ean) {
                origin = { e_orgn: 'i' };
              }
              resolve({
                targetShop,
                procProd: { ...procProd, ...origin },
                candidates,
                path,
              });
            }
          };

          const shop = shops[targetShop.d];
          const { entryPoints, queryUrlSchema, d } = shop;

          // this following turnery means if the source shop has Ean on their product page or is part of the url
          const targetRetailerList =
            srcShop.hasEan || srcShop.ean
              ? [{ d: 'ebay.de', prefix: 'e_', name: 'ebay' }]
              : undefined;

          queue.pushTask(queryShopQueue, {
            retries: 0,
            shop,
            log,
            requestId: uuid(),
            s_hash: s_hash as string,
            addProduct,
            retriesOnFail: RETRY_LIMIT_MATCH_PRODUCTS,
            targetShop,
            targetRetailerList,
            onNotFound: async (cause: NotFoundCause) => {
              log && log(`Not found ${s_hash} in ${d} because ${cause}`);
              await isFinished();
            },
            queue,
            query,
            prio: 0,
            extendedLookUp,
            limit,
            prodInfo,
            isFinished,
            pageInfo: {
              link: queryUrlSchema.length
                ? queryURLBuilder(shop.queryUrlSchema, query).url
                : entryPoints[0].url,
              name: d,
            },
          });
        } catch (error) {
          log(
            `Error in queryTargetShops ${error} - ${prodInfo.rawProd.s_hash}`,
          );
          resolve({ targetShop, path: 'wtf' });
          console.log('error:', error);
        }
      }),
  );
  return Promise.all(promises);
};
