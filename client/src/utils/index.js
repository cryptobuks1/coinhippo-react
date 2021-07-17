import { useEffect, useRef } from 'react';
import _ from 'lodash';
import { menus } from '../layout/header/menus';

export const useIsMountedRef = () => {
  const isMountedRef = useRef(null);
  useEffect(() => {
    isMountedRef.current = true;
    return () => isMountedRef.current = false;
  });
  return isMountedRef;
};

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const dynamicPaths = ['coin','exchange'];

export const ignoreBreadcrumbPaths = ['explorer','public-companies'];

export const affiliateData = {
  title: `<span class="f-20 f-w-500 font-dark text-left">Support ${process.env.REACT_APP_APP_NAME} with out extra cost 🙂</span>`,
  html: `<div class="f-16 text-secondary text-left mt-3">Links on this page are affiliate links. ${process.env.REACT_APP_APP_NAME} may be compensated when you sign up and trade on these affiliate platforms; without any extra cost to you.<br><br>Please refer to Clause 12.2 of our <a href="/privacy" target="_blank" class="f-w-400 font-primary">privacy policy</a> and Clause 5.2 in our <a href="/terms" target="_blank" class="f-w-400 font-primary">terms of service</a> for more information.</div>`,
  confirmButtonText: 'Got it',
};

export const cex = ['aax','aax_futures','abcc','abit','acdx','acdx_futures','aex','allcoin','alpha_five','alterdice','altilly','altmarkets','aprobit','artisturba','atomars','b2bx','bakkt','bankera','basefex','bcex','beaxy','bgogo','bibo','bibox','bibox_futures','bidesk','bigone','bigone_futures','biki','biki_futures','bilaxy','binance','binance_futures','binance_jersey','binance_us','equos','bione','bit2c','bitalong','bitbank','bitbay','bitbns','bitbox','bitci','bitcoin_com','bit_com_futures','bitex','bitexbook','bitexlive','bitfex','bitfinex','bitfinex_futures','bitflyer','bitflyer_futures','bitforex','bitforex_futures','bitget','bitget_futures','bithash','bitholic','bithumb','bithumb_futures','bithumb_global','bitinfi','bitkonan','bitkub','bitmart','bitmax','bitmax_futures','bitmesh','bitmex','bitoffer','bitonbay','bitopro','bitpanda','bitrabbit','altcointrader','delta_spot','bitrue','bits_blockchain','bitsdaq','bitso','bitsonic','lcx','bitstamp','bitsten','bitstorage','bittrex','bitubu','bit_z','bitz_futures','bkex','bleutrade','blockchain_com','boa','braziliex','btc_alpha','btcbox','btcc','btc_exchange','btcmarkets','btcmex','btcnext','btcsquare','btc_trade_ua','btcturk','btse','btse_futures','buyucoin','bvnex','bw','flybit','bybit','c2cx','catex','cbx','ccex','cex','chainex','changelly','chiliz','coinzoom','citex','cme_futures','coinall','coinasset','coinbene','coinbig','coinbit','coincheck','coindcx','coindeal','coindirect','coineal','coin_egg','coinex','coinfalcon','coinfield','coinflex','coinflex_futures','coinfloor','coingi','coinhe','coinhub','coinjar','coinlim','coinlist','coinmargin','coin_metro','coinone','coinpark','coinplace','coinsbank','coinsbit','coinsuper','cointiger','cointiger_futures','coinxpro','coinzo','c_patex','cpdax','crex24','crxzone','cryptaldash','cryptex','cryptlocex','crypto_com','kickex','cryptology','crytrex','c_trade','currency','darb_finance','daybit','dcoin','decoin','delta_futures','deribit','dextrade','digifinex','dobitrade','dove_wallet','dragonex','dsx','duedex','ecxx','elitex','emirex','eterbase','etherflyer','etorox','exmarkets','exmo','exnce','exrates','exx','fatbtc','fex','financex','finexbox','floatsv','freiexchange','ftx','ftx_spot','ftx_us','gate','gate_futures','gbx','gdac','gdax','gemini','getbtc','gmo_japan','gmo_japan_futures','gobaba','goku','gopax','graviex','hanbitco','hbtc','hbtc_futures','hb_top','hitbtc','hoo','hopex','hotbit','hpx','hubi','huobi','huobi_dm','huobi_id','huobi_japan','huobi_korea','huobi_thailand','ice3x','idcm','incorex','independent_reserve','indodax','infinity_coin','instantbitex','iqfinex','itbit','jex','jex_futures','kkcoin','k_kex','korbit','kraken','kraken_futures','kucoin','kumex','kuna','lakebtc','latoken','lbank','liquid_derivatives','localtrade','lucent','lukki','luno','lykke','max_maicoin','mercado_bitcoin','mercatox','mercuriex','multi','mxc','mxc_futures','mycoinstory','namebase','nami_exchange','nanu_exchange','narkasa','negociecoins','neraex','nice_hash','nlexch','nominex','novadax','oceanex','okcoin','okex','okex_korea','okex_swap','omgfin','omnitrade','otcbtc','ovex','p2pb2b','paribu','paroexchange','paymium','phemex','phemex_futures','poloniex','poloniex_futures','prime_xbt','probit','qtrade','quoine','resfinex','rfinex','safe_trade','satoexchange','secondbtc','shortex','simex','sinegy','zbx','sistemkoin','six_x','south_xchange','stake_cube','stocks_exchange','stormgain','stormgain_futures','swiftex','tdax','therocktrading','thodex','tidebit','tidex','tokenize','tokenomy','tokens_net','toko_crypto','tokok','tokpie','topbtc','trade_ogre','txbit','unnamed','upbit','upbit_indonesia','vb','vcc','vebitcoin','velic','vindax','vinex','virgox','waves','wazirx','whale_ex','whitebit','xcoex','xfutures','xt','yobit','yunex','zaif','zb','zbg','zbg_futures','zebitex','zebpay','zg','zgtop','zipmex','biconomy','wootrade'];

