import axios from 'axios';
import axiosRetry from 'axios-retry';
import AWS from 'aws-sdk';
import _ from 'lodash';
import { setTradeUrl, setAffiliateLinks } from '../utils';

// fear and greed
export const getFearAndGreed = async params => {
  try {
    const res = await axios.get(process.env.REACT_APP_REQUESTER_URL, { params: { api_name: 'fear_and_greed', ...(params || {}) } })
      .catch(error => { return { data: { data: null, metadata: { error } } }; });
    return res.data;
  } catch (error) {
    return { data: null, metadata: { error } };
  }
};

// news
export const getNews = async params => {
  try {
    const res = await axios.get(process.env.REACT_APP_REQUESTER_URL, { params: { api_name: 'news', ...(params || {}) } })
      .catch(error => { return { data: { results: null, error } }; });
    return res.data;
  } catch (error) {
    return { results: null, error };
  }
};

// etherscan
export const getEtherscan = async params => {
  try {
    const res = await axios.get(process.env.REACT_APP_REQUESTER_URL, { params: { api_name: 'etherscan', ...(params || {}) } })
      .catch(error => { return { data: { result: null, status: 0, message: error.message } }; });
    return res.data;
  } catch (error) {
    return { result: null, status: 0, message: error.message };
  }
};

// dashboard feeds
export const getFeeds = async params => {
  try {
    const res = await axios.get(process.env.REACT_APP_API_FEEDS_URL, params ? { params } : undefined)
      .catch(error => { return []; });
    return res.data;
  } catch (error) {
    return [];
  }
};

// covalent
// initial covalent requester object
const covalentRequester = axios.create({ baseURL: process.env.REACT_APP_REQUESTER_URL, timeout: Number(process.env.REACT_APP_INTERVAL_MS) * 2 });

// function to request data from covalent API on AWS by passing 2 arguments (path, params)
export const covalentRequest = async (path, params) => {
  // response data variable
  let response = null;

  try {
    // send request to your API
    const res = await covalentRequester.get('', { params: { api_name: 'covalent', path, ...(params || {}) } })
      // set response data from error handled by exception
      .catch(error => { return { data: { data: null, error: true, error_message: error.message, error_code: error.code } }; });

    // set response data
    if (res && res.data) {
      response = res.data;
    }
  } catch (error) {
    // set response data from error handled by exception
    response = { data: null, error: true, error_message: error.message, error_code: error.code };
  }

  // return response data
  return response;
};

export const getAddressBalances = async (chain_id, address, params) => {
  const path = `/${chain_id}/address/${address}/balances_v2`;
  return await covalentRequest(path, params);
};

export const getAddressHistorical = async (chain_id, address, params) => {
  const path = `/${chain_id}/address/${address}/portfolio_v2`;
  return await covalentRequest(path, params);
};

export const getAddressTransactions = async (chain_id, address, params) => {
  const path = `/${chain_id}/address/${address}/transactions_v2`;
  return await covalentRequest(path, params);
};

export const getAddressTransfers = async (chain_id, address, params) => {
  const path = `/${chain_id}/address/${address}/transfers_v2`;
  return await covalentRequest(path, params);
};

export const getAddressNftTransactions = async (chain_id, address, token_id, params) => {
  const path = `/${chain_id}/tokens/${address}/nft_transactions/${token_id}`;
  return await covalentRequest(path, params);
};

export const getTransaction = async (chain_id, tx_hash, params) => {
  const path = `/${chain_id}/transaction_v2/${tx_hash}`;
  return await covalentRequest(path, params);
};

export const getHistoricalByAddressesV2 = async (chain_id, currency, addresses, params) => {
  const path = `/pricing/historical_by_addresses_v2/${chain_id}/${currency}/${Array.isArray(addresses) ? addresses.join(',') : addresses}`;
  return await covalentRequest(path, params);
};

// blog
AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});
const s3 = new AWS.S3();

export const getAllBlogs = async () => {
  const params = {
    Bucket: process.env.REACT_APP_AWS_S3_BUCKET,
    Delimiter: '',
    Prefix: 'blog/',
  };
  try {
    const listBlogs = params => new Promise(resolve => {
      s3.listObjectsV2(params, async (err, data) => {
        if (err) {
          resolve(null);
        } else {
          let blogsData = data.Contents && data.Contents.filter(c => c.Key && c.Key.endsWith('data.json')).map(c => _.slice(c.Key.split('/'), 1, c.Key.split('/').length - 1)).map(p => { return { category_id: p[0], post_id: p[2] ? p[2] : undefined }; });
          for (let i = 0; i < blogsData.length; i++) {
            const b = blogsData[i];
            let blogData = await getBlog(b.category_id, b.post_id);
            blogData = blogData ? blogData : {};
            blogsData[i] = { ...b, ...blogData };
          };
          if (process.env.REACT_APP_IS_PRODUCTION === 'true') {
            blogsData = blogsData.filter(b => b.include && (!b.post_id || blogsData.findIndex(bb => !bb.post_id && bb.category_id === b.category_id && !bb.include) < 0));
          }
          resolve(blogsData);
        }
      });
    });
    const data = await listBlogs(params);
    return data;
  } catch (error) {
    return null;
  }
};

