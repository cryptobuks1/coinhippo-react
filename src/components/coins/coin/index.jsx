import React, { Fragment, useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { VS_CURRENCY, THEME, GLOBAL_DATA, ALL_CRYPTO_DATA, EXCHANGE_RATES_DATA, ALL_PAPRIKA_COINS_DATA } from '../../../redux/types';
import { Container, Row, Col, Card, CardHeader, CardBody, Media, Badge, Progress, Dropdown, DropdownMenu, DropdownItem, Input, Nav, NavItem, NavLink, Table, Button } from 'reactstrap';
import { message } from 'antd';
import { Layout, Search, Globe, MessageCircle, Code, FileText, ChevronDown, ChevronUp, ExternalLink, Copy, Droplet, Facebook, Twitter, GitHub, Eye, Star, Users, GitMerge, GitCommit, AlertCircle, Info, CheckCircle, XCircle, Briefcase, BarChart2 } from 'react-feather';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import parse from 'html-react-parser';
import Linkify from 'react-linkify';
import Chart from 'react-apexcharts';
import TradingViewWidget, { Themes } from 'react-tradingview-widget';
import { LiteYouTubeEmbed } from 'react-lite-youtube-embed';
import _ from 'lodash';
import moment from 'moment';
import numeral from 'numeral';
import Spinner from '../../spinner';
import Ads from '../../../components/ads';
import Error404 from '../../../pages/errors/error404';
import sad from '../../../assets/images/other-images/sad.png';
import ConfigDB from '../../../data/customizer/config';
import coingecko from '../../../assets/images/logo/api/CoinGecko Logo.png';
import { currenciesGroups } from '../../../layout/header/menus';
import { getCoin, getCoinTickers, getCoinMarketChart, getCoinOHLC } from '../../../api';
import { useIsMountedRef, sleep, timeRanges, getName, numberOptimizeDecimal, getTradeData } from '../../../utils';

const Coin = props => {
  const pageSize = 100;
  const coinId = props.match ? props.match.params.coin_id : null;
  const isMountedRef = useIsMountedRef();
  const currency = useSelector(content => content.Preferences[VS_CURRENCY]);
  const theme = useSelector(content => content.Preferences[THEME]);
  const globalData = useSelector(content => content.Data[GLOBAL_DATA]);
  const allCryptoData = useSelector(content => content.Data[ALL_CRYPTO_DATA]);
  const exchangeRatesData = useSelector(content => content.Data[EXCHANGE_RATES_DATA]);
  const allPaprikaCoinsData = useSelector(content => content.Data[ALL_PAPRIKA_COINS_DATA]);

  const [data, setData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [dataShowMore, setDataShowMore] = useState([]);
  const [chartTypeSelected, setChartTypeSelected] = useState('line');
  const [chartTimeSelected, setChartTimeSelected] = useState(30);
  const [marketChartDataMap, setMarketChartDataMap] = useState({});
  const [marketChartLoading, setMarketChartLoading] = useState(false);
  const [ohlcDataMap, setOhlcDataMap] = useState({});
  const [ohlcChartLoading, setOhlcChartLoading] = useState(false);
  const [exchangesSelected, setExchangesSelected] = useState(false);
  const [explorersSelected, setExplorersSelected] = useState(false);
  const [communitySelected, setCommunitySelected] = useState(false);
  const [sourceCodeSelected, setSourceCodeSelected] = useState(false);
  const [contractsSelected, setContractsSelected] = useState(false);
  const [redditShowMore, setRedditShowMore] = useState(false);
  const [gitShowMore, setGitShowMore] = useState(false);
  const [fromCurrencyValue, setFromCurrencyValue] = useState('');
  const [toCurrencyValue, setToCurrencyValue] = useState('');
  const [tickers, setTickers] = useState([]);
  const [marketSort, setMarketSort] = useState({ field: null, direction: 'asc' });
  const [marketPage, setMarketPage] = useState(-1);
  const [marketPageEnd, setMarketPageEnd] = useState(false);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketSearch, setMarketSearch] = useState('');

  const statsRef = useRef(null);
  const analysisRef = useRef(null);
  const tableRef = useRef(null);

  const useWindowSize = () => {
    const [size, setSize] = useState(null);
    useLayoutEffect(() => {
      const updateSize = () => setSize(window.screen.width);
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
  };
  const width = useWindowSize();

  const onExchangesSelected = selected => {
    if (isMountedRef.current) {
      setExplorersSelected(false);
      setCommunitySelected(false);
      setSourceCodeSelected(false);
      setContractsSelected(false);
      setExchangesSelected(selected);
    }
  };

  const onExplorersSelected = selected => {
    if (isMountedRef.current) {
      setExchangesSelected(false);
      setCommunitySelected(false);
      setSourceCodeSelected(false);
      setContractsSelected(false);
      setExplorersSelected(selected);
    }
  };

  const onCommunitySelected = selected => {
    if (isMountedRef.current) {
      setExchangesSelected(false);
      setExplorersSelected(false);
      setSourceCodeSelected(false);
      setContractsSelected(false);
      setCommunitySelected(selected);
    }
  };

  const onSourceCodeSelected = selected => {
    if (isMountedRef.current) {
      setExchangesSelected(false);
      setExplorersSelected(false);
      setCommunitySelected(false);
      setContractsSelected(false);
      setSourceCodeSelected(selected);
    }
  };

  const onContractsSelected = selected => {
    if (isMountedRef.current) {
      setExchangesSelected(false);
      setExplorersSelected(false);
      setCommunitySelected(false);
      setSourceCodeSelected(false);
      setContractsSelected(selected);
    }
  };

  const onAllSelected = selected => {
    if (isMountedRef.current) {
      onExchangesSelected(selected);
      onExplorersSelected(selected);
      onCommunitySelected(selected);
      onSourceCodeSelected(selected);
      setContractsSelected(selected);
    }
  };

  const handleFromCurrencyValueChange = useCallback((value, theData) => {
    if (isMountedRef.current) {
      setFromCurrencyValue(value);
    }
    theData = theData ? theData : data;
    if (theData && theData.market_data && theData.market_data.current_price && typeof theData.market_data.current_price[currency] === 'number') {
      const v = value === '' ? '' : Number(typeof value === 'string' ? value.replaceAll(',', '') : value) * theData.market_data.current_price[currency];
      if (isMountedRef.current) {
        setToCurrencyValue(numberOptimizeDecimal(v === '' ? v : numeral(v).format('0,0.0000000000')));
      }
    }
  }, [isMountedRef, data, currency]);

  const handleToCurrencyValueChange = value => {
    if (isMountedRef.current) {
      setToCurrencyValue(value);
    }
    if (data && data.market_data && data.market_data.current_price && typeof data.market_data.current_price[currency] === 'number') {
      const v = value === '' ? '' : Number(typeof value === 'string' ? value.replaceAll(',', '') : value) / data.market_data.current_price[currency];
      if (isMountedRef.current) {
        setFromCurrencyValue(numberOptimizeDecimal(v === '' ? v : numeral(v).format('0,0.0000000000')));
      }
    }
  };

  useEffect(() => {
    const getData = async () => {
      if (coinId) {
        if (isMountedRef.current) {
          setDataLoading(true);
        }
        try {
          let coinData = await getCoin(coinId, { localization: false }, allPaprikaCoinsData);
          coinData = coinData && !coinData.error ? coinData : null;
          if (isMountedRef.current) {
            if (coinData) {
              setData(coinData);
            }
          }
        } catch (err) {}
        if (isMountedRef.current) {
          setDataLoading(false);
          setDataLoaded(true);
        }
      }
    };
    if (allPaprikaCoinsData) {
      getData();
    }
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, coinId, currency, allPaprikaCoinsData]);

  useEffect(() => {
    const runMarketChart = async () => {
      const ranges = _.orderBy(timeRanges.map(r => { r.sort_flag = r.day === chartTimeSelected; return r; }), ['sort_flag', 'day'], ['desc', 'asc']);
      for (let i = 0; i < ranges.length; i++) {
        if (i < 1 && Object.keys(marketChartDataMap).length < 1) {
          if (isMountedRef.current) {
            setMarketChartLoading(true);
          }
        }
        try {
          await sleep(500);
          let theMarketChartData = await getCoinMarketChart(coinId, { vs_currency: currency, days: ranges[i].day, interval: ranges[i].interval });
          theMarketChartData = theMarketChartData && !theMarketChartData.error ? theMarketChartData : null;
          if (theMarketChartData) {
            marketChartDataMap[ranges[i].day] = theMarketChartData;
          }
        } catch (err) {}
        if (i === 0 || i === ranges.length - 1) {
          if (isMountedRef.current) {
            if (marketChartDataMap) {
              setMarketChartDataMap(marketChartDataMap);
            }
            setMarketChartLoading(false);
          }
        }
      }
    };
    if (coinId) {
      runMarketChart();
    }
    const interval = setInterval(() => runMarketChart(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, coinId, currency, marketChartDataMap, chartTimeSelected]);

  useEffect(() => {
    const runOhlc = async () => {
      const ranges = _.orderBy(timeRanges.map(r => { r.sort_flag = r.day === chartTimeSelected; return r; }), ['sort_flag', 'day'], ['desc', 'asc']);
      for (let i = 0; i < ranges.length; i++) {
        if (i < 1 && Object.keys(ohlcDataMap).length < 1) {
          if (isMountedRef.current) {
            setOhlcChartLoading(true);
          }
        }
        try {
          await sleep(i === 0 ? 1000 : 500);
          let theOhlcData = await getCoinOHLC(coinId, { vs_currency: currency, days: ranges[i].day });
          theOhlcData = theOhlcData && !theOhlcData.error && Array.isArray(theOhlcData) && theOhlcData.length > 0 ? theOhlcData : null;
          if (theOhlcData) {
            ohlcDataMap[ranges[i].day] = theOhlcData;
          }
        } catch (err) {}
        if (i === 0 || i === ranges.length - 1) {
          if (isMountedRef.current) {
            if (ohlcDataMap) {
              setOhlcDataMap(ohlcDataMap);
            }
            setOhlcChartLoading(false);
          }
        }
      }
    };
    if (coinId) {
      runOhlc();
    }
    const interval = setInterval(() => runOhlc(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, coinId, currency, ohlcDataMap, chartTimeSelected]);

  useEffect(() => {
    const getTickers = async page => {
      if (isMountedRef.current) {
        setMarketLoading(true);
      }
      let size = 0;
      for (let i = 0; i <= (page < 0 ? 0 : page); i++) {
        try {
          await sleep(i === 0 ? 1000 : 500);
          const marketData = await getCoinTickers(data.id, { include_exchange_logo: true, page: i + 1, order: marketSort.field && (marketSort.field.startsWith('converted_volume') || marketSort.field === 'volume_percentage') && marketSort.direction === 'desc' ? 'volume_desc' : marketSort.field === 'trust_score' && marketSort.direction === 'asc' ? 'trust_score_asc' : 'trust_score_desc', depth: true });
          if (marketData && marketData.tickers) {
            for (let j = 0; j < marketData.tickers.length; j++) {
              tickers[size] = marketData.tickers[j];
              size++;
            }
            if (marketData.tickers.length < pageSize) {
              if (isMountedRef.current) {
                setMarketPageEnd(true);
              }
              break;
            }
          }
        } catch (err) {}
      }
      tickers.length = size;
      if (isMountedRef.current) {
        if (size !== 0) {
          setTickers(tickers);
        }
        setMarketLoading(false);
      }
    };
    if (data && data.id) {
      getTickers(marketPage);
    }
  }, [isMountedRef, data, tickers, marketPage, marketSort]);

  if (coinId && data && data.id !== coinId && dataLoaded && isMountedRef.current) {
    setData(null);
    setDataLoaded(false);
  }

  const currencyData = _.head(_.uniq(currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === currency), 'id'));

  const explorers = _.uniq(_.concat(data && data.links && data.links.blockchain_site ? data.links.blockchain_site : [], data && data.paprika && data.paprika.links && data.paprika.links.explorer ? data.paprika.links.explorer.filter(l => l && l.startsWith('http')) : []).filter(l => l).map(l => l.endsWith('/') ? l.substring(0, l.length - 1) : l));
  const contracts = data && data.platforms ? Object.keys(data.platforms).map(k => { return { chain: getName(k.split('-')[0], true), address: data.platforms[k] }; }).filter(c => c.address && c.address.length > 5) : [];

  const facebookUrl = data && data.links.facebook_username ? `https://facebook.com/${data.links.facebook_username}` : data && data.paprika && data.paprika.links && data.paprika.links.facebook && data.paprika.links.facebook.length > 0 ? data.paprika.links.facebook[0] : '';

  const twitterUrl = data && data.links.twitter_screen_name ? `https://twitter.com/${data.links.twitter_screen_name}` : data && data.paprika && data.paprika.links_extended && data.paprika.links_extended.findIndex(l => l.type === 'twitter' && l.url) > -1 ? data.paprika.links_extended[data.paprika.links_extended.findIndex(l => l.type === 'twitter' && l.url)].url : '';
  if (twitterUrl && data.community_data && data.paprika && data.paprika.links_extended) {
    const linkIndex = data.paprika.links_extended.findIndex(l => l.type === 'twitter' && l.url);
    if (linkIndex > -1 && data.paprika.links_extended[linkIndex].url === twitterUrl && data.paprika.links_extended[linkIndex].stats) {
      data.community_data.twitter_followers = data.paprika.links_extended[linkIndex].stats.followers;
    }
  }

  const redditUrl = data && data.links.subreddit_url ? data.links.subreddit_url : data && data.paprika && data.paprika.links && data.paprika.links.reddit && data.paprika.links.reddit.length > 0 ? data.paprika.links.reddit[0] : '';
  if (redditUrl && data.community_data && data.paprika && data.paprika.links_extended) {
    const linkIndex = data.paprika.links_extended.findIndex(l => l.type === 'reddit' && l.url);
    if (linkIndex > -1 && data.paprika.links_extended[linkIndex].url === redditUrl && data.paprika.links_extended[linkIndex].stats) {
      data.community_data.reddit_subscribers = data.paprika.links_extended[linkIndex].stats.subscribers;
    }
  }

  const youtubeUrl = data && data.paprika && data.paprika.links && data.paprika.links.youtube && data.paprika.links.youtube.length > 0 ? data.paprika.links.youtube[0] : '';
  const youtubeId = youtubeUrl.indexOf('?v=') > -1 ? youtubeUrl.substring(youtubeUrl.indexOf('?v=') + 3, youtubeUrl.length - (youtubeUrl.endsWith('&') ? 1 : 0)) : youtubeUrl.indexOf('youtu.be') > -1 ? youtubeUrl.split('/')[youtubeUrl.split('/').length - 1] : youtubeUrl.indexOf('/embed/') > -1 ? youtubeUrl.substring(youtubeUrl.indexOf('/embed/') + 7, youtubeUrl.indexOf('?') > -1 ? youtubeUrl.indexOf('?') : youtubeUrl.length) : '';

  const hasDeveloper = data && typeof data.developer_score === 'number' && data.developer_score && data.developer_data ? true : false;

  const currencyMarket = tickers && tickers.findIndex(ticker => ticker.converted_last && (typeof ticker.converted_last[currency] === 'number' || typeof ticker.converted_last[currency] === 'string')) > -1 ? currency : 'usd';
  const currencyMarketData = _.head(_.uniq(currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === currencyMarket), 'id'));

  const hasAnalysis = data && typeof data.market_cap_rank === 'number' && data.market_cap_rank <= 20;

  return (
    <Fragment>
      <Container fluid={true}>
        <Row>
          <Col xs="12">
            {!data && dataLoaded ?
              <Error404 />
              :
              !data && dataLoading ?
                <div className="loader-box">
                  <Spinner />
                </div>
                :
                data ?
                  <Card className="bg-transparent border-0" style={{ boxShadow: 'none' }}>
                    <CardHeader className="bg-transparent pt-2 px-0">
                      <Row>
                        <Col lg="4" md="6" xs="12" className="order-md-1">
                          <div className="d-flex align-items-center">
                            <h1 className="f-22 d-flex align-items-center mb-0 mr-1">
                              {data.image && data.image.large && (<div className="avatar mr-2"><Media body className="img-40" src={data.image.large} alt={data.symbol && data.symbol.toUpperCase()} /></div>)}
                              {data.name}
                              {data.symbol && (<Badge color="light" pill className="f-12 f-w-300 ml-2">{data.symbol.toUpperCase()}</Badge>)}
                            </h1>
                            <div className="ml-auto">
                              <Button size="xs" color="info" onClick={() => statsRef.current.scrollIntoView({ behavior: 'smooth' })} className="d-flex align-items-center justify-content-center px-2" style={{ width: '6rem' }}><BarChart2 className="mr-1" style={{ width: '.75rem', marginTop: '-.125rem' }} />{"Statistics"}</Button>
                              {width > 575 && tickers && tickers.length > 0 && (<Button size="xs" color="info" onClick={() => tableRef.current.scrollIntoView({ behavior: 'smooth' })} className="d-flex align-items-center justify-content-center mt-1 px-2" style={{ width: '6rem' }}><Briefcase className="mr-1" style={{ width: '.75rem', marginTop: '-.125rem' }} />{"Markets"}</Button>)}
                            </div>
                          </div>
                          <div className="mt-2">
                            {typeof data.market_cap_rank === 'number' && (<Badge color="light" pill className={`f-${width <=575 ? 10 : 12} f-w-300 mb-1 mr-1`}>{"Rank #"}{numeral(data.market_cap_rank).format('0,0')}</Badge>)}
                            {_.uniq(_.concat(data.categories ? data.categories : [], data.hashing_algorithm ? data.hashing_algorithm : [], data.paprika && data.paprika.org_structure ? data.paprika.org_structure : [], data.paprika && data.paprika.tags ? data.paprika.tags.map(t => t.name) : [])).map((tag, i) => (
                              <Badge key={i} color="light" pill className={`f-${width <=575 ? 10 : 12} f-w-300 text-info mb-1 ml-0 mr-1`}>{tag}</Badge>
                            ))}
                          </div>
                        </Col>
                        <Col lg="4" md="6" xs="12" className="mt-3 mt-md-0 order-md-2">
                          <div className={`${width <= 575 ? 'd-flex mb-2' : ''}`}>
                            <h2 style={{ display: 'contents', fontWeight: 'unset' }}><span className={`f-12 text-secondary f-w-300${width <= 575 ? ' mt-1' : 0}`} style={{ maxWidth: width <= 575 ? '40%' : '' }}>{data.name && (<>{data.name}&nbsp;</>)}{"Price"}{data.symbol && (<> ({data.symbol.toUpperCase()})&nbsp;</>)}</span></h2>
                            <div className={`mt-${width <= 575 ? '0 ml-auto text-right' : 1}`}>
                              <div className={`h2 f-20 d-flex align-items-center${width <= 575 ? ' justify-content-end' : ''} mb-1`}>
                                {data.market_data && data.market_data.current_price && typeof data.market_data.current_price[currency] === 'number' ?
                                  <>
                                    {currencyData && currencyData.symbol}
                                    {numberOptimizeDecimal(numeral(data.market_data.current_price[currency]).format('0,0.0000000000'))}
                                    {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                  </>
                                  :
                                  'N/A'
                                }
                                {data.market_data && typeof data.market_data.price_change_percentage_24h_in_currency && typeof data.market_data.price_change_percentage_24h_in_currency[currency] === 'number' && (<Badge color={data.market_data.price_change_percentage_24h_in_currency[currency] > 0 ? 'success' : data.market_data.price_change_percentage_24h_in_currency[currency] < 0 ? 'danger' : 'light'} className="f-14 f-w-300 ml-2 py-1 px-2">{numeral(data.market_data.price_change_percentage_24h_in_currency[currency] / 100).format('+0,0.00%')}</Badge>)}
                              </div>
                              <div>
                                {['btc', 'eth'].filter(c => (!data.symbol || c !== data.symbol) && data.market_data && data.market_data.current_price && typeof data.market_data.current_price[c] === 'number').map((c, i) => (
                                  <span key={i} className={`text-info f-w-300 small${i > 0 ? ' ml-2' : ''}`}>{numberOptimizeDecimal(numeral(data.market_data.current_price[c]).format('0,0.0000000000'))} {c.toUpperCase()}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          {data.market_data && data.market_data.low_24h && typeof data.market_data.low_24h[currency] === 'number' && data.market_data.high_24h && typeof data.market_data.high_24h[currency] === 'number' && (
                            <div className={`d-flex align-items-center${width <=575 ? ' justify-content-center' : ''} mt-1`}>
                              <span className="f-10"><span className="text-info">Low:</span> {currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(data.market_data.low_24h[currency]).format('0,0.0000000000'))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</span>
                              <Progress value={100 * ((data.market_data.high_24h[currency] - data.market_data.low_24h[currency]) ? data.market_data.current_price[currency] - data.market_data.low_24h[currency] : 0.5) / ((data.market_data.high_24h[currency] - data.market_data.low_24h[currency]) ? data.market_data.high_24h[currency] - data.market_data.low_24h[currency] : 1)} className="progress-coin progress-8 w-50 mx-2" style={{ maxWidth: '10rem' }} />
                              <span className="f-10 text-right"><span className="text-info">High:</span> {currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(data.market_data.high_24h[currency]).format('0,0.0000000000'))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</span>
                              <Badge color="light" pill className="f-10 text-secondary f-w-300 ml-2">24h</Badge>
                            </div>
                          )}
                        </Col>
                        <Col lg="4" md="6" xs="12" className="mt-3 mt-md-4 mt-lg-0 order-md-4 order-lg-3 text-right" onMouseLeave={() => onAllSelected(false)}>
                          <h2 style={{ display: 'contents', fontWeight: 'unset' }}><div className="f-12 font-w-300 text-secondary" onMouseEnter={() => onAllSelected(false)}>{"Suggested Exchanges"}</div></h2>
                          <div id="suggested_exchanges_zone" onClick={e => { if (e.target.id === 'suggested_exchanges_zone') { onAllSelected(false) } }} className="d-flex justify-content-end mt-2">
                            {width <= 575 && tickers && tickers.length > 0 && (<Button size="xs" color="info" onMouseEnter={() => onExchangesSelected(false)} onClick={() => tableRef.current.scrollIntoView({ behavior: 'smooth' })} className="d-flex align-items-center justify-content-center mr-auto px-2" style={{ height: 'fit-content', marginTop: '.4rem' }}><Briefcase className="mr-1" style={{ width: '.75rem', marginTop: '-.125rem' }} />{"Markets"}</Button>)}
                            {_.slice(getTradeData(data, allCryptoData, tickers), 0, 3).map((t, i) => (
                              <Button key={i} size={width <= 575 ? 'xs' : 'sm'} color="light" href={t.url} target="_blank" onMouseEnter={() => onExchangesSelected(false)} className={`d-flex align-items-center ml-${i > 0 ? 2 : 0} py-2 px-3`} style={{ height: 'fit-content', whiteSpace: 'nowrap' }}>
                                {t.exchange && t.exchange.large && (
                                  <span className={`avatar mr-${width <= 575 ? 0 : 2}`}>
                                    <Media body className="img-20" src={t.exchange.large} alt={t.exchange.name || getName(t.exchange.id, true)} />
                                  </span>
                                )}
                                {width > 575 && (<span className="f-w-500">{t.exchange.name || getName(t.exchange.id, true)}</span>)}
                              </Button>
                            ))}
                            <div className="dropdown-basic d-flex align-items-center ml-2">
                              <Dropdown onMouseEnter={() => { if (width > 1200) { onExchangesSelected(true); } }} className={`${width <= 575 ? 'p-2' : ''}`}>
                                <Badge color="light" pill onClick={() => onExchangesSelected(!exchangesSelected)} className="f-12 f-w-300" style={{ cursor: 'pointer' }}><ChevronDown /></Badge>
                                <DropdownMenu onMouseLeave={() => onExchangesSelected(false)} className={`dropdown-content d-${exchangesSelected ? 'block' : 'none'}`} style={{ left: '-10rem' }}>
                                  {_.slice(getTradeData(data, allCryptoData, tickers), 3).map((t, i) => (
                                    <DropdownItem key={i} href={t.url} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center">
                                      {t.exchange && t.exchange.large && (
                                        <span className="avatar mr-2">
                                          <Media body className="img-20" src={t.exchange.large} alt={t.exchange.name || getName(t.exchange.id, true)} />
                                        </span>
                                      )}
                                      <span className="f-w-500">{t.exchange.name || getName(t.exchange.id, true)}</span>
                                    </DropdownItem>
                                  ))}
                                </DropdownMenu>
                              </Dropdown>
                            </div>
                          </div>
                        </Col>
                        <Col lg="4" md="6" xs="12" id="urls_zone" onClick={e => { if (e.target.id === 'urls_zone') { onAllSelected(false); } }} onMouseLeave={() => onAllSelected(false)} className={`mt-${width <= 375 ? 4 : 3} mt-md-4${width <= 991 ? '' : ' pb-4'} order-md-3 order-lg-4`}>
                          {data.links && (
                            <>
                              {data.links.homepage && data.links.homepage.filter(l => l).map((link, i) => (
                                <a key={i} href={link} target="_blank" rel="noopener noreferrer" onMouseEnter={() => onAllSelected(false)}><Badge color="light" pill className="f-12 f-w-300 mb-1 ml-0 mr-1"><Layout className="mr-1" />{new URL(link).hostname}<ExternalLink className="ml-1" /></Badge></a>
                              ))}
                              {explorers.length > 0 && (
                                <div className="dropdown-basic d-inline-flex">
                                  <Dropdown onMouseEnter={() => { if (width > 1200) { onExplorersSelected(true); } }}>
                                    <Badge color="light" pill onClick={() => onExplorersSelected(!explorersSelected)} className="f-12 f-w-300 mb-1 ml-0 mr-1" style={{ cursor: 'pointer' }}><Search className="mr-1" />{"Explorers"}<ChevronDown className="ml-1" /></Badge>
                                    <DropdownMenu onMouseLeave={() => onExplorersSelected(false)} className={`dropdown-content d-${explorersSelected ? 'block' : 'none'}`}>
                                      {explorers.map((link, i) => (
                                        <DropdownItem key={i} href={link} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center">{new URL(link).hostname}<ExternalLink className="ml-1" style={{ width: '1rem' }} /></DropdownItem>
                                      ))}
                                    </DropdownMenu>
                                  </Dropdown>
                                </div>
                              )}
                              {Object.keys(data.links).filter(k => ['homepage', 'blockchain_site', 'chat_url', 'repos_url'].indexOf(k) < 0).findIndex(k => Array.isArray(data.links[k]) ? data.links[k].findIndex(l => l) > -1 : data.links[k] ? true : typeof data.links[k] === 'number') > -1 && (
                                <div className="dropdown-basic d-inline-flex">
                                  <Dropdown onMouseEnter={() => { if (width > 1200) { onCommunitySelected(true); } }}>
                                    <Badge color="light" pill onClick={() => onCommunitySelected(!communitySelected)} className="f-12 f-w-300 mb-1 ml-0 mr-1" style={{ cursor: 'pointer' }}><Globe className="mr-1" />{"Community"}<ChevronDown className="ml-1" /></Badge>
                                    <DropdownMenu onMouseLeave={() => onCommunitySelected(false)} className={`dropdown-content d-${communitySelected ? 'block' : 'none'}`}>
                                      {[data.links.announcement_url, data.links.official_forum_url, typeof data.links.bitcointalk_thread_identifier === 'number' ? `https://bitcointalk.org/index.php?topic=${data.links.bitcointalk_thread_identifier}` : '', facebookUrl, twitterUrl, data.links.telegram_channel_identifier ? `https://t.me/${data.links.telegram_channel_identifier}` : '', redditUrl].flatMap(l => l).filter(l => l).map((link, i) => (
                                        <DropdownItem key={i} href={link} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center">{new URL(link).hostname}<ExternalLink className="ml-1" style={{ width: '1rem' }} /></DropdownItem>
                                      ))}
                                    </DropdownMenu>
                                  </Dropdown>
                                </div>
                              )}
                              {data.links.chat_url && data.links.chat_url.filter(l => l).map((link, i) => (
                                <a key={i} href={link} target="_blank" rel="noopener noreferrer" onMouseEnter={() => onAllSelected(false)}><Badge color="light" pill className="f-12 f-w-300 mb-1 ml-0 mr-1"><MessageCircle className="mr-1" />{new URL(link).hostname}<ExternalLink className="ml-1" /></Badge></a>
                              ))}
                              {data.links.repos_url && Object.keys(data.links.repos_url).findIndex(k => data.links.repos_url[k] && data.links.repos_url[k].findIndex(l => l) > -1) > -1 && (
                                <div className="dropdown-basic d-inline-flex">
                                  <Dropdown onMouseEnter={() => { if (width > 1200) { onSourceCodeSelected(true); } }}>
                                    <Badge color="light" pill onClick={() => onSourceCodeSelected(!sourceCodeSelected)} className="f-12 f-w-300 mb-1 ml-0 mr-1" style={{ cursor: 'pointer' }}><Code className="mr-1" />{"Source code"}<ChevronDown className="ml-1" /></Badge>
                                    <DropdownMenu onMouseLeave={() => onSourceCodeSelected(false)} className={`dropdown-content d-${sourceCodeSelected ? 'block' : 'none'}`}>
                                      {Object.keys(data.links.repos_url).map(k => data.links.repos_url[k]).flatMap(l => l).filter(l => l).map((link, i) => (
                                        <DropdownItem key={i} href={link} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center">{new URL(link).hostname}{new URL(link).pathname && (<>&nbsp;{new URL(link).pathname.split('/').filter(p => p).join('/')}</>)}<ExternalLink className="ml-1" style={{ width: '1rem' }} /></DropdownItem>
                                      ))}
                                    </DropdownMenu>
                                  </Dropdown>
                                </div>
                              )}
                              {/*data.contract_address && (
                                <CopyToClipboard text={data.contract_address} onMouseEnter={() => onAllSelected(false)}><Badge color="light" pill onClick={() => { message.destroy(); message.success('Copied'); }} className="f-12 f-w-300 mb-1 ml-0 mr-1" style={{ cursor: 'pointer' }}><FileText className="mr-1" />{data.contract_address.length > 13 ? `${data.contract_address.substring(0, 6)}...${data.contract_address.substring(data.contract_address.length - 7)}` : data.contract_address}<Copy className="ml-1" /></Badge></CopyToClipboard>
                              )*/}
                              {contracts.length > 0 && (
                                <div className="dropdown-basic d-inline-flex">
                                  <Dropdown onMouseEnter={() => { if (width > 1200) { onContractsSelected(true); } }}>
                                    <Badge color="light" pill onClick={() => onContractsSelected(!contractsSelected)} className="f-12 f-w-300 mb-1 ml-0 mr-1" style={{ cursor: 'pointer' }}><FileText className="mr-1" />{"Contracts"}<ChevronDown className="ml-1" /></Badge>
                                    <DropdownMenu onMouseLeave={() => onContractsSelected(false)} className={`dropdown-content d-${contractsSelected ? 'block' : 'none'}`}>
                                      {contracts.map((c, i) => (
                                        <DropdownItem key={i} className="d-flex align-items-center">
                                          <CopyToClipboard text={c.address}><Badge color="light" pill onClick={() => { message.destroy(); message.success('Copied'); }} className="f-12 f-w-300" style={{ cursor: 'pointer' }}>{c.chain}&nbsp;{c.address.length > 13 ? `${c.address.substring(0, 6)}...${c.address.substring(c.address.length - 7)}` : c.address}<Copy className="ml-1" /></Badge></CopyToClipboard>
                                        </DropdownItem>
                                      ))}
                                    </DropdownMenu>
                                  </Dropdown>
                                </div>
                              )}
                              {data.paprika && data.paprika.whitepaper && data.paprika.whitepaper.link && (
                                <a href={data.paprika.whitepaper.link} target="_blank" rel="noopener noreferrer" onMouseEnter={() => onAllSelected(false)}><Badge color="light" pill className="f-12 f-w-300 mb-1 ml-0 mr-1"><FileText className="mr-1" />{"Whitepaper"}<ExternalLink className="ml-1" /></Badge></a>
                              )}
                            </>
                          )}
                        </Col>
                        <Col lg="8" md="12" xs="12" className={`mt-${width <= 375 ? 4 : 3} mt-md-4 order-md-6 order-lg-5`}>
                          <Row>
                            <Col lg="3" md="6" sm="6" xs={width >= 375 ? 6 : 12}>
                              <h2 style={{ display: 'contents', fontWeight: 'unset' }}><span className="f-12 text-secondary">{"Market Cap"}</span></h2>
                              {data.market_data && data.market_data.market_cap && typeof data.market_data.market_cap[currency] === 'number' && data.market_data.market_cap[currency] > 0 ?
                                <div className={`h3 ${width > 991 && numberOptimizeDecimal(numeral(data.market_data.market_cap[currency]).format('0,0')).length >= (width <= 1200 ? 11 : 15) + (currencyData && currencyData.symbol ? 3 : 0) ? `f-${width <= 1200 ? 10 : 12} f-w-500 ` : width <= 575 && numberOptimizeDecimal(numeral(data.market_data.market_cap[currency]).format('0,0')).length >= (width >= 414 ? 18 : 14) + (currencyData && currencyData.symbol ? 3 : 0) ? width <= 375 ? 'f-12 ' : 'f-12 ' : 'f-16 '}mt-2`}>{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(data.market_data.market_cap[currency]).format('0,0'))}{!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}</div>
                                :
                                <div className="h3 f-16 mt-2">{"N/A"}</div>
                              }
                              {data.market_data && data.market_data.market_cap_change_percentage_24h_in_currency && typeof data.market_data.market_cap_change_percentage_24h_in_currency[currency] === 'number' && data.market_data.market_cap[currency] > 0 && (
                                <div className={`f-12 f-w-300${data.market_data.market_cap_change_percentage_24h_in_currency[currency] > 0 ? ' font-success' : data.market_data.market_cap_change_percentage_24h_in_currency[currency] < 0 ? ' font-danger' : ''}`}>{numeral(data.market_data.market_cap_change_percentage_24h_in_currency[currency] / 100).format('+0,0.00%')}</div>
                              )}
                            </Col>
                            <Col lg="3" md="6" sm="6" xs={width >= 375 ? 6 : 12} className={`mt-${width >= 375 ? 0 : 3} mt-sm-0`}>
                              <h2 style={{ display: 'contents', fontWeight: 'unset' }}><span className="f-12 text-secondary">{"Fully Diluted Valuation"}</span></h2>
                              {data.market_data && data.market_data.fully_diluted_valuation && typeof data.market_data.fully_diluted_valuation[currency] === 'number' ?
                                <div className={`h3 ${width > 991 && numberOptimizeDecimal(numeral(data.market_data.fully_diluted_valuation[currency]).format('0,0')).length >= (width <= 1200 ? 11 : 15) + (currencyData && currencyData.symbol ? 3 : 0) ? `f-${width <= 1200 ? 10 : 12} f-w-500 ` : width <= 575 && numberOptimizeDecimal(numeral(data.market_data.fully_diluted_valuation[currency]).format('0,0')).length >= (width >= 414 ? 18 : 14) + (currencyData && currencyData.symbol ? 3 : 0) ? width <= 375 ? 'f-12 ' : 'f-12 ' : 'f-16 '}mt-2`}>{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(data.market_data.fully_diluted_valuation[currency]).format('0,0'))}{!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}</div>
                                :
                                <div className="h3 f-16 mt-2">{"-"}</div>
                              }
                            </Col>
                            <Col lg="3" md="6" sm="6" xs={width >= 375 ? 6 : 12} className="mt-3 mt-lg-0">
                              <h2 style={{ display: 'contents', fontWeight: 'unset' }}><span className="f-12 text-secondary d-flex align-items-center" style={{ margin: '1.72px 0' }}>{"Volume"}<Badge color="light" pill className="f-10 text-secondary f-w-300 ml-2">24h</Badge></span></h2>
                              {data.market_data && data.market_data.total_volume && typeof data.market_data.total_volume[currency] === 'number' ?
                                <div className={`h3 ${width > 991 && numberOptimizeDecimal(numeral(data.market_data.total_volume[currency]).format('0,0')).length >= (width <= 1200 ? 10 : 14) + (currencyData && currencyData.symbol ? 3 : 0) ? `f-${width <= 1200 ? 10 : 12} f-w-500` : width <= 575 && numberOptimizeDecimal(numeral(data.market_data.total_volume[currency]).format('0,0')).length >= (width >= 414 ? 15 : 12) + (currencyData && currencyData.symbol ? 3 : 0) ? width <= 375 ? 'f-12 ' : 'f-12 ' : 'f-16 '}mt-2`} style={{ marginTop: '9.2px' }}>{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(data.market_data.total_volume[currency]).format('0,0'))}{!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}</div>
                                :
                                <div className="h3 f-16 mt-2">{"-"}</div>
                              }
                            </Col>
                            <Col lg="3" md="6" sm="6" xs={width >= 375 ? 6 : 12} className="mt-3 mt-lg-0">
                              <h2 style={{ display: 'contents', fontWeight: 'unset' }}><span className="f-12 text-secondary">{"Circulating Supply"}</span></h2>
                              {data.market_data && data.market_data && typeof data.market_data.circulating_supply === 'number' && data.market_data.circulating_supply > 0 ?
                                <div className={`h3 ${width > 991 && numberOptimizeDecimal(numeral(data.market_data.circulating_supply).format('0,0')).length >= (width <= 1200 ? 13 : 15) ? `f-${width <= 1200 ? 10 : 12} f-w-500 ` : width <= 575 && numberOptimizeDecimal(numeral(data.market_data.circulating_supply).format('0,0')).length >= (width >= 414 ? 15 : 12) + (currencyData && currencyData.symbol ? 3 : 0) ? width <= 375 ? 'f-12 ' : 'f-12 ' : 'f-16 '}mt-2`}>{numberOptimizeDecimal(numeral(data.market_data.circulating_supply).format('0,0'))}{data.symbol && (<> {data.symbol.toUpperCase()}</>)}</div>
                                :
                                <div className="h3 f-16 mt-2">{"N/A"}</div>
                              }
                              {data.market_data && typeof data.market_data.circulating_supply === 'number' && data.market_data.max_supply && (
                                <div className="d-flex align-items-center mt-0">
                                  <Progress value={100 * data.market_data.circulating_supply / data.market_data.max_supply} className="progress-coin w-50" style={{ maxWidth: '10rem' }} />
                                  <Badge color="light" pill className="f-10 text-secondary f-w-300 ml-2">{numeral(data.market_data.circulating_supply / data.market_data.max_supply).format('0,0.00%')}</Badge>
                                </div>
                              )}
                              {data.market_data && (typeof data.market_data.total_supply === 'number' || typeof data.market_data.max_supply === 'number') && (
                                <div className="f-12 f-w-300"><span className="text-secondary">{typeof data.market_data.max_supply === 'number' ? 'Max' : 'Total'} Supply:</span> {numberOptimizeDecimal(numeral(typeof data.market_data.total_supply === 'number' ? data.market_data.total_supply : data.market_data.max_supply).format('0,0'))}</div>
                              )}
                            </Col>
                            {data.market_data && data.market_data.mcap_to_tvl_ratio && typeof data.market_data.mcap_to_tvl_ratio === 'number' && data.market_data.mcap_to_tvl_ratio > 0 && (
                              <Col lg="3" md="6" sm="6" xs={width >= 375 ? 6 : 12} className="mt-3">
                                <h2 style={{ display: 'contents', fontWeight: 'unset' }}><span className="f-12 text-secondary">{"Market Cap / TVL Ratio"}</span></h2>
                                <div className={`h3 ${width > 991 && numberOptimizeDecimal(numeral(data.market_data.mcap_to_tvl_ratio).format('0,0.00')).length >= (width <= 1200 ? 11 : 15) ? `f-${width <= 1200 ? 10 : 12} f-w-500 ` : width <= 575 && numberOptimizeDecimal(numeral(data.market_data.mcap_to_tvl_ratio).format('0,0.00')).length >= (width >= 414 ? 18 : 14) ? width <= 375 ? 'f-12 ' : 'f-12 ' : 'f-16 '}mt-2`}>{numberOptimizeDecimal(numeral(data.market_data.mcap_to_tvl_ratio).format('0,0.00'))}</div>
                              </Col>
                            )}
                            {data.market_data && data.market_data.fdv_to_tvl_ratio && typeof data.market_data.fdv_to_tvl_ratio === 'number' && data.market_data.fdv_to_tvl_ratio > 0 && (
                              <Col lg="3" md="6" sm="6" xs={width >= 375 ? 6 : 12} className="mt-3">
                                <h2 style={{ display: 'contents', fontWeight: 'unset' }}><span className="f-12 text-secondary">{"Fully Diluted / TVL Ratio"}</span></h2>
                                <div className={`h3 ${width > 991 && numberOptimizeDecimal(numeral(data.market_data.fdv_to_tvl_ratio).format('0,0.00')).length >= (width <= 1200 ? 11 : 15) ? `f-${width <= 1200 ? 10 : 12} f-w-500 ` : width <= 575 && numberOptimizeDecimal(numeral(data.market_data.fdv_to_tvl_ratio).format('0,0.00')).length >= (width >= 414 ? 18 : 14) ? width <= 375 ? 'f-12 ' : 'f-12 ' : 'f-16 '}mt-2`}>{numberOptimizeDecimal(numeral(data.market_data.fdv_to_tvl_ratio).format('0,0.00'))}</div>
                              </Col>
                            )}
                            {data.market_data && data.market_data.total_value_locked && typeof data.market_data.total_value_locked.usd === 'number' && data.market_data.total_value_locked.usd > 0 && (
                              <Col lg="3" md="6" sm="6" xs={width >= 375 ? 6 : 12} className="mt-3">
                                <h2 style={{ display: 'contents', fontWeight: 'unset' }}><span className="f-12 text-secondary">{"Total Value Locked"}</span></h2>
                                <div className={`h3 ${width > 991 && numberOptimizeDecimal(numeral(data.market_data.total_value_locked.usd).format('0,0')).length >= (width <= 1200 ? 11 : 15) + 3 ? `f-${width <= 1200 ? 10 : 12} f-w-500 ` : width <= 575 && numberOptimizeDecimal(numeral(data.market_data.total_value_locked.usd).format('0,0')).length >= (width >= 414 ? 18 : 14) + 3 ? width <= 375 ? 'f-12 ' : 'f-12 ' : 'f-16 '}mt-2`}>{"$"}{numberOptimizeDecimal(numeral(data.market_data.total_value_locked.usd).format('0,0'))}</div>
                              </Col>
                            )}
                          </Row>
                        </Col>
                        <Col lg="12" md="12" xs="12" className="mt-5 mt-md-4 order-md-5 order-lg-6">
                          <Row>
                            <Col xl={hasDeveloper || youtubeUrl ? hasDeveloper && youtubeUrl ? 2 : 3 : 4} lg={(hasDeveloper || youtubeUrl) && !(hasDeveloper && youtubeUrl) ? 3 : 4} md="6" xs="12" style={{ maxWidth: width <= 991 ? '' : 'fit-content' }}>
                              <h2 className="f-16 mb-3">{"General"}</h2>
                              {data.asset_platform_id && (<p className="mt-2 mb-0"><span className="text-secondary">{"Platform: "}</span>{getName(data.asset_platform_id, true)}</p>)}
                              {data.country_origin && (<p className="mt-2 mb-0"><span className="text-secondary">{"Origin country: "}</span>{getName(data.country_origin, true)}<i className={`flag-icon flag-icon-${data.country_origin.toLowerCase()} ml-1`} /></p>)}
                              {data.genesis_date && (<p className="mt-2 mb-0"><span className="text-secondary">{"Genesis date: "}</span>{moment(data.genesis_date).format(hasDeveloper && youtubeUrl ? 'D MMM YY' : 'D MMMM YYYY')}</p>)}
                              {typeof data.coingecko_rank === 'number' && (<p className="d-flex align-items-center mt-2 mb-0"><img src={coingecko} alt="CoinGecko" className="img-fluid mr-1" style={{ height: '1.5rem' }} /><span className="text-secondary mx-1">{"Rank: "}</span>#{numeral(data.coingecko_rank).format('0,0')}{typeof data.coingecko_score === 'number' && (<Badge color="light" pill className="f-12 f-w-300 text-info ml-1">{"Score: "}{numeral(data.coingecko_score).format('0,0.00')}</Badge>)}</p>)}
                              {/*typeof */data.liquidity_score > 0/* === 'number'*/ && (<p className="d-flex align-items-center mt-2 mb-0"><Droplet className="font-primary mx-1" style={{ width: '1rem' }} /><span className="text-secondary ml-1">{"Liquidity: "}</span><Badge color="light" pill className="f-12 f-w-300 text-info ml-1">{"Score: "}{numeral(data.liquidity_score).format('0,0.00')}</Badge></p>)}
                              {/*typeof data.public_interest_score === 'number' && data.public_interest_stats && Object.keys(data.public_interest_stats).findIndex(k => typeof data.public_interest_stats[k] === 'number') > -1 && (<p className="d-flex mt-2 mb-0"><span className="text-secondary">{"Public interest: "}</span><span className="d-grid ml-1">{Object.keys(data.public_interest_stats).filter(k => typeof data.public_interest_stats[k] === 'number').map((k, i) => (<span key={i} className={`d-flex align-items-center${i > 0 ? ' mt-1' : ''}`}><img src={`https://www.${k.substring(0, k.indexOf('_'))}.com/${k.substring(0, k.indexOf('_')) === 'bing' ? 'sa/simg/favicon-2x' : 'favicon'}.ico`} alt={k.substring(0, k.indexOf('_'))} className="img-fluid rounded-circle" style={{ width: '1.5rem' }} /><span className="text-secondary mx-1">{getName(k.substring(0, k.indexOf('_')), true)} {"Rank: "}</span>#{numeral(data.public_interest_stats[k]).format('0,0')}</span>))}<Badge color="light" pill className="f-12 f-w-300 text-info mt-1">{"Score: "}{numeral(data.public_interest_score).format('0,0.00')}</Badge></span></p>)*/}
                              {typeof data.sentiment_votes_up_percentage === 'number' && typeof data.sentiment_votes_down_percentage === 'number' && (<p className="mt-2 mb-0"><span className="text-secondary"><span className="f-18">{"👍"}</span>{"Good: "}</span>{numeral(data.sentiment_votes_up_percentage / 100).format('0,0.00%')}{hasDeveloper && youtubeUrl && (<br />)}<span className={`text-secondary ml-${hasDeveloper && youtubeUrl ? 0 : 2}`}><span className="f-18">{"👎"}</span>{"Bad: "}</span>{numeral(data.sentiment_votes_down_percentage / 100).format('0,0.00%')}</p>)}
                            </Col>
                            <Col xl={hasDeveloper || youtubeUrl ? 3 : 4} lg={(hasDeveloper || youtubeUrl) && !(hasDeveloper && youtubeUrl) ? 3 : 4} md="6" xs="12" className="mt-4 mt-md-0" style={{ maxWidth: width <= 991 ? '' : 'fit-content' }}>
                              <div className="d-flex align-items-center mb-3"><h2 className="f-16 mb-0">{"Social"}</h2>{/*typeof */data.community_score > 0/* === 'number'*/ && (<Badge color="light" pill className="f-12 f-w-300 text-info ml-1">{"Score: "}{numeral(data.community_score).format('0,0.00')}</Badge>)}</div>
                              {data.community_data && (
                                <>
                                  {(facebookUrl || (data.community_data.facebook_likes > 0)) && (<p className="d-flex align-items-center mb-0" style={{ marginTop: '-.25rem' }}><Facebook className="font-primary mr-1" style={{ width: '1.5rem' }} /><span className="text-secondary mr-1">{facebookUrl ? <a href={facebookUrl} target="_blank" rel="noopener noreferrer">{"Facebook"}</a> : 'Facebook'}{": "}</span>{/*typeof */data.community_data.facebook_likes > 0/* === 'number'*/ ? numeral(data.community_data.facebook_likes).format('0,0') : <span className="text-secondary">{"N/A"}</span>}<span className="text-info ml-1">{"like"}{data.community_data.facebook_likes > 1 ? 's' : ''}</span></p>)}
                                  {(twitterUrl || (data.community_data.twitter_followers > 0)) && (<p className="d-flex align-items-center mt-2 mb-0"><Twitter className="text-primary mr-1" style={{ width: '1.5rem' }} /><span className="text-secondary mr-1">{twitterUrl ? <a href={twitterUrl} target="_blank" rel="noopener noreferrer">{"Twitter"}</a> : 'Twitter'}{": "}</span>{/*typeof */data.community_data.twitter_followers > 0/* === 'number'*/ ? numeral(data.community_data.twitter_followers).format('0,0') : <span className="text-secondary">{"N/A"}</span>}<span className="text-info ml-1">{"follower"}{data.community_data.twitter_followers > 1 ? 's' : ''}</span></p>)}
                                  {((data.links && data.links.telegram_channel_identifier) || (data.community_data.telegram_channel_user_count > 0)) && (<p className="d-flex align-items-center mt-2 mb-0"><i className="icofont icofont-social-telegram f-24 text-primary mr-1" /><span className="text-secondary mr-1">{data.links && data.links.telegram_channel_identifier ? <a href={`https://t.me/${data.links.telegram_channel_identifier}`} target="_blank" rel="noopener noreferrer">{"Telegram"}</a> : 'Telegram'}{": "}</span>{/*typeof */data.community_data.telegram_channel_user_count > 0/* === 'number'*/ ? numeral(data.community_data.telegram_channel_user_count).format('0,0') : <span className="text-secondary">{"N/A"}</span>}<span className="text-info ml-1">{"subscriber"}{data.community_data.telegram_channel_user_count > 1 ? 's' : ''}</span></p>)}
                                  {(redditUrl || (data.community_data.reddit_subscribers > 0)) && (<p className="d-flex align-items-center mt-2 mb-0"><i className="icofont icofont-social-reddit f-24 font-danger mr-1" /><span className="text-secondary mr-1">{redditUrl ? <a href={redditUrl} target="_blank" rel="noopener noreferrer">{"Reddit"}</a> : 'Reddit'}{": "}</span>{/*typeof */data.community_data.reddit_subscribers > 0/* === 'number'*/ ? numeral(data.community_data.reddit_subscribers).format('0,0') : <span className="text-secondary">{"N/A"}</span>}<span className="text-info ml-1">{data.community_data.reddit_subscribers > 999999 ? 'sub' : 'subscriber'}{data.community_data.reddit_subscribers > 1 ? 's' : ''}</span>{redditShowMore ? <ChevronUp onClick={() => setRedditShowMore(!redditShowMore)} className="text-secondary" style={{ width: '1rem', cursor: 'pointer' }} /> : <ChevronDown onClick={() => setRedditShowMore(!redditShowMore)} className="text-secondary" style={{ width: '1rem', cursor: 'pointer' }} />}</p>)}
                                  {redditShowMore && (
                                    <>
                                      <p className="f-12 mt-2 mb-0 ml-4 pl-1">- {typeof data.community_data.reddit_accounts_active_48h === 'number' ? numeral(data.community_data.reddit_accounts_active_48h).format('0,0') : <span className="text-secondary">{"N/A"}</span>}<span className="text-info ml-1">{"active account"}{data.community_data.reddit_accounts_active_48h > 1 ? 's' : ''}</span><Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">48h</Badge></p>
                                      <p className="f-12 mt-2 mb-0 ml-4 pl-1">- {typeof data.community_data.reddit_average_posts_48h === 'number' ? numberOptimizeDecimal(numeral(data.community_data.reddit_average_posts_48h).format('0,0.00')) : <span className="text-secondary">{"N/A"}</span>}<span className="text-info ml-1">{"avg. post"}{data.community_data.reddit_average_posts_48h > 1 ? 's' : ''}</span><Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">48h</Badge></p>
                                      <p className="f-12 mt-2 mb-0 ml-4 pl-1">- {typeof data.community_data.reddit_average_comments_48h === 'number' ? numberOptimizeDecimal(numeral(data.community_data.reddit_average_comments_48h).format('0,0.00')) : <span className="text-secondary">{"N/A"}</span>}<span className="text-info ml-1">{"avg. comment"}{data.community_data.reddit_average_comments_48h > 1 ? 's' : ''}</span><Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">48h</Badge></p>
                                    </>
                                  )}
                                </>
                              )}
                            </Col>
                            {hasDeveloper && (
                              <Col xl="3" lg={!youtubeUrl ? 3 : 4} md="6" xs="12" className="mt-4 mt-lg-0" style={{ maxWidth: width <= 991 ? '' : 'fit-content' }}>
                                <div className="d-flex align-items-center mb-3"><h2 className="f-16 mb-0">{"Developer"}</h2>{typeof data.developer_score === 'number' && (<Badge color="light" pill className="f-12 f-w-300 text-info ml-1">{"Score: "}{numeral(data.developer_score).format('0,0.00')}</Badge>)}</div>
                                <p className="d-flex align-items-center mb-0" style={{ marginTop: '-.25rem' }}><GitHub className="mr-1" style={{ width: '1.5rem' }} /><span className="text-secondary mr-1">{"Git Repo: "}</span></p>
                                <Row>
                                  <Col xs="6">
                                    <p className="d-flex align-items-center mt-2 mb-0"><Eye className="mr-1" style={{ width: '1rem' }} /><span className="text-secondary mr-1">{"Watch: "}</span>{typeof data.developer_data.subscribers === 'number' ? numeral(data.developer_data.subscribers).format('0,0') : <span className="text-secondary">{"N/A"}</span>}</p>
                                  </Col>
                                  <Col xs="6">
                                    <p className="d-flex align-items-center mt-2 mb-0"><Star className="mr-1" style={{ width: '1rem' }} /><span className="text-secondary mr-1">{"Star: "}</span>{typeof data.developer_data.stars === 'number' ? numeral(data.developer_data.stars).format('0,0') : <span className="text-secondary">{"N/A"}</span>}</p>
                                  </Col>
                                  <Col xs="6">
                                    <p className="d-flex align-items-center mt-2 mb-0"><i className= "ion ion-network f-16 mr-1" style={{ marginLeft: '.175rem' }} /><span className="text-secondary mr-1">{"Fork: "}</span>{typeof data.developer_data.forks === 'number' ? numeral(data.developer_data.forks).format('0,0') : <span className="text-secondary">{"N/A"}</span>}</p>
                                  </Col>
                                  <Col xs="6">
                                    <p className="d-flex align-items-center mt-2 mb-0"><Users className="mr-1" style={{ width: '1rem' }} /><span className="text-secondary mr-1">{"Contributors: "}</span>{typeof data.developer_data.pull_request_contributors === 'number' ? numeral(data.developer_data.pull_request_contributors).format('0,0') : <span className="text-secondary">{"N/A"}</span>}</p>
                                  </Col>
                                  <Col xs="6">
                                    <p className="d-flex align-items-center mt-2 mb-0"><GitMerge className="mr-1" style={{ width: '1rem' }} /><span className="text-secondary mr-1">{"Merged: "}</span>{typeof data.developer_data.pull_requests_merged === 'number' ? numeral(data.developer_data.pull_requests_merged).format('0,0') : <span className="text-secondary">{"N/A"}</span>}</p>
                                  </Col>
                                  <Col xs="6">
                                    <p className="f-12 d-flex align-items-center mt-2 mb-0"><AlertCircle className="mr-1" style={{ width: '1rem' }} /><span className="text-secondary mr-1">{"Issue: "}</span>{typeof data.developer_data.closed_issues === 'number' ? numeral(data.developer_data.closed_issues).format('0,0') : <span className="text-secondary">{"-"}</span>}/{typeof data.developer_data.total_issues === 'number' ? numeral(data.developer_data.total_issues).format('0,0') : <span className="text-secondary">{"-"}</span>}</p>
                                  </Col>
                                  {data.developer_data.last_4_weeks_commit_activity_series && data.developer_data.last_4_weeks_commit_activity_series.length > 0 && (
                                    <Col xs="6">
                                      <p className="d-flex align-items-center mt-2 mb-0"><GitCommit className="mr-1" style={{ width: '1rem' }} /><span className="text-secondary mr-1">{"Commits: "}</span>{numeral(_.sum(data.developer_data.last_4_weeks_commit_activity_series)).format('0,0')}{gitShowMore ? <ChevronUp onClick={() => setGitShowMore(!gitShowMore)} className="text-secondary" style={{ width: '1rem', cursor: 'pointer' }} /> : <ChevronDown onClick={() => setGitShowMore(!gitShowMore)} className="text-secondary" style={{ width: '1rem', cursor: 'pointer' }} />}</p>
                                    </Col>
                                  )}
                                </Row>
                                {data.developer_data.last_4_weeks_commit_activity_series && data.developer_data.last_4_weeks_commit_activity_series.length > 0 && gitShowMore && (
                                  <Card className="o-hidden bg-transparent mt-2 mb-0">
                                    <div className="chart-widget-top">
                                      <Row className="card-body p-2">
                                        <Col xs="8">
                                          <div className="h6 f-w-600 font-primary">{"Commits"}</div>
                                        </Col>
                                        <Col xs="4" className="text-right">
                                          <div className="h6 num total-value">{numeral(_.sum(data.developer_data.last_4_weeks_commit_activity_series)).format('0,0')}</div>
                                        </Col>
                                      </Row>
                                      <div>
                                        <div id="chart-widget1">
                                          <Chart
                                            height="80"
                                            type="area"
                                            options={{
                                              chart: { toolbar: { show: false }, height: 80, type: 'area' },
                                              dataLabels: { enabled: false },
                                              stroke: { curve: 'smooth' },
                                              xaxis: {
                                                show: false,
                                                type: 'datetime',
                                                categories: data.developer_data.last_4_weeks_commit_activity_series.map((d, i) => moment().add(-1 * i, 'days').format()),
                                                labels: { show: false },
                                                axisBorder: { show: false },
                                              },
                                              yaxis: { labels: { show: false, }, },
                                              grid: { show: false, padding: { left: -8, right: 0, bottom: 0 } },
                                              fill: {
                                                type: 'gradient',
                                                gradient: {
                                                  shade: 'light',
                                                  type: 'vertical',
                                                  shadeIntensity: 0.4,
                                                  inverseColors: false,
                                                  opacityFrom: 0.8,
                                                  opacityTo: 0.2,
                                                  stops: [0, 100]
                                                },
                                              },
                                              colors:[ConfigDB.data.color.primary_color],
                                              tooltip: { x: { format: 'MMM d, yyyy' } }
                                            }}
                                            series={[{ name: 'commits', data: data.developer_data.last_4_weeks_commit_activity_series }]}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </Card>
                                )}
                              </Col>
                            )}
                            {youtubeUrl && (
                              <Col xl={hasDeveloper ? 2 : 3} lg={!hasDeveloper ? 3 : 4} md="6" xs="12" className={`mt-4 mt-${hasDeveloper ? 'xl' : 'lg'}-0`}>
                                <div className="d-flex align-items-center mb-3"><h2 className="f-16 mb-0">{/*<i className="icofont icofont-social-youtube-play font-danger mr-1" />*/}{"Token Explained"}</h2></div>
                                {youtubeId ? <LiteYouTubeEmbed id={youtubeId} /> : <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">{youtubeUrl}</a>}
                              </Col>
                            )}
                            <Col xl={hasDeveloper || youtubeUrl ? 3 : 4} lg={(hasDeveloper || youtubeUrl) && !(hasDeveloper && youtubeUrl) ? 3 : 4} md={(hasDeveloper || youtubeUrl) && !(hasDeveloper && youtubeUrl) ? 6 : 12} xs="12" className={`mt-4 mt-${hasDeveloper && youtubeUrl ? 'xl' : 'lg'}-0 ml-auto`} style={{ maxWidth: hasDeveloper && youtubeUrl ? width > 1366 ? '20rem' : width > 1200 ? '17rem' : '' : '' }}>
                              <h2 className="f-16 mb-3">{"Convert"}</h2>
                                <Card className="convert-price-card my-2">
                                  <CardHeader className="d-flex align-items-center p-2">
                                    <div className="media py-1" style={{ maxWidth: hasDeveloper ? '35%' : '50%' }}>
                                      <img src={data.image && data.image.large} alt={data.symbol && data.symbol.toUpperCase()} className="img-fluid" style={{ maxWidth: hasDeveloper ? '1.25rem' : '1.5rem', marginRight: '.5rem' }} />
                                      <div className="media-body">
                                        <span className="f-14">{data.symbol && data.symbol.toUpperCase()}</span>
                                        <p className="font-roboto f-10 text-secondary mb-0">{data.name}</p>
                                      </div>
                                    </div>
                                    <Input type="text" value={fromCurrencyValue} onChange={e => handleFromCurrencyValueChange(e.target.value)} className="b-r-6 f-14 text-right ml-auto" style={{ backgroundColor: 'rgba(0,0,0,.015)', maxWidth: 'max-content', border: 'none', boxShadow: 'none' }} />
                                  </CardHeader>
                                  <CardBody className="d-flex align-items-center p-2" style={{ backgroundColor: 'rgba(0,0,0,.025)', borderRadius: '0 0 15px 15px' }}>
                                    <div className="media py-1" style={{ maxWidth: hasDeveloper ? '35%' : '50%' }}>
                                      {currencyData && currencyData.flag ?
                                        <i className={`flag-icon flag-icon-${currencyData.flag} mt-1`} style={{ width: hasDeveloper ? '1.25rem' : '1.5rem', marginRight: '.5rem' }} />
                                        :
                                        <img src={currencyData && currencyData.image} alt={currency && currency.toUpperCase()} className="img-fluid mt-1" style={{ maxWidth: hasDeveloper ? '1.25rem' : '1.5rem', marginRight: '.5rem' }} />
                                      }
                                      <div className="media-body">
                                        <span className="f-14">{currency && currency.toUpperCase()}</span>
                                        <p className="font-roboto f-10 text-secondary mb-0">{currencyData && currencyData.title}</p>
                                      </div>
                                    </div>
                                    <Input type="text" value={toCurrencyValue} onChange={e => handleToCurrencyValueChange(e.target.value)} placeholder="0.00" className="b-r-6 f-14 text-right ml-auto" style={{ backgroundColor: 'rgba(0,0,0,.015)', maxWidth: 'max-content', border: 'none', boxShadow: 'none' }} />
                                  </CardBody>
                                </Card>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </CardHeader>
                    <CardBody className="pt-3 pb-2 px-0">
                      <div ref={statsRef} className="p-absolute" style={{ marginTop: width <= 345 ? '-138px' : width <= 575 ? '-116px' : width <= 907 ? '-121px' : width <= 991 ? '-99px' : width <= 1200 ? '-119px' : '-81px' }} />
                      <Row className="pt-4">
                        <Col lg="8" md="12" xs="12">
                          {data.market_data && (
                            <div className="markets-table table-align-top responsive-tbl mb-4">
                              <div className="table-responsive">
                                <Table borderless>
                                  <thead>
                                    <tr>
                                      <th className="text-center">
                                        <div className="d-flex align-items-center justify-content-center">
                                          <Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">1h</Badge>
                                        </div>
                                      </th>
                                      <th className="text-center">
                                        <div className="d-flex align-items-center justify-content-center">
                                          <Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">24h</Badge>
                                        </div>
                                      </th>
                                      <th className="text-center">
                                        <div className="d-flex align-items-center justify-content-center">
                                          <Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">7d</Badge>
                                        </div>
                                      </th>
                                      <th className="text-center">
                                        <div className="d-flex align-items-center justify-content-center">
                                          <Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">14d</Badge>
                                        </div>
                                      </th>
                                      <th className="text-center">
                                        <div className="d-flex align-items-center justify-content-center">
                                          <Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">30d</Badge>
                                        </div>
                                      </th>
                                      <th className="text-center">
                                        <div className="d-flex align-items-center justify-content-center">
                                          <Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">1y</Badge>
                                        </div>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td className={`text-center ${data.market_data.price_change_percentage_1h_in_currency ? data.market_data.price_change_percentage_1h_in_currency[currency] > 0 ? 'font-success' : data.market_data.price_change_percentage_1h_in_currency[currency] < 0 ? 'font-danger' : '' : ''}`}>{data.market_data.price_change_percentage_1h_in_currency && typeof data.market_data.price_change_percentage_1h_in_currency[currency] === 'number' && data.market_data.price_change_percentage_1h_in_currency[currency] !== 0 ? numberOptimizeDecimal(numeral(data.market_data.price_change_percentage_1h_in_currency[currency] / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(data.market_data.price_change_percentage_1h_in_currency[currency] / 100).format('+0,0.00%')) : '-'}</td>
                                      <td className={`text-center ${data.market_data.price_change_percentage_24h_in_currency ? data.market_data.price_change_percentage_24h_in_currency[currency] > 0 ? 'font-success' : data.market_data.price_change_percentage_24h_in_currency[currency] < 0 ? 'font-danger' : '' : ''}`}>{data.market_data.price_change_percentage_24h_in_currency && typeof data.market_data.price_change_percentage_24h_in_currency[currency] === 'number' && data.market_data.price_change_percentage_24h_in_currency[currency] !== 0 ? numberOptimizeDecimal(numeral(data.market_data.price_change_percentage_24h_in_currency[currency] / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(data.market_data.price_change_percentage_24h_in_currency[currency] / 100).format('+0,0.00%')) : '-'}</td>
                                      <td className={`text-center ${data.market_data.price_change_percentage_7d_in_currency ? data.market_data.price_change_percentage_7d_in_currency[currency] > 0 ? 'font-success' : data.market_data.price_change_percentage_7d_in_currency[currency] < 0 ? 'font-danger' : '' : ''}`}>{data.market_data.price_change_percentage_7d_in_currency && typeof data.market_data.price_change_percentage_7d_in_currency[currency] === 'number' && data.market_data.price_change_percentage_7d_in_currency[currency] !== 0 ? numberOptimizeDecimal(numeral(data.market_data.price_change_percentage_7d_in_currency[currency] / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(data.market_data.price_change_percentage_7d_in_currency[currency] / 100).format('+0,0.00%')) : '-'}</td>
                                      <td className={`text-center ${data.market_data.price_change_percentage_14d_in_currency ? data.market_data.price_change_percentage_14d_in_currency[currency] > 0 ? 'font-success' : data.market_data.price_change_percentage_14d_in_currency[currency] < 0 ? 'font-danger' : '' : ''}`}>{data.market_data.price_change_percentage_14d_in_currency && typeof data.market_data.price_change_percentage_14d_in_currency[currency] === 'number' && data.market_data.price_change_percentage_14d_in_currency[currency] !== 0 ? numberOptimizeDecimal(numeral(data.market_data.price_change_percentage_14d_in_currency[currency] / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(data.market_data.price_change_percentage_14d_in_currency[currency] / 100).format('+0,0.00%')) : '-'}</td>
                                      <td className={`text-center ${data.market_data.price_change_percentage_30d_in_currency ? data.market_data.price_change_percentage_30d_in_currency[currency] > 0 ? 'font-success' : data.market_data.price_change_percentage_30d_in_currency[currency] < 0 ? 'font-danger' : '' : ''}`}>{data.market_data.price_change_percentage_30d_in_currency && typeof data.market_data.price_change_percentage_30d_in_currency[currency] === 'number' && data.market_data.price_change_percentage_30d_in_currency[currency] !== 0 ? numberOptimizeDecimal(numeral(data.market_data.price_change_percentage_30d_in_currency[currency] / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(data.market_data.price_change_percentage_30d_in_currency[currency] / 100).format('+0,0.00%')) : '-'}</td>
                                      <td className={`text-center ${data.market_data.price_change_percentage_1y_in_currency ? data.market_data.price_change_percentage_1y_in_currency[currency] > 0 ? 'font-success' : data.market_data.price_change_percentage_1y_in_currency[currency] < 0 ? 'font-danger' : '' : ''}`}>{data.market_data.price_change_percentage_1y_in_currency && typeof data.market_data.price_change_percentage_1y_in_currency[currency] === 'number' && data.market_data.price_change_percentage_1y_in_currency[currency] !== 0 ? numberOptimizeDecimal(numeral(data.market_data.price_change_percentage_1y_in_currency[currency] / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(data.market_data.price_change_percentage_1y_in_currency[currency] / 100).format('+0,0.00%')) : '-'}</td>
                                    </tr>
                                  </tbody>
                                </Table>
                              </div>
                            </div>
                          )}
                          <div className="d-flex align-items-center">
                            <Nav className="nav-pills nav-primary">
                              {['line', 'candle'].map(t => (
                                <NavItem key={t} style={{ maxWidth: width <= 575 ? 'fit-content' : '' }}>
                                  <NavLink onClick={() => setChartTypeSelected(t)} className={`${chartTypeSelected === t ? 'active' : ''}${width <= 575 ? ' f-10 p-1' : ''}`} style={{ width: width <= 575 ? '3rem' : '' }}>
                                    {getName(t, true)}
                                  </NavLink>
                                </NavItem>
                              ))}
                              {hasAnalysis && (<Button size="xs" color="info" onClick={() => analysisRef.current.scrollIntoView({ behavior: 'smooth' })} className="d-flex align-items-center justify-content-center px-2 ml-1">{"Analysis"}{width > 768 && (<>&nbsp;Chart</>)}</Button>)}
                            </Nav>
                            <Nav className="nav-pills nav-primary ml-auto">
                              {timeRanges.map(r => (
                                <NavItem key={r.day} style={{ maxWidth: width <= 575 ? 'fit-content' : '' }}>
                                  <NavLink onClick={() => setChartTimeSelected(r.day)} className={`${chartTimeSelected === r.day ? 'active' : ''}${width <= 575 ? ' f-10 p-1' : ''}`} style={{ width: width <= 575 ? '2rem' : '' }}>
                                    {width <= 767 ? r.short : r.title}
                                  </NavLink>
                                </NavItem>
                              ))}
                            </Nav>
                          </div>
                          {chartTypeSelected === 'line' && marketChartDataMap && (
                            <div className="mt-4">
                              {marketChartLoading ?
                                <div className="loader-box" style={{ height: '25rem' }}>
                                  <div className="loader-10" />
                                </div>
                                :
                                marketChartDataMap[chartTimeSelected] ?
                                  <>
                                    <Chart
                                      height="360"
                                      type="line"
                                      options={{
                                        chart: { width: 1200, height: 360, type: 'line', toolbar: { show: false } },
                                        colors: [ConfigDB.data.color.primary_color, ConfigDB.data.color.secondary_color],
                                        stroke: { curve: 'smooth', width: 1.5 },
                                        markers: { size: 0 },
                                        title: { text: `${data.name} Chart${currencyData ? currencyData.symbol ? ` (${currencyData.symbol})` : currencyData.id ? ` (${currencyData.id.toUpperCase()})` : '' : ''}`, align: 'left' },
                                        labels: _.uniq(Object.keys(marketChartDataMap[chartTimeSelected]).flatMap(f => marketChartDataMap[chartTimeSelected][f].filter((d, i) => timeRanges[timeRanges.findIndex(r => r.day === chartTimeSelected)].interval || (marketChartDataMap[chartTimeSelected][f].length - i) % (chartTimeSelected > 90 ? marketChartDataMap[chartTimeSelected][f].length > 8 ? 4 : 2 : marketChartDataMap[chartTimeSelected][f].length > 24 ? 12 : 2) === 1).flatMap(d => d.slice(0, 1)))).map(t => moment(t).format('YYYY-MM-DDTHH:mm:ss.sssZ')),
                                        xaxis: { type: 'datetime', labels: { datetimeUTC: false } },
                                        yaxis: [
                                          {
                                            title: { text: `Price${currencyData ? currencyData.symbol ? ` (${currencyData.symbol})` : currencyData.id ? ` (${currencyData.id.toUpperCase()})` : '' : ''}` },
                                            labels: { formatter: v => numberOptimizeDecimal(numeral(v.toFixed(_.min(marketChartDataMap[chartTimeSelected].prices.flatMap(d => d.slice(1))) > 1 ? 2 : 8)).format(`0,0.${[...Array(_.min(marketChartDataMap[chartTimeSelected].prices.flatMap(d => d.slice(1))) > 1 ? 2 : 8).keys()].map(i => '0')}`)) }
                                          },
                                          {
                                            title: { text: `Market Cap${currencyData ? currencyData.symbol ? ` (${currencyData.symbol})` : currencyData.id ? ` (${currencyData.id.toUpperCase()})` : '' : ''}` },
                                            opposite: true,
                                            labels: { formatter: v => numberOptimizeDecimal(numeral(v).format('0,0')) }
                                          },
                                        ],
                                        tooltip: { shared: true, x: { format: 'ddd, d MMM yyyy hh:mm TT' }, y: { formatter: v => numberOptimizeDecimal(numeral(v.toFixed(v >= 1000 ? 0 : v > 1 ? 2 : 8)).format(`0,0.${[...Array(v >= 1000 ? 0 : v > 1 ? 2 : 8).keys()].map(i => '0')}`)) } }
                                      }}
                                      series={['prices', 'market_caps'].map(f => {
                                        return {
                                          name: getName(f, true).substring(0, getName(f, true).length - 1),
                                          type: 'line',
                                          data: marketChartDataMap[chartTimeSelected][f].filter((d, i) => timeRanges[timeRanges.findIndex(r => r.day === chartTimeSelected)].interval || (marketChartDataMap[chartTimeSelected][f].length - i) % (chartTimeSelected > 90 ? marketChartDataMap[chartTimeSelected][f].length > 8 ? 4 : 2 : marketChartDataMap[chartTimeSelected][f].length > 24 ? 12 : 2) === 1).flatMap(d => d.slice(1))
                                        };
                                      })}
                                    />
                                    <Chart
                                      height="180"
                                      type="bar"
                                      options={{
                                        chart: { width: 1200, height: 180, type: 'bar', toolbar: { show: false } },
                                        legend: { show: false },
                                        colors: [ConfigDB.data.color.primary_color],
                                        fill: { colors: [ConfigDB.data.color.primary_color] },
                                        dataLabels: { enabled: false },
                                        plotOptions: { bar: { radius: 10, horizontal: false, columnWidth: '55%' } },
                                        stroke: { show: true, colors: ['transparent'], curve: 'smooth', lineCap: 'butt' },
                                        title: { text: `${data.name} Volume${currencyData ? currencyData.symbol ? ` (${currencyData.symbol})` : currencyData.id ? ` (${currencyData.id.toUpperCase()})` : '' : ''}`, align: 'right' },
                                        xaxis: { type: 'datetime', labels: { datetimeUTC: false } },
                                        yaxis: { opposite: true, labels: { formatter: v => numberOptimizeDecimal(numeral(v).format('0,0')) } },
                                        tooltip: { x: { format: 'ddd, d MMM yyyy hh:mm TT' } }
                                      }}
                                      series={[{ name: 'Volume', data: marketChartDataMap[chartTimeSelected].total_volumes.filter((d, i) => timeRanges[timeRanges.findIndex(r => r.day === chartTimeSelected)].interval || (marketChartDataMap[chartTimeSelected].total_volumes.length - i) % (chartTimeSelected > 90 ? marketChartDataMap[chartTimeSelected].total_volumes.length > 8 ? 4 : 2 : marketChartDataMap[chartTimeSelected].total_volumes.length > 24 ? 12 : 2) === 1).map(d => { return { x: new Date(d[0]), y: d[1] }; }) }]}
                                      className="pl-4"
                                    />
                                  </>
                                  :
                                  <div className="text-center d-flex align-items-center justify-content-center" style={{ height: '25rem' }}>
                                    <Container>
                                      <Media body className="img-100" src={sad} alt="404" />
                                      <div className="h2 font-primary mt-4">{"Data not found"}</div>
                                    </Container>
                                  </div>
                              }
                            </div>
                          )}
                          {chartTypeSelected === 'candle' && ohlcDataMap && (
                            <div className="mt-4">
                              {ohlcChartLoading ?
                                <div className="loader-box" style={{ height: '25rem' }}>
                                  <div className="loader-10" />
                                </div>
                                :
                                ohlcDataMap[chartTimeSelected] ?
                                  <Chart
                                    height="480"
                                    type="candlestick"
                                    options={{
                                      chart: { width: 1200, height: 480, type: 'candlestick', toolbar: { show: false } },
                                      plotOptions: { candlestick: { colors: { upward: ConfigDB.data.color.primary_color, downward: ConfigDB.data.color.secondary_color } } },
                                      colors: [ConfigDB.data.color.primary_color],
                                      title: { text: `${data.name} Price${currencyData ? currencyData.symbol ? ` (${currencyData.symbol})` : currencyData.id ? ` (${currencyData.id.toUpperCase()})` : '' : ''}`, align: 'left' },
                                      xaxis: { type: 'datetime', labels: { datetimeUTC: false } },
                                      yaxis: { tooltip: { enabled: true }, labels: { formatter: v => numberOptimizeDecimal(numeral(v.toFixed(_.max(ohlcDataMap[chartTimeSelected].flatMap(ohlc => ohlc.slice(1).map(d => numberOptimizeDecimal(d).indexOf('.') > -1 ? numberOptimizeDecimal(d).substring(numberOptimizeDecimal(d).indexOf('.') + 1).length : 2))))).format(`0,0.${[...Array(_.max(ohlcDataMap[chartTimeSelected].flatMap(ohlc => ohlc.slice(1).map(d => numberOptimizeDecimal(d).indexOf('.') > -1 ? numberOptimizeDecimal(d).substring(numberOptimizeDecimal(d).indexOf('.') + 1).length : 2)))).keys()].map(i => '0')}`)) } },
                                      tooltip: { x: { format: 'ddd, d MMM yyyy hh:mm TT' } }
                                    }}
                                    series={[{ data: ohlcDataMap[chartTimeSelected].map(ohlc => { return { x: new Date(ohlc[0]), y: ohlc.slice(1) }; }) }]}
                                    className="candlestick-chart"
                                  />
                                  :
                                  <div className="text-center d-flex align-items-center justify-content-center" style={{ height: '25rem' }}>
                                    <Container>
                                      <Media body className="img-100" src={sad} alt="404" />
                                      <div className="h2 font-primary mt-4">{"Data not found"}</div>
                                    </Container>
                                  </div>
                              }
                            </div>
                          )}
                          {data.description && data.description.en ?
                            <div className="mt-4 pl-0 pl-lg-3">
                              <h1 className="f-18">{"What is"} {data.name}{data.symbol && (<>&nbsp;({data.symbol.toUpperCase()})</>)}?</h1>
                              <p className="text-justify"><Linkify>{parse(data.description.en.replaceAll('\n', '<br>').replaceAll('https://www.coingecko.com/en/coins/', `${process.env.REACT_APP_SITE_URL}/coin/`).replace(`${process.env.REACT_APP_SITE_URL}/coin/all`, 'https://www.coingecko.com/en/coins/all').replaceAll('https://www.coingecko.com/en/exchanges/', `${process.env.REACT_APP_SITE_URL}/exchange/`))}</Linkify></p>
                            </div>
                            :
                            data.paprika && data.paprika.description ?
                              <div className="mt-4 pl-0 pl-lg-3">
                                <h1 className="f-18">{"What is"} {data.name}{data.symbol && (<>&nbsp;({data.symbol.toUpperCase()})</>)}?</h1>
                                <p className="text-justify"><Linkify>{parse(data.paprika.description)}</Linkify></p>
                              </div>
                              :
                              null
                          }
                        </Col>
                        <Col lg="4" md="12" xs="12" className="mt-4 mt-lg-0">
                          <Card className="mb-0">
                            <CardHeader className="p-4" style={{ backgroundColor: 'rgba(0,0,0,.065)', borderBottom: '1px solid rgba(0,0,0,.065)' }}>
                              <h2 className="f-20 d-flex align-items-center mb-0">{data.image && data.image.large && (<div className="avatar mr-2"><Media body className="img-30" src={data.image.large} alt={data.symbol && data.symbol.toUpperCase()} /></div>)}{data.symbol && data.symbol.toUpperCase()}{" Price Statistics"}</h2>
                            </CardHeader>
                            <CardBody className="p-4" style={{ backgroundColor: 'rgba(0,0,0,.065)', borderRadius: '0 0 15px 15px' }}>
                              <h3><p className="text-info mb-0">{data.name}{" Today"}</p></h3>
                              <div className="d-flex align-items-center mt-3">
                                <span className="text-secondary mr-1">{"Price"}</span>
                                <span className="text-right ml-auto">{data.market_data && data.market_data.current_price && typeof data.market_data.current_price[currency] === 'number' ? <>{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(data.market_data.current_price[currency]).format('0,0.0000000000'))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</> : 'N/A'}</span>
                              </div>
                              <div className="d-flex align-items-center mt-3">
                                <span className="text-secondary d-flex align-items-center mr-1">{"Price Change"}<Badge color="light" pill className="f-10 text-secondary f-w-300 ml-2">24h</Badge></span>
                                <span className="text-right ml-auto">{data.market_data && data.market_data.price_change_24h_in_currency && typeof data.market_data.price_change_24h_in_currency[currency] === 'number' ? <>{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(data.market_data.price_change_24h_in_currency[currency]).format('+0,0.0000000000'))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</> : 'N/A'}</span>
                              </div>
                              {data.market_data && typeof data.market_data.price_change_percentage_24h_in_currency && typeof data.market_data.price_change_percentage_24h_in_currency[currency] === 'number' && (<p className={`font-${data.market_data.price_change_percentage_24h_in_currency[currency] > 0 ? 'success' : data.market_data.price_change_percentage_24h_in_currency[currency] < 0 ? 'danger' : 'light'} text-right mb-0`}>{numeral(data.market_data.price_change_percentage_24h_in_currency[currency] / 100).format('+0,0.00%')}</p>)}
                              <div className="d-flex align-items-center mt-3">
                                <span className="text-secondary d-flex align-items-center mr-1">{"Low / High"}<Badge color="light" pill className="f-10 text-secondary f-w-300 ml-2">24h</Badge></span>
                                <span className="text-right ml-auto">{data.market_data && data.market_data.low_24h && typeof data.market_data.low_24h[currency] === 'number' ? <>{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(data.market_data.low_24h[currency]).format('0,0.0000000000'))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</> : 'N/A'}{" / "}{data.market_data && data.market_data.high_24h && typeof data.market_data.high_24h[currency] === 'number' ? <>{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(data.market_data.high_24h[currency]).format('0,0.0000000000'))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</> : 'N/A'}</span>
                              </div>
                              <div className="d-flex align-items-center mt-3">
                                <span className="text-secondary d-flex align-items-center mr-1">{"Volume"}<Badge color="light" pill className="f-10 text-secondary f-w-300 ml-2">24h</Badge></span>
                                <span className="text-right ml-auto">{data.market_data && data.market_data.total_volume && typeof data.market_data.total_volume[currency] === 'number' ? <>{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(data.market_data.total_volume[currency]).format('0,0.0000000000'))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</> : 'N/A'}</span>
                              </div>
                              <h3><p className="text-info mt-4 mb-0 pt-1">{data.name}{" Market Cap"}</p></h3>
                              <div className="d-flex align-items-center mt-3">
                                <span className="text-secondary mr-1">{"Market Rank"}</span>
                                <span className="text-right ml-auto">{typeof data.market_cap_rank === 'number' ? <>{"#"}{numeral(data.market_cap_rank).format('0,0')}</> : 'N/A'}</span>
                              </div>
                              {globalData && globalData.market_cap_percentage && typeof globalData.market_cap_percentage[data.symbol] === 'number' && (
                                <div className="d-flex align-items-center mt-3">
                                  <span className="text-secondary mr-1">{"Market Dominance"}</span>
                                  <span className="text-right ml-auto">{globalData && globalData.market_cap_percentage && typeof globalData.market_cap_percentage[data.symbol] === 'number' ? numeral(globalData.market_cap_percentage[data.symbol] / 100).format('0,0.00%') : 'N/A'}</span>
                                </div>
                              )}
                              <div className="d-flex align-items-center mt-3">
                                <span className="text-secondary mr-1">{"Market Cap"}</span>
                                <span className="text-right ml-auto">{data.market_data && data.market_data.market_cap && typeof data.market_data.market_cap[currency] === 'number' && data.market_data.market_cap[currency] > 0 ? <>{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(data.market_data.market_cap[currency]).format('0,0.0000000000'))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</> : 'N/A'}</span>
                              </div>
                              {data.market_data && data.market_data.market_cap_change_percentage_24h_in_currency && typeof data.market_data.market_cap_change_percentage_24h_in_currency[currency] === 'number' && data.market_data.market_cap[currency] > 0 && (<p className={`font-${data.market_data.market_cap_change_percentage_24h_in_currency[currency] > 0 ? 'success' : data.market_data.market_cap_change_percentage_24h_in_currency[currency] < 0 ? 'danger' : 'light'} text-right mb-0`}>{numeral(data.market_data.market_cap_change_percentage_24h_in_currency[currency] / 100).format('+0,0.00%')}</p>)}
                              <div className="d-flex align-items-center mt-3">
                                <span className="text-secondary mr-1">{"Fully Diluted Valuation"}</span>
                                <span className="text-right ml-auto">{data.market_data && data.market_data.fully_diluted_valuation && typeof data.market_data.fully_diluted_valuation[currency] === 'number' ? <>{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(data.market_data.fully_diluted_valuation[currency]).format('0,0.0000000000'))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</> : '-'}</span>
                              </div>
                              <h3><p className="text-info mt-4 mb-0 pt-1">{data.name}{" Supply"}</p></h3>
                              <div className="d-flex align-items-center mt-3">
                                <span className="text-secondary mr-1">{"Circulating Supply"}</span>
                                <span className="text-right ml-auto">{data.market_data && typeof data.market_data.circulating_supply === 'number' && data.market_data.circulating_supply > 0 ? <>{numberOptimizeDecimal(numeral(data.market_data.circulating_supply).format('0,0'))}{data.symbol && (<>&nbsp;{data.symbol.toUpperCase()}</>)}</> : 'N/A'}</span>
                              </div>
                              <div className="d-flex align-items-center mt-3">
                                <span className="text-secondary mr-1">{"Total Supply"}</span>
                                <span className="text-right ml-auto">{data.market_data && typeof data.market_data.total_supply === 'number' ? <>{numberOptimizeDecimal(numeral(data.market_data.total_supply).format('0,0'))}{data.symbol && (<>&nbsp;{data.symbol.toUpperCase()}</>)}</> : '-'}</span>
                              </div>
                              <div className="d-flex align-items-center mt-3">
                                <span className="text-secondary mr-1">{"Max Supply"}</span>
                                <span className="text-right ml-auto">{data.market_data && typeof data.market_data.max_supply === 'number' ? <>{numberOptimizeDecimal(numeral(data.market_data.max_supply).format('0,0'))}{data.symbol && (<>&nbsp;{data.symbol.toUpperCase()}</>)}</> : '-'}</span>
                              </div>
                              <h3><p className="text-info mt-4 mb-0 pt-1">{data.name}{" History"}</p></h3>
                              {ohlcDataMap && timeRanges.filter(r => r.day > 1 && ohlcDataMap[r.day]).map((r, key) => (
                                <div key={key} className="d-flex align-items-center mt-3">
                                  <span className="text-secondary d-flex align-items-center mr-1"><Badge color="light" pill className="f-10 text-secondary f-w-300 mr-2">{r.short}</Badge>{"Low / High"}</span>
                                  <span className="text-right ml-auto">{typeof _.min(ohlcDataMap[r.day].map(ohlc => ohlc[3]).filter(l => typeof l === 'number')) === 'number' ? <>{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(_.min(ohlcDataMap[r.day].map(ohlc => ohlc[3]).filter(l => typeof l === 'number'))).format('0,0.0000000000'))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</> : ohlcDataMap[r.day].findIndex(ohlc => ohlc.findIndex(d => typeof d === 'boolean') > -1) > -1 ? <>{currencyData && currencyData.symbol}{<div className={`loader-box h-auto d-inline-flex m${currencyData && currencyData.symbol ? 'l' : 'r'}-1`}><div className="loader-34" style={{ width: '1rem', height: '.5rem', marginTop: '-.125px' }} /></div>}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</> : 'N/A'}{" / "}{typeof _.max(ohlcDataMap[r.day].map(ohlc => ohlc[2]).filter(h => typeof h === 'number')) === 'number' ? <>{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(_.max(ohlcDataMap[r.day].map(ohlc => ohlc[2]).filter(h => typeof h === 'number'))).format('0,0.0000000000'))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</> : ohlcDataMap[r.day].findIndex(ohlc => ohlc.findIndex(d => typeof d === 'boolean') > -1) > -1 ? <>{currencyData && currencyData.symbol}{<div className={`loader-box h-auto d-inline-flex m${currencyData && currencyData.symbol ? 'l' : 'r'}-1`}><div className="loader-34" style={{ width: '1rem', height: '.5rem', marginTop: '-.125px' }} /></div>}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</> : 'N/A'}</span>
                                </div>
                              ))}
                              <div className="d-flex align-items-center mt-3">
                                <h3 className="mb-0"><span className="f-14 f-w-400 text-secondary mr-1">{"All Time High"}</span></h3>
                                <span className="text-right ml-auto">{data.market_data && data.market_data.ath && typeof data.market_data.ath[currency] === 'number' ? <>{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(data.market_data.ath[currency]).format('0,0.0000000000'))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</> : 'N/A'}</span>
                              </div>
                              <div className="d-flex align-items-center">
                                <span className="text-secondary mr-1">{data.market_data && data.market_data.ath_date && typeof data.market_data.ath_date[currency] == 'string' && (<span className="f-10 text-info">{moment(data.market_data.ath_date[currency], 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('MMM D, YYYY')} ({moment(data.market_data.ath_date[currency], 'YYYY-MM-DDTHH:mm:ss.SSSZ').fromNow()})</span>)}</span>
                                <span className="text-right ml-auto">{data.market_data && data.market_data.ath_change_percentage && typeof data.market_data.ath_change_percentage[currency] === 'number' && (<span className={`font-${data.market_data.ath_change_percentage[currency] > 0 ? 'success' : data.market_data.ath_change_percentage[currency] < 0 ? 'danger' : 'light'}`}>{numeral(data.market_data.ath_change_percentage[currency] / 100).format('+0,0.00%')}</span>)}</span>
                              </div>
                              <div className="d-flex align-items-center mt-3">
                                <h3 className="mb-0"><span className="f-14 f-w-400 text-secondary mr-1">{"All Time Low"}</span></h3>
                                <span className="text-right ml-auto">{data.market_data && data.market_data.atl && typeof data.market_data.atl[currency] === 'number' ? <>{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(data.market_data.atl[currency]).format('0,0.0000000000'))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</> : 'N/A'}</span>
                              </div>
                              <div className="d-flex align-items-center">
                                <span className="text-secondary mr-1">{data.market_data && data.market_data.atl_date && typeof data.market_data.atl_date[currency] == 'string' && (<span className="f-10 text-info">{moment(data.market_data.atl_date[currency], 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('MMM D, YYYY')} ({moment(data.market_data.atl_date[currency], 'YYYY-MM-DDTHH:mm:ss.SSSZ').fromNow()})</span>)}</span>
                                <span className="text-right ml-auto">{data.market_data && data.market_data.atl_change_percentage && typeof data.market_data.atl_change_percentage[currency] === 'number' && (<span className={`font-${data.market_data.atl_change_percentage[currency] > 0 ? 'success' : data.market_data.atl_change_percentage[currency] < 0 ? 'danger' : 'light'}`}>{numeral(data.market_data.atl_change_percentage[currency] / 100).format('+0,0.00%')}</span>)}</span>
                              </div>
                              {data.market_data && data.market_data.roi && (
                                <>
                                  <div className="d-flex align-items-center mt-3">
                                    <h3 className="mb-0"><span className="f-14 f-w-400 text-secondary mr-1">{"ROI"}</span></h3>
                                    <span className="text-right ml-auto">{typeof data.market_data.roi.times === 'number' ? <>{numberOptimizeDecimal(numeral(data.market_data.roi.times).format('0,0.00'))}{"x"}</> : 'N/A'}</span>
                                  </div>
                                  <div className="d-flex align-items-center">
                                    <span className="text-secondary mr-1">{data.market_data.roi.currency && (<span className="f-10 text-info">({getName(data.market_data.roi.currency, true)})</span>)}</span>
                                    <span className="text-right ml-auto">{typeof data.market_data.roi.percentage === 'number' && (<span className={`font-${data.market_data.roi.percentage > 0 ? 'success' : data.market_data.roi.percentage < 0 ? 'danger' : 'light'}`}>{numeral(data.market_data.roi.percentage / 100).format('+0,0.00%')}</span>)}</span>
                                  </div>
                                </>
                              )}
                              {data.ico_data && (
                                <>
                                  <h3 className="mb-0"><p className="text-info mt-4 mb-0 pt-1">{data.name}{" ICO"}</p></h3>
                                  {data.ico_data.ico_start_date && (<span className="f-10 text-info">{moment(data.ico_data.ico_start_date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('MMM D, YYYY')}</span>)}{data.ico_data.ico_end_date && (<span className="f-10 text-info">{data.ico_data.ico_start_date && (<>&nbsp;-&nbsp;</>)}{moment(data.ico_data.ico_end_date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('MMM D, YYYY')}</span>)}
                                  <div className="d-flex align-items-center mt-3">
                                    <span className="text-secondary mr-1">{"Public Sale"}</span>
                                    <span className="text-right ml-auto">{typeof data.ico_data.quote_public_sale_amount === 'number' ? <>{data.ico_data.quote_public_sale_currency === 'USD' ? '$' : ''}{data.ico_data.quote_public_sale_amount}{data.ico_data.quote_public_sale_currency === 'USD' ? '' : ` ${data.ico_data.quote_public_sale_currency}`}</> : 'N/A'}</span>
                                  </div>
                                  {data.ico_data.hardcap_amount && (
                                    <div className="d-flex align-items-center mt-3">
                                      <span className="text-secondary mr-1">{"Hard cap"}</span>
                                      <span className="text-right ml-auto">{data.ico_data.hardcap_currency === 'USD' ? '$' : ''}{numeral(data.ico_data.hardcap_amount).format('0,0')}{data.ico_data.hardcap_currency === 'USD' ? '' : ` ${data.ico_data.hardcap_currency}`}</span>
                                    </div>
                                  )}
                                  {data.ico_data.softcap_amount && (
                                    <div className="d-flex align-items-center mt-3">
                                      <span className="text-secondary mr-1">{"Soft cap"}</span>
                                      <span className="text-right ml-auto">{data.ico_data.softcap_currency === 'USD' ? '$' : ''}{numeral(data.ico_data.softcap_amount).format('0,0')}{data.ico_data.softcap_currency === 'USD' ? '' : ` ${data.ico_data.softcap_currency}`}</span>
                                    </div>
                                  )}
                                  {data.ico_data.amount_for_sale && (
                                    <div className="d-flex align-items-center mt-3">
                                      <span className="text-secondary mr-1">{"Amount for Sale"}</span>
                                      <span className="text-right ml-auto">{numeral(data.ico_data.amount_for_sale).format('0,0')}{data.symbol && (<>&nbsp;{data.symbol.toUpperCase()}</>)}</span>
                                    </div>
                                  )}
                                  {data.ico_data.total_raised && (
                                    <div className="d-flex align-items-center mt-3">
                                      <span className="text-secondary mr-1">{"Total Raised"}</span>
                                      <span className="text-right ml-auto">{data.ico_data.total_raised_currency === 'USD' ? '$' : ''}{numeral(data.ico_data.total_raised).format('0,0')}{data.ico_data.total_raised_currency === 'USD' ? '' : ` ${data.ico_data.total_raised_currency}`}</span>
                                    </div>
                                  )}
                                </>
                              )}
                            </CardBody>
                          </Card>
                        </Col>
                        {hasAnalysis && (
                          <>
                            <Col lg="12" md="12" xs="12" className="mt-4 pt-1 px-0 px-lg-4">
                              <div ref={analysisRef} className="p-absolute" style={{ marginTop: width <= 345 ? '-138px' : width <= 575 ? '-116px' : width <= 907 ? '-121px' : width <= 991 ? '-99px' : width <= 1200 ? '-119px' : '-81px' }} />
                              <div className="d-flex align-items-center pt-3 px-2">
                                <h1 className="f-20 my-auto">{"Analysis Chart"}</h1>
                              </div>
                            </Col>
                            <Col lg="12" md="12" xs="12" className="mt-3 mx-2" style={{ maxWidth: '99%', minHeight: '40rem', padding: `0 ${width <= 992 ? '0' : '1.55rem'}` }}>
                              <TradingViewWidget
                                symbol={`CRYPTOCAP:${data.symbol ? data.symbol.toUpperCase() : 'BTC'}`}
                                theme={theme === 'dark-only' ? Themes.DARK : Themes.LIGHT}
                                autosize
                              />
                            </Col>
                          </>
                        )}
                        {data.status_updates && data.status_updates.length > 0 && (
                          <Col lg="12" md="12" xs="12" className="mt-4 mb-2 px-0 px-lg-4">
                            <h1 className="f-20 d-flex align-items-center pt-3 px-2">{data.image && data.image.large && (<div className="avatar mr-2"><Media body className="img-30" src={data.image.large} alt={data.symbol && data.symbol.toUpperCase()} /></div>)}{data.name}{" Project Updates"}</h1>
                            <div className="d-flex align-items-top overflow-auto px-2">
                              {_.orderBy(data.status_updates, ['created_at'], ['desc']).map((d, i) => (
                                <div key={i} className={`mt-3 ml-${i === 0 ? 0 : 3}`} style={{ minWidth: '20rem', maxWidth: '20rem' }}>
                                  <Card className="mb-0 p-3" style={{ boxShadow: 'none' }}>
                                    <div className="media">
                                      <div className="media-body" style={{ maxWidth: '100%' }}>
                                        {d.user && (<div className="f-16 f-w-500">{d.user}</div>)}
                                        {d.user && d.user_title && (<div className="f-12 f-w-400 text-secondary">{d.user_title}</div>)}
                                        {d.description && (
                                          <h2 className="f-12 f-w-300 mt-3 mb-0" style={{ lineHeight: 'unset' }}>
                                            <span title={d.description} style={dataShowMore.findIndex(t => t === d.description) > -1 ? { whiteSpace: 'pre-wrap' } : { display: '-webkit-box', WebkitLineClamp: '5', WebkitBoxOrient: 'vertical', whiteSpace: 'pre-wrap', overflow: 'hidden' }}>
                                              <Linkify>{d.description}</Linkify>
                                            </span>
                                            {dataShowMore.findIndex(t => t === d.description) < 0 && (d.description.length > 120 || d.description.split('\\n').length > 5) && (
                                              <div onClick={() => setDataShowMore(dataShowMore.concat(d.description))} className="font-primary mt-2" style={{ cursor: 'pointer' }}>SHOW MORE</div>
                                            )}
                                            {dataShowMore.findIndex(t => t === d.description) > -1 && (
                                              <div onClick={() => setDataShowMore(dataShowMore.filter(t => t !== d.description))} className="font-secondary mt-2" style={{ cursor: 'pointer' }}>SHOW LESS</div>
                                            )}
                                          </h2>
                                        )}
                                        <div className="text-secondary d-flex align-items-center mt-2">{moment(d.created_at).fromNow()}{d.category && (<Badge color="light" pill className="f-12 f-w-300 ml-auto">{getName(d.category, true)}</Badge>)}</div>
                                      </div>
                                    </div>
                                  </Card>
                                </div>
                              ))}
                            </div>
                          </Col>
                        )}
                        <Col lg="12" md="12" xs="12" className="mt-5 pt-1 px-0 px-lg-4">
                          <div className="text-center mx-auto" style={{ maxWidth: width <= 575 ? '25rem' : '60rem' }}>
                            <Ads square={width <= 768} horizontal={width > 768} />
                          </div>
                        </Col>
                        {tickers && tickers.length > 0 && (
                          <Col lg="12" md="12" xs="12" className="mt-4 mb-2 px-0 px-lg-4">
                            <div ref={tableRef} className="p-absolute" style={{ marginTop: width <= 345 ? '-138px' : width <= 575 ? '-116px' : width <= 907 ? '-121px' : width <= 991 ? '-99px' : width <= 1200 ? '-119px' : '-81px' }} />
                            <div className="d-flex align-items-center pt-3 px-2">
                              <h1 className="f-20 d-flex align-items-center my-auto">{data.image && data.image.large && (<div className="avatar mr-2"><Media body className="img-30" src={data.image.large} alt={data.symbol && data.symbol.toUpperCase()} /></div>)}{data.name}{" Markets"}</h1>
                              <span className="d-flex align-items-center ml-auto"><Search /><Input type="text" value={marketSearch} onChange={e => setMarketSearch(e.target.value)} placeholder="Search" className="b-r-6 f-14 ml-2" style={{ maxWidth: 'max-content' }} /></span>
                            </div>
                            <div className="markets-table responsive-tbl mt-3">
                              <div className="table-responsive">
                                <Table borderless>
                                  <thead>
                                    <tr>
                                      <th
                                        onClick={() => setMarketSort({ field: 'rank', direction: (!marketSort.field || marketSort.field === 'rank') && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                        style={{ cursor: 'pointer' }}
                                      >
                                        {"#"}
                                        {marketSort.field === 'rank' && (
                                          <>
                                            {marketSort.direction === 'desc' ?
                                              <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                              :
                                              <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                            }
                                          </>
                                        )}
                                      </th>
                                      <th
                                        onClick={() => setMarketSort({ field: 'market.name', direction: marketSort.field === 'market.name' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                        className={`${marketSort.field === 'market.name' ? 'bg-light' : ''}`}
                                        style={{ cursor: 'pointer' }}
                                      >
                                        {"Exchange"}
                                        {marketSort.field === 'market.name' && (
                                          <>
                                            {marketSort.direction === 'desc' ?
                                              <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                              :
                                              <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                            }
                                          </>
                                        )}
                                      </th>
                                      <th
                                        onClick={() => setMarketSort({ field: 'pair', direction: marketSort.field === 'pair' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                        className={`${marketSort.field === 'pair' ? 'bg-light' : ''}`}
                                        style={{ cursor: 'pointer' }}
                                      >
                                        {"Pairs"}
                                        {marketSort.field === 'pair' && (
                                          <>
                                            {marketSort.direction === 'desc' ?
                                              <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                              :
                                              <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                            }
                                          </>
                                        )}
                                      </th>
                                      <th
                                        onClick={() => setMarketSort({ field: `converted_last.${currencyMarket}`, direction: marketSort.field === `converted_last.${currencyMarket}` && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                        className={`text-right ${marketSort.field === `converted_last.${currencyMarket}` ? 'bg-light' : ''}`}
                                        style={{ cursor: 'pointer' }}
                                      >
                                        {"Price"}
                                        {marketSort.field === `converted_last.${currencyMarket}` && (
                                          <>
                                            {marketSort.direction === 'desc' ?
                                              <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                              :
                                              <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                            }
                                          </>
                                        )}
                                      </th>
                                      <th
                                        onClick={() => setMarketSort({ field: 'bid_ask_spread_percentage', direction: marketSort.field === 'bid_ask_spread_percentage' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                        className={`text-right ${marketSort.field === 'bid_ask_spread_percentage' ? 'bg-light' : ''}`}
                                        style={{ cursor: 'pointer' }}
                                      >
                                        {"Spread %"}
                                        {marketSort.field === 'bid_ask_spread_percentage' && (
                                          <>
                                            {marketSort.direction === 'desc' ?
                                              <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                              :
                                              <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                            }
                                          </>
                                        )}
                                      </th>
                                      <th
                                        onClick={() => setMarketSort({ field: 'up_depth', direction: marketSort.field === 'up_depth' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                        className={`text-right ${marketSort.field === 'up_depth' ? 'bg-light' : ''}`}
                                        style={{ cursor: 'pointer' }}
                                      >
                                        {"+2% Depth"}
                                        {marketSort.field === 'up_depth' && (
                                          <>
                                            {marketSort.direction === 'desc' ?
                                              <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                              :
                                              <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                            }
                                          </>
                                        )}
                                      </th>
                                      <th
                                        onClick={() => setMarketSort({ field: 'down_depth', direction: marketSort.field === 'down_depth' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                        className={`text-right ${marketSort.field === 'down_depth' ? 'bg-light' : ''}`}
                                        style={{ cursor: 'pointer' }}
                                      >
                                        {"-2% Depth"}
                                        {marketSort.field === 'down_depth' && (
                                          <>
                                            {marketSort.direction === 'desc' ?
                                              <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                              :
                                              <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                            }
                                          </>
                                        )}
                                      </th>
                                      <th
                                        onClick={() => setMarketSort({ field: `converted_volume.${currencyMarket}`, direction: marketSort.field === `converted_volume.${currencyMarket}` && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                        className={`d-flex align-items-center justify-content-end ${marketSort.field === `converted_volume.${currencyMarket}` ? 'bg-light' : ''}`}
                                        style={{ cursor: 'pointer' }}
                                      >
                                        {"Volume"}
                                        <Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">24h</Badge>
                                        {marketSort.field === `converted_volume.${currencyMarket}` && (
                                          <>
                                            {marketSort.direction === 'desc' ?
                                              <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                              :
                                              <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                            }
                                          </>
                                        )}
                                      </th>
                                      <th
                                        onClick={() => setMarketSort({ field: 'volume_percentage', direction: marketSort.field === 'volume_percentage' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                        className={`text-right ${marketSort.field === 'volume_percentage' ? 'bg-light' : ''}`}
                                        style={{ cursor: 'pointer' }}
                                      >
                                        {"Volume %"}
                                        {marketSort.field === 'volume_percentage' && (
                                          <>
                                            {marketSort.direction === 'desc' ?
                                              <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                              :
                                              <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                            }
                                          </>
                                        )}
                                      </th>
                                      <th
                                        onClick={() => setMarketSort({ field: 'trust_score', direction: marketSort.field === 'trust_score' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                        className={`text-right ${marketSort.field === 'trust_score' ? 'bg-light' : ''}`}
                                        style={{ cursor: 'pointer' }}
                                      >
                                        {"Confidence"}
                                        {marketSort.field === 'trust_score' && (
                                          <>
                                            {marketSort.direction === 'desc' ?
                                              <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                              :
                                              <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                            }
                                          </>
                                        )}
                                      </th>
                                      {/*<th
                                        onClick={() => setMarketSort({ field: 'last_traded_at', direction: marketSort.field === 'last_traded_at' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                        className={`text-right ${marketSort.field === 'last_traded_at' ? 'bg-light' : ''}`}
                                        style={{ cursor: 'pointer' }}
                                      >
                                        {"Updated"}
                                        {marketSort.field === 'last_traded_at' && (
                                          <>
                                            {marketSort.direction === 'desc' ?
                                              <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                              :
                                              <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                            }
                                          </>
                                        )}
                                      </th>*/}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {_.orderBy(tickers.map((ticker, i) => {
                                      ticker.rank = i;
                                      ticker.pair = `${ticker.base && ticker.base.startsWith('0X') && ticker.coin_id ? allCryptoData && allCryptoData.coins && allCryptoData.coins.findIndex(c => c.id === ticker.coin_id) > -1 ? allCryptoData.coins[allCryptoData.coins.findIndex(c => c.id === ticker.coin_id)].name : getName(ticker.coin_id, true) : ticker.base}/${ticker.target && ticker.target.startsWith('0X') && ticker.target_coin_id ? allCryptoData && allCryptoData.coins && allCryptoData.coins.findIndex(c => c.id === ticker.target_coin_id) > -1 ? allCryptoData.coins[allCryptoData.coins.findIndex(c => c.id === ticker.target_coin_id)].name : getName(ticker.target_coin_id, true) : ticker.target}`;
                                      ticker.bid_ask_spread_percentage = typeof ticker.bid_ask_spread_percentage === 'number' ? ticker.bid_ask_spread_percentage : -1;
                                      ticker.up_depth = typeof ticker.cost_to_move_up_usd === 'number' ? ticker.cost_to_move_up_usd : 0;
                                      ticker.down_depth = typeof ticker.cost_to_move_down_usd === 'number' ? ticker.cost_to_move_down_usd : 0;
                                      ticker.volume_percentage = data.market_data && data.market_data.total_volume && data.market_data.total_volume[currencyMarket] > 0 && ticker.converted_volume && (typeof ticker.converted_volume[currencyMarket] === 'number' || typeof ticker.converted_volume[currencyMarket] === 'string') ? Number(ticker.converted_volume[currencyMarket]) / data.market_data.total_volume[currencyMarket] : null;
                                      ticker.trust_score = typeof ticker.trust_score === 'number' ? ticker.trust_score : ticker.trust_score === 'green' ? 1 : ticker.trust_score === 'yellow' ? 0.5 : 0;
                                      return ticker;
                                    }).filter((ticker, i) => (i < (marketPage + (marketPage < 0 ? 2 : 1)) * (marketPage < 0 ? 10 : 100)) && (!marketSearch || ticker.pair.toLowerCase().indexOf(marketSearch.toLowerCase()) > -1 || (ticker.market && ticker.market.name && ticker.market.name.toLowerCase().indexOf(marketSearch.toLowerCase()) > -1))), [marketSort.field || 'rank'], [marketSort.direction]).map((ticker, i) => (
                                      <tr key={i}>
                                        <td>{ticker.rank + 1}</td>
                                        <td className={`f-w-500 ${marketSort.field === 'market.name' ? 'bg-light' : ''}`}>
                                          <Link to={`/exchange${ticker.market && ticker.market.identifier ? `/${ticker.market.identifier}` : 's'}`}>
                                            <div className="d-flex">
                                              {ticker.market && ticker.market.logo && (
                                                <span className="avatar mr-2">
                                                  <Media body className="img-20" src={ticker.market.logo.replace('small', 'large')} alt={ticker.market && ticker.market.name} />
                                                </span>
                                              )}
                                              <span>{ticker.market && ticker.market.name}</span>
                                            </div>
                                          </Link>
                                        </td>
                                        <td className={`f-w-500 ${marketSort.field === 'pair' ? 'bg-light' : ''}`}>
                                          {ticker.trade_url ? <a href={ticker.trade_url} target="_blank" rel="noopener noreferrer">{ticker.pair}</a> : ticker.pair}
                                          {ticker.token_info_url && (<a href={ticker.token_info_url} target="_blank" rel="noopener noreferrer" className="ml-1"><Info className="w-auto font-info" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '4px' }} /></a>)}
                                          {ticker.base && ticker.base.startsWith('0X') && (<div className="f-10 text-info">{ticker.base}</div>)}
                                          {ticker.target && ticker.target.startsWith('0X') && (<div className="f-10 text-info">{"/"}{ticker.target}</div>)}
                                        </td>
                                        <td className={`text-right ${marketSort.field === `converted_last.${currencyMarket}` ? 'bg-light' : ''}`}>
                                          {ticker.converted_last && (typeof ticker.converted_last[currencyMarket] === 'number' || typeof ticker.converted_last[currencyMarket] === 'string') ?
                                            <>
                                              {currencyMarketData && currencyMarketData.symbol}
                                              {numberOptimizeDecimal(numeral(Number(ticker.converted_last[currencyMarket])).format(Number(ticker.converted_last[currencyMarket]) > 1 ? '0,0.00' : '0,0.0000000000'))}
                                              {!(currencyMarketData && currencyMarketData.symbol) && (<>&nbsp;{currencyMarket.toUpperCase()}</>)}
                                              {currency && currencyMarket && currency.toLowerCase() !== currencyMarket.toLowerCase() && exchangeRatesData[currencyMarket] && typeof exchangeRatesData[currencyMarket].value === 'number' && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' && (<div className="f-10 text-info">{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(Number(ticker.converted_last[currencyMarket]) * exchangeRatesData[currency].value / exchangeRatesData[currencyMarket].value).format(Number(ticker.converted_last[currencyMarket]) * exchangeRatesData[currency].value / exchangeRatesData[currencyMarket].value > 1 ? '0,0.00' : '0,0.0000000000'))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</div>)}
                                            </>
                                            :
                                            'N/A'
                                          }
                                          {ticker.target && currencyMarket && ticker.target.toLowerCase() !== currencyMarket.toLowerCase() && typeof ticker.last === 'number' && (<div className="f-10 text-info">{numberOptimizeDecimal(numeral(ticker.last).format(ticker.last > 1 ? '0,0.00' : '0,0.0000000000'))}{ticker.target && (<>&nbsp;{ticker.target.startsWith('0X') && ticker.target_coin_id && allCryptoData && allCryptoData.coins && allCryptoData.coins.findIndex(c => c.id === ticker.target_coin_id) > -1 ? allCryptoData.coins[allCryptoData.coins.findIndex(c => c.id === ticker.target_coin_id)].name : ticker.target.toUpperCase()}</>)}</div>)}
                                        </td>
                                        <td className={`text-right ${marketSort.field === 'bid_ask_spread_percentage' ? 'bg-light' : ''}`}>{typeof ticker.bid_ask_spread_percentage === 'number' && ticker.bid_ask_spread_percentage >= 0 ? numberOptimizeDecimal(numeral(ticker.bid_ask_spread_percentage / 100).format('0,0.00%')) : '-'}</td>
                                        <td className={`text-right ${marketSort.field === 'up_depth' ? 'bg-light' : ''}`}>
                                          {numeral(ticker.up_depth).format('$0,0')}
                                          {currency && currency.toLowerCase() !== 'usd' && exchangeRatesData['usd'] && typeof exchangeRatesData['usd'].value === 'number' && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' && (<div className="f-10 text-info">{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(Number(ticker.up_depth) * exchangeRatesData[currency].value / exchangeRatesData['usd'].value).format(Number(ticker.up_depth) * exchangeRatesData[currency].value / exchangeRatesData['usd'].value > 1 ? '0,0.00' : '0,0.0000000000'))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</div>)}
                                        </td>
                                        <td className={`text-right ${marketSort.field === 'down_depth' ? 'bg-light' : ''}`}>
                                          {numeral(ticker.down_depth).format('$0,0')}
                                          {currency && currency.toLowerCase() !== 'usd' && exchangeRatesData['usd'] && typeof exchangeRatesData['usd'].value === 'number' && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' && (<div className="f-10 text-info">{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(Number(ticker.down_depth) * exchangeRatesData[currency].value / exchangeRatesData['usd'].value).format(Number(ticker.down_depth) * exchangeRatesData[currency].value / exchangeRatesData['usd'].value > 1 ? '0,0.00' : '0,0.0000000000'))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</div>)}
                                        </td>
                                        <td className={`text-right ${marketSort.field === `converted_volume.${currencyMarket}` ? 'bg-light' : ''}`}>
                                          {ticker.converted_volume && (typeof ticker.converted_volume[currencyMarket] === 'number' || typeof ticker.converted_volume[currencyMarket] === 'string') ?
                                            <>
                                              {currencyMarketData && currencyMarketData.symbol}
                                              {numberOptimizeDecimal(numeral(Number(ticker.converted_volume[currencyMarket])).format('0,0'))}
                                              {!(currencyMarketData && currencyMarketData.symbol) && (<>&nbsp;{currencyMarket.toUpperCase()}</>)}
                                              {currency && currencyMarket && currency.toLowerCase() !== currencyMarket.toLowerCase() && exchangeRatesData[currencyMarket] && typeof exchangeRatesData[currencyMarket].value === 'number' && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' && (<div className="f-10 text-info">{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(Number(ticker.converted_volume[currencyMarket]) * exchangeRatesData[currency].value / exchangeRatesData[currencyMarket].value).format(Number(ticker.converted_last[currencyMarket]) * exchangeRatesData[currency].value / exchangeRatesData[currencyMarket].value > 1 ? '0,0.00' : '0,0.0000000000'))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</div>)}
                                            </>
                                            :
                                            'N/A'
                                          }
                                          {ticker.target && currencyMarket && ticker.target.toLowerCase() !== currencyMarket.toLowerCase() && typeof ticker.volume === 'number' && (<div className="f-10 text-info">{numberOptimizeDecimal(numeral(ticker.volume * ticker.last).format(ticker.volume * ticker.last > 1 ? '0,0' : '0,0.0000000000'))}{ticker.target && (<>&nbsp;{ticker.target.startsWith('0X') && ticker.target_coin_id && allCryptoData && allCryptoData.coins && allCryptoData.coins.findIndex(c => c.id === ticker.target_coin_id) > -1 ? allCryptoData.coins[allCryptoData.coins.findIndex(c => c.id === ticker.target_coin_id)].name : ticker.target.toUpperCase()}</>)}</div>)}
                                        </td>
                                        <td className={`text-right ${marketSort.field === 'volume_percentage' ? 'bg-light' : ''}`}>{typeof ticker.volume_percentage === 'number' ? numberOptimizeDecimal(numeral(ticker.volume_percentage).format('0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(ticker.volume_percentage).format('0,0.00%')) : '-'}</td>
                                        <td className={`text-right ${marketSort.field === 'trust_score' ? 'bg-light' : ''} font-${ticker.trust_score === 1 ? 'success' : ticker.trust_score === 0.5 ? 'warning' : 'danger'}`}>{ticker.trust_score ? <CheckCircle /> : <XCircle />}</td>
                                        {/*<td className={`font-roboto f-w-300 text-secondary text-right ${marketSort.field === 'last_traded_at' ? 'bg-light' : ''}`}>{moment(ticker.last_traded_at).fromNow()}</td>*/}
                                      </tr>
                                    ))}
                                  </tbody>
                                </Table>
                                {tickers.length % pageSize === 0 && !marketPageEnd && (<div className="text-center mt-3"><Button color="primary-2x" outline disabled={marketLoading} onClick={() => setMarketPage(marketPage + 1)}>{marketLoading ? 'Loading...' : 'See more'}</Button></div>)}
                              </div>
                            </div>
                          </Col>
                        )}
                      </Row>
                    </CardBody>
                  </Card>
                  :
                  null
            }
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
}

export default Coin;
