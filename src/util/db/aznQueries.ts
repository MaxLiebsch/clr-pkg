import { AznProduct } from '../../types/DbProductRecord.js';
import { keepaProperties } from '../../constants/index.js';
import { aznCategoryMapping } from '../../static/azn.js';
import { LookupInfoProps } from '../../types/process/index.js';

export const aznUnsetProperties: { [key in keyof AznProduct]: string } = {
  a_pblsh: '',
  a_nm: '',
  a_produktart: '',
  a_img: '',
  asin: '',
  a_cur: '',
  a_prc: '',
  bsr: '',
  a_avg_fld: '',
  a_avg_price: '',
  costs: '',
  a_uprc: '',
  a_qty: '',
  gl: '',
  tRexId: '',
  a_errors: '',
  a_orgn: '',
  iwhd: '',
  pwhd: '',
  drops30: '',
  drops90: '',
  tax: '',
  a_mrgn: '',
  a_useCurrPrice: '',
  a_rating: '',
  a_reviewcnt: '',
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
  keepaEan_lckd: '',
  keepaUpdatedAt: '',
  keepa_lckd: '',
  // scrape listing
  aznUpdatedAt: '',
  azn_taskId: '',
  azn_prop: '',
  // dealazn properties
  dealAznUpdatedAt: '',
  dealAznTaskId: '',
};

export type UpdateQuery = {
  $unset: { [key: string]: string };
  $set?: { [key: string]: any };
};

export const resetAznProductQuery = (props?: {
  info_prop: LookupInfoProps;
}) => {
  const { info_prop } = props || {};

  const query: UpdateQuery = {
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
