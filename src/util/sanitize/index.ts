import path from 'path';

export const sanitizedURL = (url: string, curr: string, parentUrl: string) => {
  const https = 'https://www.';
  const regex = /^([a-zA-Z0-9])/g;
  const split = parentUrl.split('?');
  let subPage = '';
  if (split[0]) {
    subPage = split[0];
  } else {
    subPage = parentUrl;
  }
  switch (true) {
    case url.startsWith('/'):
      return https + curr + url;
    case url.startsWith('?'):
      return subPage + url;
    case url.startsWith('http://'):
      return url;
    case url.startsWith('https://'):
      return url;
    case regex.test(url):
      return https + url;
    default:
      return url;
  }
};

export const urlBuilder = (domain:string, schema:string, pzn: string )=>{
    return 'https://www.' + domain  + schema.replace('{{PZN}}', pzn)
}

export const HTMLtoString = (html: string): string => {
  const signs: string[] = ['\\', '\n', '\r', '\t', '"'];
  signs.forEach((sign) => {
    if (sign.charCodeAt(0) === 34) {
      html = html.replaceAll(sign, '\\"');
    } else {
      html = html.replaceAll(sign, sign);
    }
  });
  return html;
};

export const removeRandomKeywordInURL = (url: string, regexArray: string[]) => {
  if (regexArray.length === 0) return url;

  if (!url.includes('random')) return url;

  let res: string = url;

  for (let i = 0; i < regexArray.length; i++) {
    const el = regexArray[i];
    const literal = String.raw`${el}`;
    const pattern = literal.split('/')[1];
    const flags = literal.split('/')[2];
    const regex = new RegExp(pattern, flags);
    res = res.replaceAll(regex, '');
    //   if(res != url) return res
  }

  return res;
};

export const linkPassedURLShopCriteria = (
  url: string,
  arr: string[]
): boolean => (arr.some((el) => url.toLowerCase().includes(el)) ? false : true);