export const dex = ['aave','allbit','anyswap','bakeryswap','balancer','balancer_v1','bamboo_relay','bancor','bepswap','binance_dex','binance_dex_mini','birake','bisq','bitcratic','blockonix','bscswap','burgerswap','compound_finance','cream_swap','cream_swap_v1','curve','wault_swap','cybex','ddex','dem_exchange','deversifi','dex_blue','dodo','dolomite','dydx','dydx_perpetual','defi_swap','zero_exchange','value_liquid_bsc','apeswap','comethswap','unicly','sushiswap_fantom','polyzap','ethex','everbloom','forkdelta','swop_fi','secretswap','pantherswap','zilswap','dydx_perpetual_l1','futureswap','honeyswap','spookyswap','idex','dodo_bsc','joyso','justswap','kyber_network','zkswap','leverj','linkswap','loopring','loopring_amm','luaswap','dmm','sushiswap_polygon','swapr','mdex_bsc','ubeswap','sushiswap_xdai','mcdex','mdex','mesa','mirror','mooniswap','nash','viperswap','neblidex','newdex','nexus_mutual','oasis_trade','one_inch','one_inch_liquidity_protocol','spiritswap','orderbook','pancakeswap','pangolin','paraswap','raydium','perpetual_protocol','polyient_dex','quickswap','julswap','radar_relay','sakeswap','sashimiswap','saturn_network','serum_dex','serumswap','stellar_term','streetswap','sushiswap','switcheo','synthetix','tokenlon','token_sets','tomodex','dfyn','levinswap_xdai','tron_trade','trx_market','uniswap','uniswap_v1','uniswap_v2','vitex','value_liquid','zero_ex','pancakeswap_others','kuswap','shibaswap','pancakeswap_new','osmosis','waultswap_polygon'];

export const timeRanges = [
  { day: 1, short: '24h', title: '24 Hours' },
  { day: 7, short: '7d', title: '7 Days' },
  { day: 30, short: '30d', title: '30 Days' },
  { day: 90, short: '90d', title: '90 Days' },
  { day: 365, short: '52w', title: '52 Weeks' },
];

export const capitalize = s => typeof s !== 'string' ? '' : s.trim().replaceAll(' ', '_').replaceAll('-', '_').split('_').map(x => x.trim()).filter(x => x).map(x => `${x.substr(0, 1).toUpperCase()}${x.substr(1)}`).join(' ');

export const getName = (name, isCapitalize, data) => {
  if (data && data.name && dynamicPaths.indexOf(name) < 0) {
    name = data.name;
    isCapitalize = false;
  }
  const namesMap = {
    defi: 'DeFi',
    nfts: 'NFTs',
    dex: 'DEX',
    term: 'Terms of Service',
    privacy: 'Privacy Policy',
    about: 'About Us',
  };
  return namesMap[name] ? namesMap[name] : isCapitalize ? name && name.length <= 3 ? name.toUpperCase() : capitalize(name) : name;
};

export const getLocationData = window => {
  const locationData = {};
  try {
    const location = window.location;
    if (location) {
      const fields = ['href', 'protocol', 'host', 'hostname', 'port', 'pathname', 'search', 'hash'];
      fields.forEach(field => {
        if (location[field]) {
          locationData[field] = location[field];
        }
      });
      locationData.hash = location.hash && location.hash.indexOf('?') > -1 ? location.hash.substring(0, location.hash.indexOf('?')) : location.hash;
      let search = location.hash && location.hash.indexOf('?') > -1 ? location.hash.substring(location.hash.indexOf('?')) : location.search;
      locationData.search = search;
      while (search.startsWith('?')) {
        search = search.substring(1);
      }
      search = search.split('&');
      const params = {};
      search.forEach(param => {
        if (param && param.indexOf('=') > -1) {
          const key = param.substring(0, param.indexOf('='));
          const value = decodeURIComponent(param.substring(param.indexOf('=') + 1, param.length));
          params[key] = value;
        }
      });
      locationData.params = params;
    }
  } catch (err) {}
  return locationData;
};

