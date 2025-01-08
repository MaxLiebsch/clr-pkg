import { Query, QueryURLSchema } from '../types/query';

export const queryURLBuilder = (
  queryUrlSchema: QueryURLSchema[],
  query: Query,
) => {
  const relevatUrlSchema = queryUrlSchema.find(
    (schema) => schema.category.toLowerCase() === query.category.toLowerCase(),
  );

  if (!relevatUrlSchema) throw new Error('missing url schema');
  let url = '';
  let baseUrl = relevatUrlSchema.baseUrl;
  let yearPart = '';
  let brandPart = '';
  let modelPart = '';
  let queryStr = '';
  const yearRegex = new RegExp('<year>');

  const year = relevatUrlSchema.searchParams?.year;
  const brand = relevatUrlSchema.searchParams?.brand;
  const queryPart = relevatUrlSchema.searchParams?.queryPart;
  const continent = relevatUrlSchema.searchParams?.continent;
  if (year) {
    if (query.year.min > 0) {
      yearPart = year['min']
        ? year['min'] + encodeURIComponent(query.year.min)
        : encodeURIComponent(query.year.min);
    }
    if (query.year.max > 0) {
      yearPart = yearPart + year['max'] + encodeURIComponent(query.year.max);
    }
    if (year?.param) {
      yearPart = year.param + yearPart;
    }
  }

  if (query.brand) {
    if (brand) {
      brandPart = brand.key === 'key' ? query.brand.key : query.brand.value;
    } else {
      brandPart = query.brand.value;
    }
  }

  if (query.model) {
    modelPart = query.model.value;
  }

  if (queryPart?.seperator) {
    queryStr = encodeURIComponent(brandPart + queryPart.seperator + modelPart);
  } else {
    if (query.brand && query.model) {
      queryStr = encodeURIComponent(brandPart + ' ' + modelPart);
    }
    if (query.product) {
      queryStr = encodeURIComponent(query.product.value);
    }
  }

  url = baseUrl.replace('<query>', queryStr);

  if (continent) {
    url = url.replace('<continent>', continent);
  }
  if (yearRegex.test(url)) {
    url = url.replace('<year>', yearPart);
  } else if (yearPart) {
    url = url + yearPart;
  }

  return { url };
};
