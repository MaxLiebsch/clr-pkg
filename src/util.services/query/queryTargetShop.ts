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