export const explorerChains = menus[0].subMenu[2][0].subMenu;

export const getPathHeaderMeta = (path, data) => {
  path = !path ? '/' : path.toLowerCase();
  path = path.startsWith('/widget/') ? path.substring('/widget'.length) : path;
  const pathSplitted = path.split('/').filter(x => x);
  const breadcrumb = pathSplitted.filter((x, i) => !(pathSplitted[0] === 'explorer' && i > 1)).map((x, i) => { return { title: getName(x, true, data), path: i === pathSplitted.length - 1 ? path : `/${pathSplitted.slice(0, i - (pathSplitted[0] === 'explorer' && pathSplitted[2] === 'tx' ? 2 : 1)).map(x => `${x}${dynamicPaths.indexOf(x) > -1 ? 's' : ''}`).join('/')}` } });
  let title = `${_.cloneDeep(pathSplitted).reverse().map(x => getName(x, true, data)).join(' - ')}${pathSplitted.length > 0 ? ` | ${process.env.REACT_APP_APP_NAME}` : process.env.REACT_APP_DEFAULT_TITLE}`;
  let description = process.env.REACT_APP_DEFAULT_DESCRIPTION;
  let image = `${process.env.REACT_APP_AWS_S3_URL}/${process.env.REACT_APP_AWS_S3_BUCKET}/metatag_OGimage.png`;
  const url = `${process.env.REACT_APP_SITE_URL}${path}`;
  if (pathSplitted[0] === 'coins') {
    if (pathSplitted[1] === 'high-volume') {
      title = `Top Cryptocurrency Prices by High Volume | ${process.env.REACT_APP_APP_NAME}`;
      description = `Get the top latest cryptocurrency prices ranking by their trade volume - including their market cap, percentage changes, chart, liquidity, and more.`;
    }
    else if (pathSplitted[1] === 'categories') {
      title = `Top Cryptocurrency Categories by Market Cap | ${process.env.REACT_APP_APP_NAME}`;
      description = `Get the top latest cryptocurrency categories ranking by their market cap - including their trade volume, percentage changes, chart, liquidity, and more.`;
    }
    else if (pathSplitted[1] === 'defi') {
      title = `Top Decentralized Finance (DeFi) Coins by Market Cap | ${process.env.REACT_APP_APP_NAME}`;
      description = `Get the top latest decentralized finance (DeFi) coins prices ranking by their market cap - including their trade volume, percentage changes, chart, liquidity, and more.`;
    }
    else if (pathSplitted[1] === 'nfts') {
      title = `Top NFTs & Collectibles Coins by Market Cap | ${process.env.REACT_APP_APP_NAME}`;
      description = `Get the top latest NFT (Non-fungible Token) token prices, market cap, percentage changes, chart, liquidity, and more.`;
    }
    else if (pathSplitted[1] === 'bsc') {
      title = `Binance Smart Chain (BSC) Ecosystem by Market Cap | ${process.env.REACT_APP_APP_NAME}`;
      description = `Get top latest coins built on top of or are a part of the Binance Smart Chain (BSC) ecosystem with their prices, market cap, percentage changes, chart, liquidity, and more.`;
    }
    else if (pathSplitted[1] === 'polkadot') {
      title = `Polkadot (DOT) Ecosystem by Market Cap | ${process.env.REACT_APP_APP_NAME}`;
      description = `Get top latest coins built on top of or are a part of the Polkadot (DOT) ecosystem with their prices, market cap, percentage changes, chart, liquidity, and more.`;
    }
    else if (pathSplitted[1] === 'watchlist') {
    }
    else if (pathSplitted[1]) {
      title = `${capitalize(pathSplitted[1])} by Market Cap | ${process.env.REACT_APP_APP_NAME}`;
      description = `Get top latest coins built on top of or are a part of the ${capitalize(pathSplitted[1])} with their prices, market cap, percentage changes, chart, liquidity, and more.`;
    }
    else {
      title = `Top Cryptocurrency Prices by Market Cap | ${process.env.REACT_APP_APP_NAME}`;
      description = `Get the top latest cryptocurrency prices ranking by their market cap - including their trade volume, percentage changes, chart, liquidity, and more.`;
    }
  }
  else if (pathSplitted[0] === 'coin') {
    if (data) {
      title = `${data.name} Price to USD | ${data.symbol ? data.symbol.toUpperCase() : data.name} Value, Markets, Chart | ${process.env.REACT_APP_APP_NAME}`;
      description = `Explore what ${data.name} is. Get the ${data.symbol ? data.symbol.toUpperCase() : data.name} price today and convert it to your currencies; USDT, Dollars, CNY, JPY, HKD, AUD, NAIRA, EUR, GBP, THB, INR. See the BUY SELL indicator, chart history analysis, and news for FREE.`;
      image = data.image && data.image.large ? data.image.large : image;
    }
  }
  else if (pathSplitted[0] === 'explorer') {
    if (pathSplitted[1]) {
      const chainIndex = explorerChains.findIndex(c => c.path === _.slice(pathSplitted, 0, 2).map(p => `/${p}`).join(''));
      if (chainIndex > -1) {
        title = `${explorerChains[chainIndex].title} (${getName(explorerChains[chainIndex].network, true)}) Explorer | ${process.env.REACT_APP_APP_NAME}`;
        description = `Explore and search the ${explorerChains[chainIndex].title} blockchain for addresses and transactions.`;
        image = explorerChains[chainIndex].logo_url;
      }
      if (pathSplitted[2] === 'tx') {
        title = `${explorerChains[chainIndex].title} Transaction Hash: ${pathSplitted[3]} | ${process.env.REACT_APP_APP_NAME}`;
        description = `${explorerChains[chainIndex].title} detailed transaction info for txhash ${pathSplitted[3]}. The transaction status, block, gas fee, and token transfer are shown.`;
      }
      else if (pathSplitted[2]) {
        title = `${explorerChains[chainIndex].title} address: ${pathSplitted[2]} | ${process.env.REACT_APP_APP_NAME}`;
        description = `You can view balances, token holdings and transactions of ${explorerChains[chainIndex].title} address ${pathSplitted[2]}.`;
      }
    }
  }
  else if (pathSplitted[0] === 'derivatives') {
    if (pathSplitted[1] === 'futures') {
      title = `Today's Top Cryptocurrency Futures Contract by Open Interest | ${process.env.REACT_APP_APP_NAME}`;
      description = `Get the top cryptocurrency futures contract by open interest and trading volume. See their volume, changes percentage, prices history, and so on.`;
    }
    else {
      title = `Today's Top Cryptocurrency Derivatives by Open Interest | ${process.env.REACT_APP_APP_NAME}`;
      description = `Get the top cryptocurrency derivatives perpetual contract by open interest and trading volume. See their volume, changes percentage, prices history, and so on.`;
    }
  }
  else if (pathSplitted[0] === 'exchanges') {
    if (pathSplitted[1] === 'dex') {
      title = `Today's Top Decentralized Exchanges by Volume | ${process.env.REACT_APP_APP_NAME}`;
      description = `See the top decentralized exchanges (DEX) ranking by volume. See their information including country, volume, market share, and so on.`;
    }
    else if (pathSplitted[1] === 'derivatives') {
      title = `Today's Top Cryptocurrency Derivatives Exchanges by Volume | ${process.env.REACT_APP_APP_NAME}`;
      description = `See the top cryptocurrency derivatives exchanges ranking by open interest. See their information including country, volume, market share, and so on.`;
    }
    else {
      title = `Today's Top Cryptocurrency Exchanges by Confidence | ${process.env.REACT_APP_APP_NAME}`;
      description = `See the top spot cryptocurrency exchanges ranking by confidence. See their information including country, volume, market share, and so on.`;
    }
  }
  else if (pathSplitted[0] === 'exchange') {
    if (data) {
      title = `${data.name} Trade Volume, Trade Pairs, Market Listing | ${process.env.REACT_APP_APP_NAME}`;
      description = `Find out ${data.name} trading volume, fees, pair list and other updated information. See the most actively traded coins on ${data.name}.`;
      image = typeof data.image === 'string' ? data.image.replace('small', 'large') : image;
    }
  }
  else if (pathSplitted[0] === 'news') {
    title = `Today's Latest Cryptocurrency News | ${process.env.REACT_APP_APP_NAME}`;
    description = `Keep up with breaking news on cryptocurrencies that influence the market.`;
  }
  else if (pathSplitted[0] === 'updates') {
    title = `Cryptocurrency Project Update | ${process.env.REACT_APP_APP_NAME}`;
    description = `Keep up with significant cryptocurrency projects' updates, including milestone updates, partnership, fund movement, etc.`;
  }
  else if (pathSplitted[0] === 'events') {
    title = `Cryptocurrency Events | ${process.env.REACT_APP_APP_NAME}`;
    description = `Check updated events, conferences, meetups information of cryptocurrency projects.`;
  }
  else if (pathSplitted[0] === 'blog') {
    if (pathSplitted[1] && data && data.meta) {
      const blogBaseUrl = `${process.env.REACT_APP_AWS_S3_URL}/${process.env.REACT_APP_AWS_S3_BUCKET}/blog`;
      title = data.meta.title ? data.meta.title : title;
      description = data.meta.description ? data.meta.description : description;
      image = data.meta.image ? `${blogBaseUrl}/${pathSplitted[1]}/${pathSplitted[2] ? `posts/${pathSplitted[2]}/` : ''}assets/${data.meta.image}` : image;
    }
    else {
      title = `Cryptocurrency, Blockchain Technology, and Trading Blog | ${process.env.REACT_APP_APP_NAME}`;
      description = `Read our high-quality and free blog post covering the cryptocurrency world and blockchain technology.`;
    }
  }
  else if (pathSplitted[0] === 'widgets') {
    title = `Free Cryptocurrency Widgets | ${process.env.REACT_APP_APP_NAME}`;
    description = `Embed ${process.env.REACT_APP_APP_NAME}'s cryptocurrency widgets to your website or blog for free.`;
  }
  return { browser_title: title, title, description, url, image, breadcrumb };
};

