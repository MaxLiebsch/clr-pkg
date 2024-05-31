import { ShopObject, TargetShop } from '../../types';
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
      new Promise<TargetShopProducts>((resolve, rej) => {
        try {
          const { extendedLookUp, limit } = task;
          let { procProd } = prodInfo;
          const products: Product[] = [];
          const addProduct = async (product: ProductRecord) => {
            products.push(<Product>product);
          };
          const isFinished = async (interm?: IntermediateProdInfo) => {
            if (!interm) return resolve({ products, targetShop, path: 'wtf' });

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
              task.extendedLookUp = false;

              const shopQueryPromises = queryTargetShops(
                missingShops,
                queue,
                shops,
                query,
                task,
                prodInfo,
              );

              const targetShopProducts = (await Promise.all(
                await shopQueryPromises,
              )) as TargetShopProducts[];

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
              // WE FOUND A M A Z O N AND E B A Y IN I D E A L O
              resolve({
                targetShop,
                procProd: { ...procProd, a_orgn: 'i', e_orgn: 'i' },
                candidates,
                path,
              });
            }
          };

          const shop = shops[targetShop.d];

          queue.pushTask(queryShopQueue, {
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
          console.log('error:', error);
        }
      }),
  );
