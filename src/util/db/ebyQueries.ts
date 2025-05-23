 
import { UpdateQuery } from './aznQueries.js';
import { EbyProduct } from '../../types/DbProductRecord.js';
import { ebayTier } from '../../static/ebay.js';

export const ebyUnsetProperties: { [key in keyof EbyProduct]?: string } = {
  //standard properties
  e_pblsh: '',
  e_nm: '',
  e_produktart: '',
  e_pRange: '',
  e_cur: '',
  e_img: '',
  esin: '',
  e_prc: '',
  e_uprc: '',
  e_qty: '',
  e_orgn: '',
  e_mrgn: '',
  e_mrgn_prc: '',
  e_mrgn_pct: '',
  e_ns_costs: '',
  e_totalOfferCount: '',
  e_totalSoldOfferCount: "",
  e_ns_mrgn: '',
  e_ns_mrgn_pct: '',
  e_tax: '',
  e_costs: '',
  ebyCategories: '',
  e_vrfd: '',
  // lookup category
  cat_taskId: '',
  // scrape listing
  ebyUpdatedAt: '',
  eby_taskId: '',
  // dealeby properties
  dealEbyUpdatedAt: '',
  dealEbyTaskId: '',
};

export const resetEbyProductQuery = (
  props = { eby_prop: '', cat_prop: '' },
) => {
  const { eby_prop, cat_prop } = props;
  const query: UpdateQuery = {
    $unset: {
      ...ebyUnsetProperties,
    },
  };

  if (!query['$set'] && (eby_prop || cat_prop)) {
    query['$set'] = {};
  }
  if (eby_prop) {
    query['$set']!['eby_prop'] = eby_prop;
    query['$set']!['qEbyUpdatedAt'] = new Date().toISOString();
  } else {
    query['$unset']['eby_prop'] = '';
    query['$unset']['qEbyUpdatedAt'] = '';
  }

  if (cat_prop) {
    query['$set']!['cat_prop'] = cat_prop;
    query['$set']!['catUpdatedAt'] = new Date().toISOString();
  } else {
    query['$unset']['cat_prop'] = '';
    query['$unset']['catUpdatedAt'] = '';
  }

  return query;
};

export const totalPositivEbay = {
  $and: [
    { e_pblsh: true },
    { 'e_pRange.median': { $gt: 0 } },
    { e_uprc: { $gt: 0 } },
    { e_mrgn: { $gt: 0 } },
    { e_mrgn_pct: { $gt: 0 } },
  ],
};

export const countProductsPerCategoryEby = (domain: string) => [
  {
    $match: {
      sdmn: domain,
    },
  },
  {
    $unwind: '$ebyCategories', // Flatten the array of categoryId
  },
  {
    $match: {
      $and: [
        {
          'ebyCategories.id': { $in: ebayTier.map((cat) => cat.id) },
        },
        ...totalPositivEbay.$and,
      ],
    },
  },
  {
    $group: {
      _id: '$ebyCategories.id',
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
