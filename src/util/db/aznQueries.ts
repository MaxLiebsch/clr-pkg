 
import { DbProductRecord } from '../../types/product.js';
import { keepaProperties } from '../../constants/index.js';
import { aznCategoryMapping } from '../../static/azn.js';

export const aznUnsetProperties: { [key in keyof DbProductRecord]?: string } = {
  a_pblsh: '',
  a_nm: '',
  a_lnk: '',
  a_img: '',
  asin: '',
  a_cur: '',
  a_prc: '',
  bsr: '',
  costs: '',
  a_uprc: '',
  a_qty: '',
  a_orgn: '',
  a_hash: '',
  tax: '',
  a_mrgn: '',
  a_mrgn_pct: '',
  a_w_mrgn: '',
  a_w_mrgn_pct: '',
  a_p_w_mrgn: '',
  a_p_w_mrgn_pct: '',
  a_p_mrgn: '',
  a_p_mrgn_pct: '',
  a_vrfd: '',
  // lookup info
  info_taskId: '',
  // keepa properties
  keepaEanUpdatedAt: '',
  keepaEan_lckd: '',
  keepaUpdatedAt: '',
  keepa_lckd: '',
  // scrape listing
  aznUpdatedAt: '',
  azn_taskId: '',
  // dealazn properties
  dealAznUpdatedAt: '',
  dealAznTaskId: '',
};

export type Query = {
  $unset: { [key: string]: string };
  $set?: { [key: string]: any };
};

export const resetAznProductQuery = (props = { info_prop: '' }) => {
  const { info_prop } = props;
  const query: Query = {
    $unset: { ...aznUnsetProperties },
  };

  keepaProperties.forEach((prop) => {
    query.$unset[prop.name] = '';
  });

  if (info_prop) {
    if (!query['$set']) {
      query['$set'] = {};
    }
    query['$set']['info_prop'] = info_prop;
    query['$set']['infoUpdatedAt'] = new Date().toISOString();
  } else {
    query['$unset']['info_prop'] = '';
    query['$unset']['infoUpdatedAt'] = '';
  }

  return query;
};

export const totalPositivAmazon = {
  $and: [
    { a_pblsh: true },
    { a_prc: { $gt: 0 } },
    { a_uprc: { $gt: 0 } },
    { a_mrgn: { $gt: 0 } },
    { a_mrgn_pct: { $gt: 0 } },
  ],
};

export const countProductsPerCategoryAzn = (domain: string) => [
  {
    $match: {
      sdmn: domain,
    },
  },
  {
    $unwind: '$categoryTree', // Flatten the array of categoryId
  },
  {
    $match: {
      $and: [
        {
          'categoryTree.catId': {
            $in: aznCategoryMapping.map((cat) => cat.value),
          },
        },
        ...totalPositivAmazon.$and,
      ],
    },
  },
  {
    $group: {
      _id: '$categoryTree.catId',
      count: { $sum: 1 },
    },
  },
  {
    $project: {
      _id: 0,
      category: { $toString: '$_id' },
      count: 1,
    },
  },
  {
    $replaceRoot: {
      newRoot: { $arrayToObject: [[{ k: '$category', v: '$count' }]] },
    }, // Format the output as desired
  },
];