// function for remove decimals end with 000...
export const numberOptimizeDecimal = number => {
  if (typeof number === 'number') {
    number = number.toString();
  }
  if (number === 'NaN') {
    return '<0.00000001';
  }
  if (typeof number === 'string') {
    if (number.indexOf('.') > -1) {
      let decimal = number.substring(number.indexOf('.') + 1);
      while (decimal.endsWith('0')) {
        decimal = decimal.substring(0, decimal.length - 1);
      }
      if (number.substring(0, number.indexOf('.')).length >= 7 && decimal.length > 2 && !isNaN(`0.${decimal}`)) {
        decimal = Number(`0.${decimal}`).toFixed(2).toString();
        if (decimal.indexOf('.') > -1) {
          decimal = decimal.substring(decimal.indexOf('.') + 1);
          while (decimal.endsWith('0')) {
            decimal = decimal.substring(0, decimal.length - 1);
          }
        }
      }
      return `${number.substring(0, number.indexOf('.'))}${decimal ? '.' : ''}${decimal}`;
    }
    return number;
  }
  return '';
};

export const setTradeUrl = t => !t.trade_url && t.market && t.market.identifier === 'bitstamp' ? `https://www.${t.market.identifier}.net/markets/${t.base && t.base.toLowerCase()}/${t.target && t.target.toLowerCase()}` : t.trade_url && t.trade_url.indexOf('www.bitrue.com') > -1 ? `https://www.bitrue.com/trade/${t.base && t.base.toLowerCase()}_${t.target && t.target.toLowerCase()}` : t.trade_url === 'https://pro.changelly.com' ? `${t.trade_url}/?from=${t.base}&to=${t.target}` : !t.trade_url && t.market && t.market.identifier === 'gemini' ? `https://exchange.gemini.com/buy/${t.base && t.base.toUpperCase()}${t.target && t.target.toUpperCase()}` : t.trade_url;

