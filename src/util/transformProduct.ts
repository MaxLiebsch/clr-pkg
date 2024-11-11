import { DbProductRecord } from '../types/DbProductRecord';
import { createHash } from './hash';
import { getManufacturer, prefixLink } from './matching/compare_helper';
import { parseAsinFromUrl } from './parseAsinFromUrl';
import { parseEsinFromUrl } from './parseEsinFromUrl';
import { removeSearchParams } from './removeSearch';

export const transformProduct = (
  crawlDataProduct: any,
  shopDomain: string,
): DbProductRecord => {
  let product = { ...crawlDataProduct };
  let {
    name,
    mnfctr,
    price,
    link,
    promoPrice,
    dscrptnSegments,
    category,
    nmSubSegments,
    query,
    description,
    nameSub,
    locked,
    cat_locked,
    info_locked,
    eby_locked,
    vendor,
    candidates,
    info_taskId,
    cat_taskId,
    eby_taskId,
    taskId,
    migrationCompleted,
    migrationAt,
    azn_taskId,
    eby_prop,
    qEbyUpdatedAt,
    cat_prop,
    catUpdatedAt,
    info_prop,
    infoUpdatedAt,
    ean_prop,
    eanUpdatedAt,
    ean,
    prime,
    esin,
    a_fat,
    e_fat,
    lckd,
    asin,
    vrfd,
    a_qty,
    e_qty,
    qty_batchId,
    qty_prop,
    img,
    updatedAt,
    arn,
    image,
    deletedAt,
    s,
    a_props,
    ctgry,
    e_mrgn_prc,
    e_ns_mrgn_prc,
    pblsh,
    brand,
    shop,
  } = product;

  for (const key in product) {
    if (Number.isNaN(product[key])) {
      delete product[key];
    }
  }

  if (typeof e_mrgn_prc === 'number') {
    delete product.e_mrgn_prc;
  }

  if (typeof e_ns_mrgn_prc === 'number') {
    delete product.e_ns_mrgn_prc;
  }

  if (s) {
    delete product.s;
  }

  if (!img) {
    delete product.img;
  }

  if (typeof arn === 'string') {
    delete product.arn;
  }

  if (typeof lckd === 'boolean') {
    delete product.lckd;
  }

  if (typeof vrfd === 'boolean') {
    delete product.vrfd;
  }

  if (shop) {
    delete product.shop;
  }

  if (brand) {
    delete product.brand;
  }

  if (typeof pblsh === 'boolean') {
    delete product.pblsh;
  }

  if (typeof ctgry === 'string') {
    product.ctgry = [ctgry];
  } 

  if (!product.esin) {
    delete product.esin;
  } 

  if (!product.asin) {
    delete product.asin;
  }

  if (deletedAt) {
    delete product.deletedAt;
  }

  for (const key in product) {
    if (product[key] === null) {
      delete product[key];
    }
  }

  if (a_props) {
    delete product.a_props;
  }

  if (typeof a_fat === 'boolean') {
    delete product.a_fat;
  }

  if (typeof e_fat === 'boolean') {
    delete product.e_fat;
  }

  if (migrationCompleted) {
    delete product.migrationCompleted;
  }
  if (migrationAt) {
    delete product.migrationAt;
  }

  if (typeof prime === 'boolean') {
    delete product.prime;
  }

  if (!eby_prop) {
    delete product.eby_prop;
  } else {
    if (!qEbyUpdatedAt) {
      product.qEbyUpdatedAt = updatedAt;
    }
  }

  if (!cat_prop) {
    delete product.cat_prop;
  } else {
    if (!catUpdatedAt) {
      product.catUpdatedAt = updatedAt;
    }
  }

  if (!ean_prop) {
    delete product.ean_prop;
  } else {
    if (!eanUpdatedAt) {
      product['eanUpdatedAt'] = updatedAt;
    }
  }

  if (!info_prop) {
    delete product.info_prop;
  } else {
    if (!infoUpdatedAt) {
      product.infoUpdatedAt = updatedAt;
    }
  }

  if (!taskId) {
    delete product.taskId;
  }

  if (!azn_taskId) {
    delete product.azn_taskId;
  }

  if (!info_taskId) {
    delete product.info_taskId;
  }

  if (!cat_taskId) {
    delete product.cat_taskId;
  }

  if (!eby_taskId) {
    delete product.eby_taskId;
  }

  if (!e_qty) {
    delete product.e_qty;
  }

  if (!a_qty) {
    delete product.a_qty;
  }

  if (!qty_batchId) {
    delete product.qty_batchId;
  }
  if (!qty_prop) {
    delete product.qty_prop;
  }

  if (name) {
    if (!mnfctr || mnfctr === '') {
      const { mnfctr: _mnfctr, prodNm: _prodNm } = getManufacturer(name);
      product['nm'] = _prodNm;
      product['mnfctr'] = _mnfctr;
    } else {
      product['nm'] = name;
      product['mnfctr'] = mnfctr;
    }

    delete product.name;
  }
  if (price) {
    if (promoPrice) {
      product['prc'] = promoPrice;
    } else {
      product['prc'] = price;
    }
    delete product.price;
  }
  if (link) {
    link = prefixLink(removeSearchParams(link), shopDomain);
    product['s_hash'] = createHash(link);
    product['lnk'] = link;
    delete product.link;
  }

  if (image) {
    product['img'] = prefixLink(image, shopDomain);
    delete product.image;
  }
  if (ean) {
    product['eanList'] = [ean];
    if (!eanUpdatedAt) {
      product.eanUpdatedAt = updatedAt;
    }
    delete product.ean;
  } else {
    delete product.ean;
  }
  if (category instanceof Array) {
    product['ctgry'] = product.category;
    delete product.category;
  }
  if (dscrptnSegments) {
    delete product.dscrptnSegments;
  }
  if (candidates) {
    delete product.candidates;
  }
  if (promoPrice === 0) {
    delete product.promoPrice;
  }
  if (description || description === '') {
    delete product.description;
  }
  if (nameSub || nameSub === '') {
    delete product.nameSub;
  }
  if (nmSubSegments || nmSubSegments === '') {
    delete product.nmSubSegments;
  }
  if (vendor || vendor === '') {
    delete product.vendor;
  }
  if (query) {
    delete product.query;
  }
  if (typeof eby_locked === 'boolean') {
    delete product.eby_locked;
  }
  if (typeof info_locked === 'boolean') {
    delete product.info_locked;
  }
  if (typeof cat_locked === 'boolean') {
    delete product.cat_locked;
  }
  if (typeof locked === 'boolean') {
    delete product.locked;
  }

  return product;
};
