import axios from 'axios';
import axiosRetry from 'axios-retry';
import AWS from 'aws-sdk';
import _ from 'lodash';
import { setTradeUrl, setAffiliateLinks } from '../utils';

export const getFearAndGreed = async params => {
	try {
		const res = await axios.get(`${process.env.REACT_APP_API_ALT_ME_URL}`, params ? { params } : undefined).catch(err => { return {}; });
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getFeeds = async params => {
	try {
		const res = await axios.get(`${process.env.REACT_APP_API_FEEDS_URL}`, params ? { params } : undefined).catch(err => { return {}; });
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getEtherscan = async params => {
	try {
		const res = await axios.get(`${process.env.REACT_APP_API_ETHERSCAN_URL}`, params ? { params } : undefined).catch(err => { return {}; });
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getNews = async params => {
	try {
		const res = await axios.get(`${process.env.REACT_APP_API_NEWS_URL}`, params ? { params } : undefined).catch(err => { return {}; });
		return res.data;
	} catch (err) {
		return null;
	}
};

const covalentClient = axios.create({ baseURL: process.env.REACT_APP_API_COVALENT_URL, timeout: Number(process.env.REACT_APP_INTERVAL_MS) * 2 });

export const getAddressBalances = async (chain_id, address, params) => {
	try {
		const path = `/${chain_id}/address/${address}/balances_v2`;
		const res = await covalentClient.get('', { params: { path, ...(params || {}) } }).catch(err => { return {}; });
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getAddressHistorical = async (chain_id, address, params) => {
	try {
		const path = `/${chain_id}/address/${address}/portfolio_v2`;
		const res = await covalentClient.get('', { params: { path, ...(params || {}) } }).catch(err => { return {}; });
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getAddressTransactions = async (chain_id, address, params) => {
	try {
		const path = `/${chain_id}/address/${address}/transactions_v2`;
		const res = await covalentClient.get('', { params: { path, ...(params || {}) } }).catch(err => { return {}; });
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getAddressTransfers = async (chain_id, address, params) => {
	try {
		const path = `/${chain_id}/address/${address}/transfers_v2`;
		const res = await covalentClient.get('', { params: { path, ...(params || {}) } }).catch(err => { return {}; });
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getAddressNftTransactions = async (chain_id, address, token_id, params) => {
	try {
		const path = `/${chain_id}/tokens/${address}/nft_transactions/${token_id}`;
		const res = await covalentClient.get('', { params: { path, ...(params || {}) } }).catch(err => { return {}; });
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getTransaction = async (chain_id, tx_hash, params) => {
	try {
		const path = `/${chain_id}/transaction_v2/${tx_hash}`;
		const res = await covalentClient.get('', { params: { path, ...(params || {}) } }).catch(err => { return {}; });
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getHistoricalByAddressesV2 = async (chain_id, currency, addresses, params) => {
	try {
		const path = `/pricing/historical_by_addresses_v2/${chain_id}/${currency}/${Array.isArray(addresses) ? addresses.join(',') : addresses}`;
		const res = await covalentClient.get('', { params: { path, ...(params || {}) } }).catch(err => { return {}; });
		return res.data;
	} catch (err) {
		return null;
	}
};

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
	} catch (err) {
		return null;
	}
};

export const getBlog = async (category_id, post_id, params, include_html) => {
	try {
		const res = await axios.get(`${process.env.REACT_APP_AWS_S3_URL}/${process.env.REACT_APP_AWS_S3_BUCKET}/blog/${category_id}/${post_id ? `posts/${post_id}/` : ''}data.json`, params ? { params } : undefined).catch(err => { return {}; });
		if (res && res.data && include_html && (process.env.REACT_APP_IS_PRODUCTION !== 'true' || res.data.include)) {
			const resHtml = await axios.get(`${process.env.REACT_APP_AWS_S3_URL}/${process.env.REACT_APP_AWS_S3_BUCKET}/blog/${category_id}/${post_id ? `posts/${post_id}/` : ''}data.html`, params ? { params } : undefined).catch(err => { return {}; });
			if (resHtml && resHtml.data) {
				res.data.html = resHtml.data;
			}
		}
		return res.data;
	} catch (err) {
		return null;
	}
};

const paprikaClient = axios.create({ baseURL: process.env.REACT_APP_SECOND_API_URL, timeout: Number(process.env.REACT_APP_RETRY_TIMEOUT_MS) * (window.screen.width <= 1200 ? 3 : 2) });

export const getAllPaprikaCoins = async params => {
	try {
		const res = await paprikaClient.get(`/coins`, params ? { params } : undefined).catch(err => { return {}; });
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getAllPaprikaExchanges = async params => {
	try {
		const res = await paprikaClient.get(`/exchanges`, params ? { params } : undefined).catch(err => { return {}; });
		return res.data;
	} catch (err) {
		return null;
	}
};

const client = axios.create({ baseURL: process.env.REACT_APP_API_URL, timeout: Number(process.env.REACT_APP_RETRY_TIMEOUT_MS) * (window.screen.width <= 1200 ? 3 : 2) });
axiosRetry(client, { retries: 3, shouldResetTimeout: true, retryDelay: retryCount => retryCount * 1000, retryCondition: err => true });

export const getGlobal = async params => {
	try {
		const path = `/global`;
		const res = await client.get(path, params ? { params } : undefined).catch(async err => { return await axios.get(`${process.env.REACT_APP_API_COINGECKO_URL}`, { params: { path, ...(params || {}) } }).catch(err => { return {}; }); });
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getGlobalDefi = async params => {
	try {
		const path = `/global/decentralized_finance_defi`;
		const res = await client.get(path, params ? { params } : undefined).catch(async err => { return await axios.get(`${process.env.REACT_APP_API_COINGECKO_URL}`, { params: { path, ...(params || {}) } }).catch(err => { return {}; }); });
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getAllCrypto = async params => {
	try {
		const path = `/search`;
		const res = await client.get(path, params ? { params } : undefined).catch(async err => { return await axios.get(`${process.env.REACT_APP_API_COINGECKO_URL}`, { params: { path, ...(params || {}) } }).catch(err => { return {}; }); });
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getAllCategories = async params => {
	try {
		const path = `/coins/categories/list`;
		const res = await client.get(path, params ? { params } : undefined).catch(async err => { return await axios.get(`${process.env.REACT_APP_API_COINGECKO_URL}`, { params: { path, ...(params || {}) } }).catch(err => { return {}; }); });
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getCategoriesMarkets = async params => {
	try {
		const path = `/coins/categories`;
		const res = await client.get(path, params ? { params } : undefined).catch(async err => { return await axios.get(`${process.env.REACT_APP_API_COINGECKO_URL}`, { params: { path, ...(params || {}) } }).catch(err => { return {}; }); });
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getPublicCompanies = async (coin_id, params) => {
	try {
		const path = `/companies/public_treasury/${coin_id}`;
		const res = await client.get(path, params ? { params } : undefined).catch(async err => { return await axios.get(`${process.env.REACT_APP_API_COINGECKO_URL}`, { params: { path, ...(params || {}) } }).catch(err => { return {}; }); });
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getTrendingSearch = async params => {
	try {
		const path = `/search/trending`;
		const res = await client.get(path, params ? { params } : undefined).catch(async err => { return await axios.get(`${process.env.REACT_APP_API_COINGECKO_URL}`, { params: { path, ...(params || {}) } }).catch(err => { return {}; }); });
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getCoinsMarkets = async params => {
	try {
		const path = `/coins/markets`;
		const res = await client.get(path, params ? { params } : undefined).catch(async err => { return await axios.get(`${process.env.REACT_APP_API_COINGECKO_URL}`, { params: { path, ...(params || {}) } }).catch(err => { return {}; }); });
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getCoin = async (coin_id, params, allPaprikaCoins) => {
	try {
		const path = `/coins/${coin_id}`;
		const res = await client.get(path, params ? { params } : undefined).catch(async err => { return await axios.get(`${process.env.REACT_APP_API_COINGECKO_URL}`, { params: { path, ...(params || {}) } }).catch(err => { return {}; }); });
		if (res && res.data && res.data.symbol && allPaprikaCoins && allPaprikaCoins.findIndex(c => c.id && c.id.startsWith(`${res.data.symbol.toLowerCase()}-`)) > -1) {
			let paprikaCoin = allPaprikaCoins[allPaprikaCoins.findIndex(c => c.id && c.id.startsWith(`${res.data.symbol.toLowerCase()}-`))];
			const paprikaRes = await paprikaClient.get(`/coins/${paprikaCoin.id}`).catch(err => { return {}; });
			if (paprikaRes && paprikaRes.data) {
				paprikaCoin = paprikaRes.data
				res.data.paprika = paprikaCoin;
			}
		}
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getCoinTickers = async (coin_id, params) => {
	try {
		const path = `/coins/${coin_id}/tickers`;
		const res = await client.get(path, params ? { params } : undefined).catch(async err => { return await axios.get(`${process.env.REACT_APP_API_COINGECKO_URL}`, { params: { path, ...(params || {}) } }).catch(err => { return {}; }); });
		if (res.data && res.data.tickers) {
			res.data.tickers = res.data.tickers.map(t => { return { ...t, trade_url: setAffiliateLinks(setTradeUrl(t)) }; });
		}
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getCoinMarketChart = async (coin_id, params) => {
	try {
		const path = `/coins/${coin_id}/market_chart`;
		const res = await axios.get(`${process.env.REACT_APP_API_URL}${path}`, params ? { params } : undefined).catch(async err => { return await axios.get(`${process.env.REACT_APP_API_COINGECKO_URL}`, { params: { path, ...(params || {}) } }).catch(err => { return {}; }); });
		if (res.data) {
			if (res.data.market_caps) {
				res.data.market_caps = res.data.market_caps.filter(d => d[0] > 0);
			}
			if (res.data.prices) {
				res.data.prices = res.data.prices.filter(d => d[0] > 0);
			}
			if (res.data.total_volumes) {
				res.data.total_volumes = res.data.total_volumes.filter(d => d[0] > 0);
			}
		}
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getCoinOHLC = async (coin_id, params) => {
	try {
		const path = `/coins/${coin_id}/ohlc`;
		const res = await axios.get(`${process.env.REACT_APP_API_URL}${path}`, params ? { params } : undefined).catch(async err => { return await axios.get(`${process.env.REACT_APP_API_COINGECKO_URL}`, { params: { path, ...(params || {}) } }).catch(err => { return {}; }); });
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getExchanges = async params => {
	try {
		const path = `/exchanges`;
		const res = await client.get(path, params ? { params } : undefined).catch(async err => { return await axios.get(`${process.env.REACT_APP_API_COINGECKO_URL}`, { params: { path, ...(params || {}) } }).catch(err => { return {}; }); });
		if (Array.isArray(res.data)) {
			res.data = res.data.map(e => { return { ...e, url: setAffiliateLinks(e.url) }; });
		}
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getExchange = async (exchange_id, params, allPaprikaExchanges) => {
	try {
		const path = `/exchanges/${exchange_id}`;
		const res = await client.get(path, params ? { params } : undefined).catch(async err => { return await axios.get(`${process.env.REACT_APP_API_COINGECKO_URL}`, { params: { path, ...(params || {}) } }).catch(err => { return {}; }); });
		if (res.data && !res.data.error) {
			if (allPaprikaExchanges && allPaprikaExchanges.findIndex(e => (e.id && res.data.id && e.id.toLowerCase() === res.data.id.toLowerCase()) || (e.name && res.data.name && e.name.toLowerCase() === res.data.name.toLowerCase())) > -1) {
				const paprikaExchange = allPaprikaExchanges[allPaprikaExchanges.findIndex(e => (e.id && res.data.id && e.id.toLowerCase() === res.data.id.toLowerCase()) || (e.name && res.data.name && e.name.toLowerCase() === res.data.name.toLowerCase()))];
				// const paprikaRes = await paprikaClient.get(`/exchanges/${paprikaExchange.id}`).catch(err => { return {}; });
				// if (paprikaRes && paprikaRes.data) {
				// 	paprikaExchange = paprikaRes.data
				// }
				res.data.paprika = paprikaExchange;
			}
			res.data.url = setAffiliateLinks(res.data.url);
			if (res.data.tickers) {
				res.data.tickers = res.data.tickers.map(t => { return { ...t, trade_url: setAffiliateLinks(setTradeUrl(t)) }; });
			}
		}
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getExchangeTickers = async (exchange_id, params) => {
	try {
		const path = `/exchanges/${exchange_id}/tickers`;
		const res = await client.get(path, params ? { params } : undefined).catch(async err => { return await axios.get(`${process.env.REACT_APP_API_COINGECKO_URL}`, { params: { path, ...(params || {}) } }).catch(err => { return {}; }); });
		if (res.data && res.data.tickers) {
			res.data.tickers = res.data.tickers.map(t => { return { ...t, trade_url: setAffiliateLinks(setTradeUrl(t)) }; });
		}
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getExchangeVolumeChart = async (exchange_id, params) => {
	try {
		const path = `/exchanges/${exchange_id}/volume_chart`;
		const res = await axios.get(`${process.env.REACT_APP_API_URL}${path}`, params ? { params } : undefined).catch(async err => { return await axios.get(`${process.env.REACT_APP_API_COINGECKO_URL}`, { params: { path, ...(params || {}) } }).catch(err => { return {}; }); });
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getDerivatives = async params => {
	try {
		const path = `/derivatives`;
		const res = await client.get(path, params ? { params } : undefined).catch(async err => { return await axios.get(`${process.env.REACT_APP_API_COINGECKO_URL}`, { params: { path, ...(params || {}) } }).catch(err => { return {}; }); });
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getDerivativesExchanges = async params => {
	try {
		const path = `/derivatives/exchanges`;
		const res = await client.get(path, params ? { params } : undefined).catch(async err => { return await axios.get(`${process.env.REACT_APP_API_COINGECKO_URL}`, { params: { path, ...(params || {}) } }).catch(err => { return {}; }); });
		if (Array.isArray(res.data)) {
			res.data = res.data.map(e => { return { ...e, url: setAffiliateLinks(e.url) }; });
		}
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getDerivativesExchange = async (exchange_id, params) => {
	try {
		const path = `/derivatives/exchanges/${exchange_id}`;
		const res = await client.get(path, params ? { params } : undefined).catch(async err => { return await axios.get(`${process.env.REACT_APP_API_COINGECKO_URL}`, { params: { path, ...(params || {}) } }).catch(err => { return {}; }); });
		if (res.data && !res.data.error) {
			res.data.url = setAffiliateLinks(res.data.url);
			if (res.data.tickers) {
				res.data.tickers = res.data.tickers.map(t => { return { ...t, trade_url: setAffiliateLinks(setTradeUrl(t)) }; });
			}
		}
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getExchangeRates = async params => {
	try {
		const path = `/exchange_rates`;
		const res = await client.get(path, params ? { params } : undefined).catch(async err => { return await axios.get(`${process.env.REACT_APP_API_COINGECKO_URL}`, { params: { path, ...(params || {}) } }).catch(err => { return {}; }); });
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getStatusUpdates = async params => {
	try {
		const path = `/status_updates`;
		const res = await client.get(path, params ? { params } : undefined).catch(async err => { return await axios.get(`${process.env.REACT_APP_API_COINGECKO_URL}`, { params: { path, ...(params || {}) } }).catch(err => { return {}; }); });
		return res.data;
	} catch (err) {
		return null;
	}
};

export const getEvents = async params => {
	try {
		const path = `/events`;
		const res = await client.get(path, params ? { params } : undefined).catch(async err => { return await axios.get(`${process.env.REACT_APP_API_COINGECKO_URL}`, { params: { path, ...(params || {}) } }).catch(err => { return {}; }); });
		return res.data;
	} catch (err) {
		return null;
	}
};