export const exchangeReferrals = {
  ftx: { id: 'ftx_spot', code: '10237779', reward_commission_percent: 25, discount_commission_percent: 5, exchange_ids: ['ftx_spot', 'ftx'] },
  binance: { id: 'binance', code: 'U2QW5HSA'/*'38193903'*/, reward_commission_percent: 10, discount_commission_percent: 10, exchange_ids: ['binance', 'binance_futures'] },
  coinbase: { id: 'gdax', code: '9251' },
  kraken: { id: 'kraken', code: '10583' },
  bitfinex: { id: 'bitfinex', code: 'BG4ZysMMB' },
  gate: { id: 'gate', code: '3159833', reward_commission_percent: 20, discount_commission_percent: 20, exchange_ids: ['gate', 'gate_futures'] },
  gemini: { id: 'gemini', code: '' },
  crypto: { id: 'crypto_com', code: '' },
  huobi_global: { id: 'huobi', code: '8z6g8' },
  okex: { id: 'okex', code: '3781714' },
  kucoin: { id: 'kucoin', code: 'rJ31MYJ' },
  poloniex: { id: 'poloniex', code: 'LS632G9R', reward_commission_percent: 20, discount_commission_percent: 10, exchange_ids: ['poloniex'] },
  latoken: { id: 'latoken', code: 'cpy9ir968m' },
  bithumb_pro: { id: 'bithumb_global', code: '299eat', reward_commission_percent: 10, discount_commission_percent: 10, exchange_ids: ['bithumb_global'] },
  bitkub: { id: 'bitkub', code: '52244' },
  bkex: { id: 'bkex', code: 'FUWQBRWQ' },
  bitrue: { id: 'bitrue', code: 'UBBSmjbe' },
  bitmex: { id: 'bitmex', code: 'fdc3ji' },
  bybit: { id: 'bybit', code: '15895' },
  cex: { id: 'cex', code: 'up136014827' },
  changelly: { id: 'changelly', code: 'zlv6bmmuf7vv9rwe' },
  bitmart: { id: 'bitmart', code: 'Pp5xEb' },
  mxc: { id: 'mxc', code: '15fmF' },
  coinlist: { id: 'coinlist', code: 'FGKPXQ' },
  xcoins: { code: '1586' },
  paxful: { code: 'Z3k3RpbAqYb' },
  changenow: { code: 'b6b2d58cce293d' },
};

