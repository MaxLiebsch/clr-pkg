import { CheerioAPI } from 'cheerio';
import { PriceAvailabilityInfo } from '../types/index';
import { ShopObject } from '../types/index';
import { deliveryTime } from './deliveryTImeCleansing';
import * as _ from 'underscore';
import { eanRegex, regex, regexp } from '../constants';

export const extractPriceAvailabilityInfo = (
  $: CheerioAPI,
  shop: ShopObject,
  url: string
): PriceAvailabilityInfo => {
  let p = '';
  let a: string | undefined;
  let n = '';
  let ean = '';
  let ps = '';
  //price
  shop.p.map((selector) => {
    const pEl = $(selector);
    if (pEl.length > 0 && pEl.text()) {
      let matchArray = [...pEl.text().matchAll(regexp)];
      if (!_.isUndefined(matchArray[0])) p = matchArray[0][0];
    }
  });

  //package size
  const psEl = $(shop.ps);
  if (psEl.length > 0) {
    ps = psEl.text();
  }

  //availability
  const availabilityEl = $(shop.a);
  if (availabilityEl.length > 0) {
    if (availabilityEl.text()) {
      a = deliveryTime(availabilityEl.text());
    } else {
      const availability = availabilityEl.attr('alt');
      if (availability) a = deliveryTime(availability);
    }
  }
  //ean
  if (shop.ean.includes('meta')) {
    const eanEl = $(shop.ean);
    if (eanEl.length > 0) {
      const content = eanEl.attr('content');
      if (content) {
        ean = content;
      }
    }
  } else if (shop.ean.includes('script')) {
    console.log(shop.ean.split(';')[0]);
    //@ts-ignore
    const jsonRaws = $(shop.ean.split(';')[0]);
    for (let index = 0; index < jsonRaws.length; index++) {
      //@ts-ignore
      const content = JSON.parse(jsonRaws[index].children[0].data);
      if (content[shop.ean.split(';')[1]]) {
        ean = content[shop.ean.split(';')[1]];
      }
    }
  } else {
    const eanEl = $(shop.ean);
    if (eanEl.length > 0) {
      let match = eanEl.text().match(eanRegex);
      if (match) {
        ean = match[0];
      }
    }
  }

  //name
  const nEl = $(shop.n);
  if (nEl.length > 0) {
    n = nEl.text();
  }

  if (a === undefined) {
    a = '';
  }
  return {
    a: a.replace(regex, '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
    p: p.replace(regex, '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
    n: n.replace(regex, '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
    ps: ps.replace(regex, '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
    ean: ean.replace(regex, '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
  };
};
