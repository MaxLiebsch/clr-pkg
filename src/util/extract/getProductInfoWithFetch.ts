import { HttpsProxyAgent } from 'https-proxy-agent';
import { Candidate, FailedPage } from '../../types';
import { Shop } from '../../types/shop';
import _, { sample } from 'underscore';
import { ProxyAuth } from '../../types/proxyAuth';
import { findProductInfo } from '.';
import { load } from 'cheerio';
import url, { URL } from 'url';
import { CHROME_VERSIONS, userAgentList } from '../../constants';
import axios, { AxiosError } from 'axios';

export const getProductInfoWithFetch = async (
  link: string,
  shop: Shop,
  proxyAuth: ProxyAuth,
) => {
  try {
    const userAgent = sample(userAgentList) ?? userAgentList[0];
    const _agent = userAgent.agent.replaceAll('<version>', CHROME_VERSIONS[0]);
    const myURL = new URL('http://' + proxyAuth.host);
    const options = url.urlToHttpOptions(myURL);
    const proxyAgent = new HttpsProxyAgent(options);
    const axiosOptions = {
      Headers: {
        'User-Agent': _agent,
      },
      httpAgent: proxyAgent,
      httpsAgent: proxyAgent,
    };
    const response = await axios.get(link, axiosOptions);
    const body = response.data;
    const productInfo = findProductInfo(load(body), shop, link, false);
    return {
      productInfo,
      url: link,
      type: 'success',
      status: response.status,
      error: null,
      reason: '',
    };
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      return {
        url: link,
        type: 'failed',
        productInfo: null,
        status: error.response.status,
        error: null,
        reason: 'fetch-error',
      };
    } else {
      return {
        url: link,
        type: 'failed',
        productInfo: null,
        status: 0,
        error: `${error}`,
        reason: 'unknown-error',
      };
    }
  }
};