export const setAffiliateLinks = urls => {
  const isArray = Array.isArray(urls);
  if (!urls) {
    urls = [];
  }
  else if (typeof urls === 'string') {
    urls = [urls];
  }
  urls = urls.map(url => {
    try {
      const u = new URL(url);
      const hostname = u.hostname;
      if (hostname === 'www.binance.com' || hostname === 'www.binance.us') {
        url = `${u.protocol}//${hostname}${u.pathname}?ref=${exchangeReferrals.binance.code}`;
      }
      else if (hostname === 'www.coinbase.com') {
        url = `${u.protocol}//coinbase-consumer.sjv.io/c/2664740/552039/${exchangeReferrals.coinbase.code}`;
      }
      else if (hostname === 'r.kraken.com' || hostname === 'futures.kraken.com') {
        if (u.pathname.indexOf('/dashboard') < 0) {
          url = `${u.protocol}//r.kraken.com/c/2664740/741638/${exchangeReferrals.kraken.code}`;
        }
      }
      else if (hostname === 'www.bitfinex.com') {
        url = `${u.protocol}//${hostname}${u.pathname}?refcode=${exchangeReferrals.bitfinex.code}`;
      }
      else if (hostname === 'gate.io' || hostname === 'www.gate.io') {
        url = `${u.protocol}//${hostname}${u.pathname.indexOf('trade/') > -1 ? `${u.pathname}?ref=` : '/signup/'}${exchangeReferrals.gate.code}`;
      }
      else if (hostname === 'ftx.com' || hostname === 'ftx.us') {
        if (u.pathname.indexOf('/trade') < 0) {
          url = `${u.protocol}//${hostname}/#a=${exchangeReferrals.ftx.code}`;
        }
      }
      else if (hostname === 'crypto.com') {
        if (u.pathname.indexOf('/trade') < 0) {
          url = `${u.protocol}//${hostname}${u.pathname}/${exchangeReferrals.crypto.code}`;
        }
      }
      else if (hostname === 'gemini.sjv.io') {
        // url = `${u.protocol}//${hostname}/${exchangeReferrals.gemini.code}`;
        url = `${u.protocol}//www.gemini.com`;
      }
      else if (hostname === 'www.huobi.com' || hostname === 'www.hbdm.com' || hostname === 'dm.huobi.com') {
        url = `${u.protocol}//www.huobi.com/en-us/topic/invited/?invite_code=${exchangeReferrals.huobi_global.code}`;
      }
      else if (hostname === 'www.okex.com') {
        if (u.pathname.indexOf('/market') < 0 && u.pathname.indexOf('/future') < 0 && u.pathname.indexOf('/trade') < 0) {
          url = `${u.protocol}//${hostname}/join/${exchangeReferrals.okex.code}`;
        }
        else if (u.pathname.indexOf('/market') > -1) {
          url = `${u.protocol}//${hostname}/spot/trade${u.search.replace('?product=', '/').replace('_', '-')}`;
        }
      }
      else if (hostname === 'www.bitstamp.net') {
        // wait
      }
      else if (hostname === 'www.kucoin.com' || hostname === 'futures.kucoin.com') {
        if (u.pathname.indexOf('/trade') < 0 || hostname === 'futures.kucoin.com') {
          url = `${u.protocol}//www.kucoin.com/ucenter/signup?rcode=${exchangeReferrals.kucoin.code}`;
        }
      }
      else if (hostname === 'bittrex.com') {

      }
      else if (hostname === 'poloniex.com') {
        if (u.pathname.indexOf('/exchange') < 0 && u.pathname.indexOf('/futures') < 0) {
          url = `${u.protocol}//${hostname}/signup?c=${exchangeReferrals.poloniex.code}`;
        }
      }
      else if (hostname === 'latoken.com') {
        if (u.pathname.indexOf('/exchange') < 0) {
          url = `${u.protocol}//${hostname}/invite?r=${exchangeReferrals.latoken.code}`;
        }
      }
      else if (hostname === 'bithumb.pro') {
        url = `${u.protocol}//${hostname}/register;i=${exchangeReferrals.bithumb_pro.code}`;
      }
      else if (hostname === 'www.bitkub.com') {
        if (u.pathname.indexOf('/market') < 0) {
          url = `${u.protocol}//${hostname}/signup?ref=${exchangeReferrals.bitkub.code}`;
        }
      }
      else if (hostname === 'www.bitopro.com') {

      }
      else if (hostname === 'www.nicehash.com') {
        // wait
      }
      else if (hostname === 'www.bkex.com') {
        if (u.pathname.indexOf('/trade') < 0 && u.hash.indexOf('/trade') < 0) {
          url = `${u.protocol}//${hostname}/register/${exchangeReferrals.bkex.code}`;
        }
      }
      else if (hostname === 'www.xt.com') {

      }
      else if (hostname === 'whitebit.com') {

      }
      else if (hostname === 'www.bitrue.com') {
        if (u.pathname.indexOf('/trading') < 0 && u.pathname.indexOf('/trade') < 0) {
          url = `${u.protocol}//${hostname}/activity/task/task-landing?inviteCode=${exchangeReferrals.bitrue.code}&cn=900000`;
        }
        else if (u.pathname.indexOf('/trade') > -1) {
          url = `${u.protocol}//${hostname}${u.pathname}?inviteCode=${exchangeReferrals.bitrue.code}`;
        }
      }
      else if (hostname === 'www.hoo.com') {

      }
      else if (hostname === 'coinsbit.io') {

      }
      else if (hostname === 'www.coinbene.com') {

      }
      else if (hostname === 'bitflyer.com') {
        // wait
      }
      else if (hostname === 'www.bitmex.com') {
        if (u.pathname.indexOf('/trade') < 0) {
          url = `${u.protocol}//${hostname}/register/${exchangeReferrals.bitmex.code}`;
        }
      }
      else if (hostname === 'www.bybit.com') {
        if (u.pathname.indexOf('/exchange') > -1) {
          url = `${u.protocol}//${hostname}${u.pathname}?affiliate_id=${exchangeReferrals.bybit.code}&language=en-US&group_id=0&group_type=1`;
        }
        else {
          url = `${u.protocol}//partner.bybit.com/b/${exchangeReferrals.bybit.code}`;
        }
      }
      else if (hostname === 'cex.io') {
        url = `${u.protocol}//${hostname}/r/0/${exchangeReferrals.cex.code}/0/`;
      }
      else if (hostname === 'pro.changelly.com') {
        url = `${u.protocol}//changelly.com${u.search ? u.search.toLowerCase() : '?from=btc&to=usdt'}&amount=0.1&ref_id=${exchangeReferrals.changelly.code}`
      }
      else if (hostname === 'etoro.com') {
        // wait
      }
      else if (hostname === 'exmo.com') {
        // wait
      }
      else if (hostname === 'www.bitmart.com') {
        url = `${u.protocol}//${hostname}${u.pathname}${u.search ? `${u.search}&` : '?'}r=${exchangeReferrals.bitmart.code}`;
      }
      else if (hostname === 'www.mxc.com') {
        if (u.pathname.indexOf('/trade') < 0) {
          url = `${u.protocol}//${hostname}/auth/signup?inviteCode=${exchangeReferrals.mxc.code}`;
        }
      }
      else if (hostname === 'pro.coinlist.co') {
        if (u.pathname.indexOf('/trader') < 0) {
          url = `${u.protocol}//coinlist.co/clt?referral_code=${exchangeReferrals.coinlist.code}`;
        }
      }
      // not on list
      else if (hostname === 'www.xcoins.com') {
        url = `${u.protocol}//${hostname}/2020/r.php?id=${exchangeReferrals.xcoins.code}`;
      }
      else if (hostname === 'paxful.com') {
        url = `${u.protocol}//${hostname}/?r=${exchangeReferrals.paxful.code}`;
      }
      else if (hostname === 'www.coinmama.com') {
        // wait
      }
      else if (hostname === 'changenow.io') {
        url = `${u.protocol}//${hostname}?link_id=${exchangeReferrals.changenow.code}`;
      }
    } catch (err) {}
    return url;
  });
  return isArray ? urls : urls.join('');
};