export const getBlog = async (category_id, post_id, params, include_html) => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_AWS_S3_URL}/${process.env.REACT_APP_AWS_S3_BUCKET}/blog/${category_id}/${post_id ? `posts/${post_id}/` : ''}data.json`, params ? { params } : undefined)
      .catch(error => { return {}; });
    if (res && res.data && include_html && (process.env.REACT_APP_IS_PRODUCTION !== 'true' || res.data.include)) {
      const resHtml = await axios.get(`${process.env.REACT_APP_AWS_S3_URL}/${process.env.REACT_APP_AWS_S3_BUCKET}/blog/${category_id}/${post_id ? `posts/${post_id}/` : ''}data.html`, params ? { params } : undefined)
        .catch(error => { return {}; });
      if (resHtml && resHtml.data) {
        res.data.html = resHtml.data;
      }
    }
    return res.data;
  } catch (error) {
    return null;
  }
};

// paprika
// initial paprika requester object
const paprikaRequester = axios.create({ baseURL: process.env.REACT_APP_PAPRIKA_API_URL, timeout: Number(process.env.REACT_APP_RETRY_TIMEOUT_MS) * (window.screen.width <= 1200 ? 3 : 2) });

export const getAllPaprikaCoins = async params => {
  try {
    const res = await paprikaRequester.get(`/coins`, params ? { params } : undefined)
      .catch(error => { return {}; });
    return res.data;
  } catch (error) {
    return null;
  }
};

export const getAllPaprikaExchanges = async params => {
  try {
    const res = await paprikaRequester.get(`/exchanges`, params ? { params } : undefined)
      .catch(error => { return {}; });
    return res.data;
  } catch (error) {
    return null;
  }
};

// coingecko
// initial coingecko requester object
const coingeckoRequester = axios.create({ baseURL: process.env.REACT_APP_COINGECKO_API_URL, timeout: Number(process.env.REACT_APP_RETRY_TIMEOUT_MS) * (window.screen.width <= 1200 ? 3 : 2) });
axiosRetry(coingeckoRequester, { retries: 3, shouldResetTimeout: true, retryDelay: retryCount => retryCount * 1000, retryCondition: error => true });

// function to request data from coingecko API on AWS by passing 3 arguments (path, params, noRetry(Optional))
export const coingeckoRequest = async (path, params, noRetry) => {
  // response data variable
  let response = null;

  try {
    // send request to API
    const res = await (noRetry ? axios.get(`${process.env.REACT_APP_COINGECKO_API_URL}${path}`, params ? { params } : undefined) : coingeckoRequester.get(path, { params: { ...(params || {}) } }))
      // try request on your API
      .catch(async error => {
        return await axios.get(process.env.REACT_APP_REQUESTER_URL, { params: { api_name: 'coingecko', path, ...(params || {}) } })
          // set response data from error handled by exception
          .catch(error => { return { data: { error } }; });
      })
      // set response data from error handled by exception
      .catch(error => { return { data: { error } }; });

    // set response data
    if (res && res.data) {
      response = res.data;
    }
  } catch (error) {
    // set response data from error handled by exception
    response = { error };
  }

  // return response data
  return response;
};

export const getGlobal = async params => {
  const path = `/global`;
  return await coingeckoRequest(path, params);
};

export const getGlobalDefi = async params => {
  const path = `/global/decentralized_finance_defi`;
  return await coingeckoRequest(path, params);
};

export const getAllCrypto = async params => {
  const path = `/search`;
  return await coingeckoRequest(path, params);
};

export const getAllCategories = async params => {
  const path = `/coins/categories/list`;
  return await coingeckoRequest(path, params);
};

export const getCategoriesMarkets = async params => {
  const path = `/coins/categories`;
  return await coingeckoRequest(path, params);
};

export const getPublicCompanies = async (coin_id, params) => {
  const path = `/companies/public_treasury/${coin_id}`;
  return await coingeckoRequest(path, params);
};

export const getTrendingSearch = async params => {
  const path = `/search/trending`;
  return await coingeckoRequest(path, params);
};

export const getCoinsMarkets = async params => {
  const path = `/coins/markets`;
  return await coingeckoRequest(path, params);
};

export const getCoin = async (coin_id, params, allPaprikaCoins) => {
  const path = `/coins/${coin_id}`;
  const response = await coingeckoRequest(path, params);
  if (response && response.symbol && allPaprikaCoins && allPaprikaCoins.findIndex(c => c.id && c.id.startsWith(`${response.symbol.toLowerCase()}-`)) > -1) {
    let paprikaCoin = allPaprikaCoins[allPaprikaCoins.findIndex(c => c.id && c.id.startsWith(`${response.symbol.toLowerCase()}-`))];
    const paprikaRes = await paprikaRequester.get(`/coins/${paprikaCoin.id}`).catch(error => { return {}; });
    if (paprikaRes && paprikaRes.data) {
      paprikaCoin = paprikaRes.data
      response.paprika = paprikaCoin;
    }
  }
  return response;
};

export const getCoinTickers = async (coin_id, params) => {
  const path = `/coins/${coin_id}/tickers`;
  const response = await coingeckoRequest(path, params);
  if (response && response.tickers) {
    response.tickers = response.tickers.map(t => { return { ...t, trade_url: setAffiliateLinks(setTradeUrl(t)) }; });
  }
  return response;
};

export const getCoinMarketChart = async (coin_id, params) => {
  const path = `/coins/${coin_id}/market_chart`;
  const response = await coingeckoRequest(path, params, true);
  if (response) {
    if (response.market_caps) {
      response.market_caps = response.market_caps.filter(d => d[0] > 0);
    }
    if (response.prices) {
      response.prices = response.prices.filter(d => d[0] > 0);
    }
    if (response.total_volumes) {
      response.total_volumes = response.total_volumes.filter(d => d[0] > 0);
    }
  }
  return response;
};

export const getCoinOHLC = async (coin_id, params) => {
  const path = `/coins/${coin_id}/ohlc`;
  return await coingeckoRequest(path, params, true);
};

export const getExchanges = async params => {
  const path = `/exchanges`;
  let response = await coingeckoRequest(path, params);
  if (Array.isArray(response)) {
    response = response.map(e => { return { ...e, url: setAffiliateLinks(e.url) }; });
  }
  return response;
};

export const getExchange = async (exchange_id, params, allPaprikaExchanges) => {
  const path = `/exchanges/${exchange_id}`;
  const response = await coingeckoRequest(path, params);
  if (response && !response.error) {
    if (allPaprikaExchanges && allPaprikaExchanges.findIndex(e => (e.id && response.id && e.id.toLowerCase() === response.id.toLowerCase()) || (e.name && response.name && e.name.toLowerCase() === response.name.toLowerCase())) > -1) {
      const paprikaExchange = allPaprikaExchanges[allPaprikaExchanges.findIndex(e => (e.id && response.id && e.id.toLowerCase() === response.id.toLowerCase()) || (e.name && response.name && e.name.toLowerCase() === response.name.toLowerCase()))];
      // const paprikaRes = await paprikaRequester.get(`/exchanges/${paprikaExchange.id}`).catch(error => { return {}; });
      // if (paprikaRes && paprikaRes.data) {
      //   paprikaExchange = paprikaRes.data
      // }
      response.paprika = paprikaExchange;
    }
    response.url = setAffiliateLinks(response.url);
    if (response.tickers) {
      response.tickers = response.tickers.map(t => { return { ...t, trade_url: setAffiliateLinks(setTradeUrl(t)) }; });
    }
  }
  return response;
};

export const getExchangeTickers = async (exchange_id, params) => {
  const path = `/exchanges/${exchange_id}/tickers`;
  const response = await coingeckoRequest(path, params);
  if (response && response.tickers) {
    response.tickers = response.tickers.map(t => { return { ...t, trade_url: setAffiliateLinks(setTradeUrl(t)) }; });
  }
  return response;
};

export const getExchangeVolumeChart = async (exchange_id, params) => {
  const path = `/exchanges/${exchange_id}/volume_chart`;
  return await coingeckoRequest(path, params, true);
};

export const getDerivatives = async params => {
  const path = `/derivatives`;
  return await coingeckoRequest(path, params);
};

export const getDerivativesExchanges = async params => {
  const path = `/derivatives/exchanges`;
  let response = await coingeckoRequest(path, params);
  if (Array.isArray(response)) {
    response = response.map(e => { return { ...e, url: setAffiliateLinks(e.url) }; });
  }
  return response;
};

export const getDerivativesExchange = async (exchange_id, params) => {
  const path = `/derivatives/exchanges/${exchange_id}`;
  const response = await coingeckoRequest(path, params);
  if (response && !response.error) {
    response.url = setAffiliateLinks(response.url);
    if (response.tickers) {
      response.tickers = response.tickers.map(t => { return { ...t, trade_url: setAffiliateLinks(setTradeUrl(t)) }; });
    }
  }
  return response;
};

export const getExchangeRates = async params => {
  const path = `/exchange_rates`;
  return await coingeckoRequest(path, params);
};

export const getStatusUpdates = async params => {
  const path = `/status_updates`;
  return await coingeckoRequest(path, params);
};

export const getEvents = async params => {
  const path = `/events`;
  return await coingeckoRequest(path, params);
};