export const customTradeExchange = [
  { id: 'binance', url: 'https://www.binance.com', trade_url: 'https://www.binance.com/en/trade/{base}_{target}', isUpperCase: true, default_target: 'usdt', support_coins: [{ base: 'bitcoin' }, { base: 'ethereum' }, { base: 'dogecoin' }, { base: 'polkadot' }, { base: 'binance-usd' }, { base: 'ripple' }, { base: 'storm' }, { base: 'aave' }, { base: 'litecoin' }, { base: 'chainlink' }, { base: 'cardano' }, { base: 'uniswap' }, { base: 'binancecoin' }, { base: 'sushi' } ] },
  { id: 'gdax', url: 'https://www.coinbase.com', trade_url: 'https://pro.coinbase.com/trade/{base}-{target}', isUpperCase: true, default_target: 'usd', support_coins: [{ base: 'bitcoin' }, { base: 'ethereum' }, { base: 'uma' }, { base: 'aave' }, { base: 'uniswap' }, { base: 'chainlink' }, { base: 'stellar' }, { base: 'litecoin' }, { base: 'the-graph' }, { base: 'algorand' }, { base: 'omisego' } ] },
  { id: 'kraken', url: 'https://r.kraken.com', trade_url: 'https://trade.kraken.com/markets/kraken/{base}/{target}', default_target: 'usd', support_coins: [{ base: 'bitcoin' }, { base: 'ethereum' }, { base: 'tether' }, { base: 'dogecoin' }, { base: 'polkadot' }, { base: 'ripple' }, { base: 'cardano' }, { base: 'chainlink' }, { base: 'litecoin' }, { base: 'aave' } ] },
  { id: 'bitfinex', url: 'https://www.bitfinex.com', trade_url: 'https://www.bitfinex.com/t/{base}{target}', isUpperCase: true, default_target: 'usd', support_coins: [{ base: 'bitcoin' }, { base: 'ethereum' }, { base: 'tether' }, { base: 'ripple' }, { base: 'uniswap' }, { base: 'litecoin' }, { base: 'polkadot' }, { base: 'chainlink' }, { base: 'litecoin' }, { base: 'eos' }, { base: 'sushi' } ] },
  { id: 'gate', url: 'https://gate.io', trade_url: 'https://gate.io/trade/{base}_{target}', isUpperCase: true, default_target: 'usdt', support_coins: [{ base: 'bitcoin' }, { base: 'ethereum' }, { base: 'polkadot' }, { base: 'dogecoin' }, { base: 'ripple' }, { base: 'litecoin' }, { base: 'uniswap' }, { base: 'sushi' }, { base: '1inch' }, { base: 'aave' }, { base: 'eos' }, { base: 'chainlink' } ] },
  { id: 'ftx_spot', url: 'https://ftx.com', trade_url: 'https://ftx.com/trade/{base}/{target}', isUpperCase: true, default_target: 'usd', support_coins: [{ base: 'bitcoin' }, { base: 'ethereum' }, { base: 'tether' }, { base: 'ftx-token' }, { base: 'solana' }, { base: 'bmax' }, { base: 'sushi' }, { base: 'litecoin' }, { base: 'dogecoin' }, { base: 'binancecoin' }, { base: 'chainlink' } ] },
  { id: 'huobi', url: 'https://www.huobi.com', trade_url: 'https://www.hbg.com/en-us/exchange/?s={base}_{target}', default_target: 'usdt', support_coins: [{ base: 'bitcoin' }, { base: 'ethereum' }, { base: 'dogecoin' }, { base: 'polkadot' }, { base: 'ripple' }, { base: 'litecoin' }, { base: 'uniswap' }, { base: 'tron' }, { base: 'chainlink' }, { base: 'sushi' }, { base: 'eos' }, { base: 'houbi-token' }, { base: 'aave' }, { base: 'cardano' } ] },
  { id: 'okex', url: 'https://www.okex.com', trade_url: 'https://www.okex.com/market?product={base}_{target}', default_target: 'usdt', support_coins: [{ base: 'bitcoin' }, { base: 'ethereum' }, { base: 'dogecoin' }, { base: 'aave' }, { base: 'polkadot' }, { base: 'uniswap' }, { base: 'uma' }, { base: 'sushi' }, { base: 'litecoin' }, { base: 'chainlink' }, { base: 'stellar' }, { base: 'ripple' }, { base: 'okb' }, { base: 'omisego' } ] },
  { id: 'bitstamp', url: 'https://www.bitstamp.net', trade_url: 'https://www.bitstamp.net/markets/{base}/{target}', default_target: 'usd', support_coins: [{ base: 'bitcoin' }, { base: 'ethereum' }, { base: 'ripple' }, { base: 'litecoin' }, { base: 'stellar' }, { base: 'chainlink' }, { base: 'omisego' } ] },
  { id: 'bitrue', url: 'https://www.bitrue.com', trade_url: 'https://www.bitrue.com/trade/{base}_{target}', default_target: 'usdt', support_coins: [{ base: 'bitcoin' }, { base: 'ethereum' }, { base: 'ripple' }, { base: 'cardano' }, { base: 'litecoin' }, { base: 'stellar' }, { base: 'tron' }, { base: 'vechain' }, { base: 'chainlink' }, { base: 'eos' } ] },
  { id: 'kucoin', url: 'https://www.kucoin.com', trade_url: 'https://www.kucoin.com/trade/{base}-{target}', isUpperCase: true, default_target: 'usdt', support_coins: [{ base: 'bitcoin' }, { base: 'ethereum' }, { base: 'ripple' }, { base: 'polkadot' }, { base: 'litecoin' }, { base: 'aave' }, { base: 'kucoin-shares' }, { base: 'cardano' }, { base: 'ampleforth' }, { base: 'chainlink' }, { base: 'uniswap' }, { base: 'stellar' }, { base: 'terra-luna' }, { base: '1inch' } ] },
];

export const getTradeData = (coin, allCryptoData, tickers) => {
  let trades = [];
  if (coin && coin.id) {
    trades = customTradeExchange.map(ex => {
      let tickersTradeUrls = tickers ? tickers.filter(t => t.market && t.market.identifier === ex.id && t.trade_url && t.base && coin.symbol && t.base.toLowerCase() === coin.symbol.toLowerCase()) : [];
      tickersTradeUrls = tickersTradeUrls.findIndex(t => t.target && t.target.toLowerCase() === ex.default_target) > -1 ? tickersTradeUrls.filter(t => t.target && t.target.toLowerCase() === ex.default_target) : tickersTradeUrls;
      return {
        exchange: allCryptoData && allCryptoData.exchanges && allCryptoData.exchanges.findIndex(e => e.id === ex.id) > -1 ? allCryptoData.exchanges[allCryptoData.exchanges.findIndex(e => e.id === ex.id)] : ex,
        url: setAffiliateLinks(ex.support_coins.findIndex(c => c.base === coin.id) > -1 ? ex.trade_url.replace('{base}', ex.isUpperCase ? (coin.symbol || coin.id).toUpperCase() : (coin.symbol || coin.id).toLowerCase()).replace('{target}', ex.isUpperCase ? ex.default_target.toUpperCase() : ex.default_target.toLowerCase()) : tickersTradeUrls.length > 0 ? tickersTradeUrls[0].trade_url : ex.url),
      };
    });
  }
  return trades;
};
