import React, { Fragment, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Row, Col, Card, CardHeader, CardBody, Media, Badge, Dropdown, DropdownMenu, DropdownItem, Input, Nav, NavItem, NavLink, Table, Button, Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import SweetAlert from 'sweetalert2';
import { Home, Power, Globe, ChevronDown, ChevronUp, ExternalLink, Info, CheckCircle, XCircle, Search, Briefcase } from 'react-feather';
import parse from 'html-react-parser';
import Linkify from 'react-linkify';
import Chart from 'react-apexcharts';
import _ from 'lodash';
import moment from 'moment';
import numeral from 'numeral';
import Spinner from '../../spinner';
import Ads from '../../../components/ads';
import Error404 from '../../../pages/errors/error404';
import sad from '../../../assets/images/other-images/sad.png';
import ConfigDB from '../../../data/customizer/config';
import { currenciesGroups } from '../../../layout/header/menus';
import { /*getCoinsMarkets, */getExchange, getExchangeTickers, getExchangeVolumeChart, getDerivativesExchange } from '../../../api';
import { useIsMountedRef, sleep, affiliateData, timeRanges, getName, numberOptimizeDecimal } from '../../../utils';

const Exchange = props => {
  const exchangeId = props.match ? props.match.params.exchange_id : null;
  const pageSize = 100;
  const isMountedRef = useIsMountedRef();
  const [data, setData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [dataShowMore, setDataShowMore] = useState([]);
  const [dataVsCurrency, setDataVsCurrency] = useState(null);
  const [chartTimeSelected, setChartTimeSelected] = useState(30);
  const [volumeChartDataMap, setVolumeChartDataMap] = useState({});
  const [volumeChartLoading, setVolumeChartLoading] = useState(false);
  const currency = useSelector(content => content.Preferences.vs_currency);
  const allCryptoData = useSelector(content => content.Data.all_crypto_data);
  const exchangeRatesData = useSelector(content => content.Data.exchange_rates_data);
  const allPaprikaExchangesData = useSelector(content => content.Data.all_paprika_exchanges_data);
  const [communitySelected, setCommunitySelected] = useState(false);
  const [tickers, setTickers] = useState([]);
  const [marketSort, setMarketSort] = useState({ field: null, direction: 'asc' });
  const [marketPage, setMarketPage] = useState(19);
  const [marketPageEnd, setMarketPageEnd] = useState(false);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketSearch, setMarketSearch] = useState('');
  const tableRef = useRef(null);
  const [tablePage, setTablePage] = useState(0);
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

  const onCommunitySelected = selected => {
    setCommunitySelected(selected);
  };

  const onAllSelected = selected => {
    onCommunitySelected(selected);
  };

  useEffect(() => {
    const getData = async () => {
      if (exchangeId) {
        if (currency !== dataVsCurrency) {
          if (isMountedRef.current) {
            setDataVsCurrency(currency);
          }
        }
        else {
          if (isMountedRef.current) {
            setDataLoading(true);
          }
          try {
            let exchangeData = await getExchange(exchangeId, null, allPaprikaExchangesData);
            exchangeData = exchangeData && !exchangeData.error ? exchangeData : null;
            if (!(exchangeData && exchangeData.tickers && exchangeData.tickers.length > 0)) {
              await sleep(500);
              const derivativesExchangeData = await getDerivativesExchange(exchangeId, { include_tickers: 'unexpired' });
              if (derivativesExchangeData && !derivativesExchangeData.error) {
                exchangeData = exchangeData ? exchangeData : {};
                for (let key in derivativesExchangeData) {
                  if (derivativesExchangeData[key]) {
                    exchangeData[key] = derivativesExchangeData[key];
                  }
                }
              }
            }
            if (isMountedRef.current) {
              if (exchangeData) {
                setData(exchangeData);
              }
            }
          } catch (err) {}
          if (isMountedRef.current) {
            setDataLoading(false);
            setDataLoaded(true);
          }
        }
      }
    };
    if (allPaprikaExchangesData) {
      getData();
    }
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, exchangeId, currency, dataVsCurrency, allPaprikaExchangesData]);

  useEffect(() => {
    const getTickers = async page => {
      if (isMountedRef.current) {
        setMarketLoading(true);
      }
      let pageEnd = false;
      let size = 0;
      for (let i = 0; i <= page; i++) {
        try {
          await sleep(i === 0 ? 0 : 125);
          const marketData = await getExchangeTickers(exchangeId, { page: i + 1, order: 'trust_score_desc', depth: true });
          if (marketData && marketData.tickers) {
            for (let j = 0; j < marketData.tickers.length; j++) {
              tickers[size] = marketData.tickers[j];
              size++;
            }
            if (true || i === 0 || i === page) {
              if (i === page) {
                tickers.length = size;
              }
              if (isMountedRef.current) {
                if (size !== 0) {
                  setTickers(tickers);
                }
                setMarketLoading(false);
              }
            }
            if (marketData.tickers.length < pageSize) {
              pageEnd = true;
              break;
            }
          }
        } catch (err) {}
      }
      /*const coinIds = _.uniq(tickers.filter(t => !t.coin && t.coin_id).map(t => t.coin_id));
      if (coinIds.length > 0) {
        const coinPerPage = 50;
        for (let coinPage = 0; coinPage < Math.ceil(coinIds.length / coinPerPage); coinPage++) {
          const ids = coinIds.filter((id, i) => i >= (coinPage * coinPerPage) && i < ((coinPage + 1) * coinPerPage)).join(',');
          try {
            await sleep(500);
            const coinsData = await getCoinsMarkets({ vs_currency: 'usd', ids, per_page: coinPerPage, page: 1 });
            coinsData.forEach(d => {
              tickers.forEach((t, i) => {
                if (t.coin_id === d.id) {
                  tickers[i].coin = d;
                }
              })
            });
          } catch (err) {}
        }
      }
      if (isMountedRef.current) {
        setTickers(tickers);
      }*/
      if (pageEnd) {
        if (isMountedRef.current) {
          setMarketPageEnd(pageEnd);
        }
      }
    };
    if (data && exchangeId) {
      if (['open_interest_btc', 'number_of_perpetual_pairs', 'number_of_futures_pairs'].findIndex(f => f in data) > -1) {
        if (isMountedRef.current) {
          setTickers(data.tickers);
        }
      }
      else {
        getTickers(marketPage);
      }
    }
  }, [isMountedRef, exchangeId, data, tickers, marketPage]);

  useEffect(() => {
    const runVolume = async () => {
      const ranges = _.orderBy(timeRanges.map(r => { r.sort_flag = r.day === chartTimeSelected; return r; }), ['sort_flag', 'day'], ['desc', 'asc']);
      for (let i = 0; i < ranges.length; i++) {
        if (i < 1 && Object.keys(volumeChartDataMap).length < 1) {
          if (isMountedRef.current) {
            setVolumeChartLoading(true);
          }
        }
        try {
          await sleep(500);
          let theVolumeData = await getExchangeVolumeChart(exchangeId, { days: ranges[i].day });
          theVolumeData = theVolumeData && !theVolumeData.error && Array.isArray(theVolumeData) && theVolumeData.length > 0 ? theVolumeData : null;
          if (theVolumeData) {
            volumeChartDataMap[ranges[i].day] = theVolumeData;
          }
        } catch (err) {}
        if (i === 0 || i === ranges.length - 1) {
          if (isMountedRef.current) {
            if (volumeChartDataMap) {
              setVolumeChartDataMap(volumeChartDataMap);
            }
            setVolumeChartLoading(false);
          }
        }
        else {
          if (isMountedRef.current) {
            if (volumeChartDataMap) {
              setVolumeChartDataMap(volumeChartDataMap);
            }
          }
        }
      }
    };
    if (data && exchangeId) {
      runVolume();
    }
  }, [isMountedRef, exchangeId, data, volumeChartDataMap, chartTimeSelected]);

  const currencyData = _.head(_.uniq(currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === currency), 'id'));
  const currencyMarket = tickers && tickers.findIndex(ticker => ticker.converted_last && (typeof ticker.converted_last[currency] === 'number' || typeof ticker.converted_last[currency] === 'string')) > -1 ? currency : 'usd';
  const currencyMarketData = _.head(_.uniq(currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === currencyMarket), 'id'));
  const currencyVolume = 'btc';
  const currencyVolumeData = _.head(_.uniq(currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === currencyVolume), 'id'));
  const isDerivative = data && ['open_interest_btc', 'number_of_perpetual_pairs', 'number_of_futures_pairs'].findIndex(f => f in data) > -1;
  const sortedTickers = _.orderBy(tickers.map((ticker, i) => {
    ticker.rank = i;
    const coinIndex = allCryptoData && allCryptoData.coins ? allCryptoData.coins.findIndex(c => isDerivative ? ticker.base && ((c.symbol && c.symbol.toLowerCase() === ticker.base.toLowerCase()) || (c.id && c.id.toLowerCase() === ticker.base.toLowerCase()) || (c.name && c.name.toLowerCase() === ticker.base.toLowerCase())) : c.id === ticker.coin_id) : -1;
    if (coinIndex > -1) {
      ticker.coin = { ...allCryptoData.coins[coinIndex], image: allCryptoData.coins[coinIndex].large };
      if (!ticker.coin_id) {
        ticker.coin_id = ticker.coin.id;
      }
    }
    ticker.coin_name = ticker.coin && ticker.coin.name ? ticker.coin.name : ticker.base && ticker.base.startsWith('0X') && ticker.coin_id ? allCryptoData && allCryptoData.coins && allCryptoData.coins.findIndex(c => c.id === ticker.coin_id) > -1 ? allCryptoData.coins[allCryptoData.coins.findIndex(c => c.id === ticker.coin_id)].name : getName(ticker.coin_id, true) : ticker.base;
    ticker.pair = `${ticker.base && ticker.base.startsWith('0X') && ticker.coin_id ? allCryptoData && allCryptoData.coins && allCryptoData.coins.findIndex(c => c.id === ticker.coin_id) > -1 ? allCryptoData.coins[allCryptoData.coins.findIndex(c => c.id === ticker.coin_id)].name : getName(ticker.coin_id, true) : ticker.base}/${ticker.target && ticker.target.startsWith('0X') && ticker.target_coin_id ? allCryptoData && allCryptoData.coins && allCryptoData.coins.findIndex(c => c.id === ticker.target_coin_id) > -1 ? allCryptoData.coins[allCryptoData.coins.findIndex(c => c.id === ticker.target_coin_id)].name : getName(ticker.target_coin_id, true) : ticker.target}`;
    ticker.converted_last[currencyMarket] = !isNaN(ticker.converted_last[currencyMarket]) && typeof ticker.converted_last[currencyMarket] === 'string' ? Number(ticker.converted_last[currencyMarket]) : ticker.converted_last[currencyMarket];
    ticker.converted_volume[currencyMarket] = !isNaN(ticker.converted_volume[currencyMarket]) && typeof ticker.converted_volume[currencyMarket] === 'string' ? Number(ticker.converted_volume[currencyMarket]) : ticker.converted_volume[currencyMarket];
    ticker.bid_ask_spread_percentage = typeof ticker.bid_ask_spread_percentage === 'number' ? ticker.bid_ask_spread_percentage : -1;
    ticker.bid_ask_spread = typeof ticker.bid_ask_spread === 'number' ? ticker.bid_ask_spread : -1;
    ticker.up_depth = typeof ticker.cost_to_move_up_usd === 'number' ? ticker.cost_to_move_up_usd : 0;
    ticker.down_depth = typeof ticker.cost_to_move_down_usd === 'number' ? ticker.cost_to_move_down_usd : 0;
    ticker.volume_percentage = data.trade_volume_24h_btc > 0 && ticker.converted_volume && (typeof ticker.converted_volume[currencyVolume] === 'number' || typeof ticker.converted_volume[currencyVolume] === 'string') ? Number(ticker.converted_volume[currencyVolume]) / data.trade_volume_24h_btc : null;
    ticker.trust_score = typeof ticker.trust_score === 'number' ? ticker.trust_score : ticker.trust_score === 'green' ? 1 : ticker.trust_score === 'yellow' ? 0.5 : 0;
    return ticker;
  }).filter((ticker, i) => (i < (marketPage + 1) * pageSize) && (!marketSearch || ticker.pair.toLowerCase().indexOf(marketSearch.toLowerCase()) > -1 || ticker.coin_name.toLowerCase().indexOf(marketSearch.toLowerCase()) > -1 || ((marketSearch.toLowerCase().indexOf('perpetual') > -1 || marketSearch.toLowerCase().indexOf('future') > -1) && ticker.contract_type.toLowerCase().indexOf(marketSearch.toLowerCase()) > -1))), [marketSort.field || 'rank'], [marketSort.direction]);
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
                        <Col lg="4" md="6" xs="12" className="mt-3 mt-sm-0 order-2 order-sm-1 order-lg-1">
                          <div className="d-flex align-items-center">
                            <h1 className="f-22 d-flex align-items-center mb-0 mr-1">
                              {data.image && (<div className="avatar mr-2"><Media body className="img-40" src={data.image.replace('small', 'large')} alt={!data.image.startsWith('missing_') ? data.name : ''} /></div>)}
                              {data.name}
                              <Badge color="light" pill className="f-12 f-w-300 ml-2">{getName(data.centralized ? 'centralized' : 'decentralized', true)}</Badge>
                            </h1>
                            {tickers && tickers.length > 0 && (<Button size="xs" color="info" onClick={() => tableRef.current.scrollIntoView({ behavior: 'smooth' })} className="d-flex align-items-center ml-auto px-2"><Briefcase className="mr-2" style={{ width: '1rem', marginTop: '-.125rem' }} />{"Markets"}</Button>)}
                          </div>
                          <div className="mt-2">
                            {typeof data.trust_score_rank === 'number' && (<Badge color="light" pill className="f-12 f-w-300 mb-1 mr-1">{"Rank #"}{numeral(data.trust_score_rank).format('0,0')}</Badge>)}
                            {typeof data.trust_score === 'number' && (<Badge color="light" pill className="f-12 f-w-300 text-info mb-1 ml-0 mr-1">{"Trust score: "}{numberOptimizeDecimal(numeral(data.trust_score).format('0,0.00'))}</Badge>)}
                          </div>
                        </Col>
                        <Col lg="6" md="6" xs="12" className="mt-3 mt-md-4 mt-lg-0 order-4 order-sm-4 order-lg-2">
                          <div className="d-flex align-items-center justify-content-center">
                            {isDerivative ?
                              <Row className="w-100">
                                <Col lg="4" md="6" xs="12">
                                  <h2 style={{ display: 'contents', fontWeight: 'unset' }}><span className="f-12 text-secondary f-w-300">{"Volume"}<Badge color="light" pill className="f-12 text-secondary f-w-300 ml-2">24h</Badge></span></h2>
                                  <div className="h2 f-18 mt-1">
                                    {currencyVolume !== currency && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' ?
                                      <>
                                        {typeof data.trade_volume_24h_btc === 'number' || typeof data.trade_volume_24h_btc === 'string' ?
                                          <>
                                            {currencyData && currencyData.symbol}
                                            {numberOptimizeDecimal(numeral(Number(data.trade_volume_24h_btc) * exchangeRatesData[currency].value).format(data.trade_volume_24h_btc * exchangeRatesData[currency].value >= 1000 ? '0,0' : '0,0.00'))}
                                            {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                          </>
                                          :
                                          'N/A'
                                        }
                                      </>
                                      :
                                      <>
                                        {typeof data.trade_volume_24h_btc === 'number' || typeof data.trade_volume_24h_btc === 'string' ?
                                          <>
                                            {currencyVolumeData && currencyVolumeData.symbol}
                                            {numberOptimizeDecimal(numeral(data.trade_volume_24h_btc).format(data.trade_volume_24h_btc >= 1000 ? '0,0' : '0,0.00'))}
                                            {!(currencyVolumeData && currencyVolumeData.symbol) && (<> {currencyVolume.toUpperCase()}</>)}
                                          </>
                                          :
                                          'N/A'
                                        }
                                      </>
                                    }
                                  </div>
                                </Col>
                                <Col lg="4" md="6" xs="12" className="mt-3 mt-md-0">
                                  <h2 style={{ display: 'contents', fontWeight: 'unset' }}><span className="f-12 text-secondary f-w-300">{"Open Interest"}<Badge color="light" pill className="f-12 text-secondary f-w-300 ml-2">24h</Badge></span></h2>
                                  <div className="h2 f-18 mt-1">
                                    {currencyVolume !== currency && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' ?
                                      <>
                                        {typeof data.open_interest_btc === 'number' ?
                                          <>
                                            {currencyData && currencyData.symbol}
                                            {numberOptimizeDecimal(numeral(data.open_interest_btc * exchangeRatesData[currency].value).format(data.open_interest_btc * exchangeRatesData[currency].value >= 1000 ? '0,0' : '0,0.00'))}
                                            {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                          </>
                                          :
                                          'N/A'
                                        }
                                      </>
                                      :
                                      <>
                                        {typeof data.open_interest_btc === 'number' ?
                                          <>
                                            {currencyVolumeData && currencyVolumeData.symbol}
                                            {numberOptimizeDecimal(numeral(data.open_interest_btc).format(data.open_interest_btc >= 1000 ? '0,0' : '0,0.00'))}
                                            {!(currencyVolumeData && currencyVolumeData.symbol) && (<> {currencyVolume.toUpperCase()}</>)}
                                          </>
                                          :
                                          'N/A'
                                        }
                                      </>
                                    }
                                  </div>
                                </Col>
                                <Col lg="2" md="6" xs="12" className="mt-3 mt-lg-0">
                                  <h2 style={{ display: 'contents', fontWeight: 'unset' }}><span className="f-12 text-secondary f-w-300">{"Perpetual"}</span></h2>
                                  <div className="h2 f-18 mt-1">
                                    {typeof data.number_of_perpetual_pairs === 'number' ? numberOptimizeDecimal(numeral(data.number_of_perpetual_pairs).format('0,0')) : 'N/A'}
                                  </div>
                                </Col>
                                <Col lg="2" md="6" xs="12" className="mt-3 mt-lg-0">
                                  <h2 style={{ display: 'contents', fontWeight: 'unset' }}><span className="f-12 text-secondary f-w-300">{"Futures"}</span></h2>
                                  <div className="h2 f-18 mt-1">
                                    {typeof data.number_of_futures_pairs === 'number' ? numberOptimizeDecimal(numeral(data.number_of_futures_pairs).format('0,0')) : 'N/A'}
                                  </div>
                                </Col>
                              </Row>
                              :
                              <>
                                <div className="ml-0 mr-auto">
                                  <h2 style={{ display: 'contents', fontWeight: 'unset' }}><span className="f-12 text-secondary f-w-300">{"Volume"}<Badge color="light" pill className="f-12 text-secondary f-w-300 ml-2">24h</Badge></span></h2>
                                  <div className="h2 f-18 mt-1">
                                    {currencyVolume !== currency && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' ?
                                      <>
                                        {typeof data.trade_volume_24h_btc === 'number' || typeof data.trade_volume_24h_btc === 'string' ?
                                          <>
                                            {currencyData && currencyData.symbol}
                                            {numberOptimizeDecimal(numeral(Number(data.trade_volume_24h_btc) * exchangeRatesData[currency].value).format(data.trade_volume_24h_btc * exchangeRatesData[currency].value >= 1000 ? '0,0' : '0,0.00'))}
                                            {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                          </>
                                          :
                                          'N/A'
                                        }
                                      </>
                                      :
                                      <>
                                        {typeof data.trade_volume_24h_btc === 'number' || typeof data.trade_volume_24h_btc === 'string' ?
                                          <>
                                            {currencyVolumeData && currencyVolumeData.symbol}
                                            {numberOptimizeDecimal(numeral(data.trade_volume_24h_btc).format(data.trade_volume_24h_btc >= 1000 ? '0,0' : '0,0.00'))}
                                            {!(currencyVolumeData && currencyVolumeData.symbol) && (<>&nbsp;{currencyVolume.toUpperCase()}</>)}
                                          </>
                                          :
                                          'N/A'
                                        }
                                      </>
                                    }
                                  </div>
                                </div>
                                <div className="mx-auto">
                                  <h2 style={{ display: 'contents', fontWeight: 'unset' }}><span className="f-12 text-secondary f-w-300">{"Coins"}</span></h2>
                                  <div className="h2 f-18 mt-1">
                                    {!marketPageEnd && data.paprika && typeof data.paprika.currencies === 'number' ? numberOptimizeDecimal(numeral(data.paprika.currencies).format('0,0')) : tickers && tickers.length > 0 ? numberOptimizeDecimal(numeral(_.uniq(tickers.map(t => t.base)).length).format('0,0')) : marketLoading ? <div className="loader-box h-auto d-inline-flex"><div className="loader-34" style={{ width: '1rem', height: '.5rem', marginTop: '-.125px' }} /></div> : 'N/A'}
                                  </div>
                                </div>
                                <div className="ml-auto mr-0">
                                  <h2 style={{ display: 'contents', fontWeight: 'unset' }}><span className="f-12 text-secondary f-w-300">{"Pairs"}</span></h2>
                                  <div className="h2 f-18 mt-1">
                                    {!marketPageEnd && data.paprika && typeof data.paprika.markets === 'number' ? numberOptimizeDecimal(numeral(data.paprika.markets).format('0,0')) : tickers && tickers.length > 0 ? numberOptimizeDecimal(numeral(tickers.length).format('0,0')) : marketLoading ? <div className="loader-box h-auto d-inline-flex"><div className="loader-34" style={{ width: '1rem', height: '.5rem', marginTop: '-.125px' }} /></div> : 'N/A'}
                                  </div>
                                </div>
                              </>
                            }
                          </div>
                        </Col>
                        <Col lg="2" md="6" xs="12" className="mt-0 mt-sm-4 mt-md-2 order-1 order-sm-2 order-lg-3">
                          <div className="text-right">
                            {data.url && (
                              <>
                                <a href={data.url} target="_blank" rel="noopener noreferrer"><Button color="primary"><h2 className="my-1" style={{ fontSize: 'unset', fontWeight: 'unset', color: 'unset' }}>{"Start Trading"}</h2></Button></a>
                                <div onClick={() => SweetAlert.fire(affiliateData)} className="f-12 text-info mt-1" style={{ cursor: 'pointer' }}>{"Affiliate disclosures"}</div>
                              </>
                            )}
                          </div>
                        </Col>
                        <Col lg="4" md="6" xs="12" onMouseLeave={() => onAllSelected(false)} className={`mt-4${width <= 991 ? '' : ' pb-2'} order-3 order-sm-3 order-lg-4`}>
                          <div id="urls_zone" onClick={e => { if (e.target.id === 'urls_zone') { onAllSelected(false); } }} className="d-flex">
                            {data.country && (
                              <div><Badge color="light" pill onMouseEnter={() => onAllSelected(false)} className="f-12 f-w-300 mb-1 ml-0 mr-1"><Home className="mr-1" />{data.country}</Badge></div>
                            )}
                            {data.year_established && (
                              <div><Badge color="light" pill onMouseEnter={() => onAllSelected(false)} className="f-12 f-w-300 mb-1 ml-0 mr-1"><Power className="mr-1" />{data.year_established}</Badge></div>
                            )}
                            {['facebook_url', 'twitter_handle', 'telegram_url', 'reddit_url', 'slack_url', 'other_url_1', 'other_url_2'].findIndex(f => data[f]) > -1 && (
                              <div className="dropdown-basic d-inline-flex">
                                <Dropdown onMouseEnter={() => { if (width > 1200) { onCommunitySelected(true); } }}>
                                  <Badge color="light" pill onClick={() => onCommunitySelected(!communitySelected)} className="f-12 f-w-300 mb-1 ml-0 mr-1" style={{ cursor: 'pointer' }}><Globe className="mr-1" />{"Community"}<ChevronDown className="ml-1" /></Badge>
                                  <DropdownMenu onMouseLeave={() => onCommunitySelected(false)} className={`dropdown-content d-${communitySelected ? 'block' : 'none'}`}>
                                    {['facebook_url', 'twitter_handle', 'telegram_url', 'reddit_url', 'slack_url', 'other_url_1', 'other_url_2'].filter(f => data[f]).map(f => f === 'facebook_url' && !data[f].startsWith('http') ? `https://www.facebook.com/${data[f]}` : f === 'twitter_handle' && !data[f].startsWith('http') ? `https://twitter.com/${data[f]}` : f === 'telegram_url' && !data[f].startsWith('http') ? `https://t.me/${data[f]}` : f === 'reddit_url' && !data[f].startsWith('http') ? `https://www.reddit.com${data[f]}` : data[f]).map((link, i) => (
                                      <DropdownItem key={i} href={link} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center">{new URL(link).hostname}<ExternalLink className="ml-1" style={{ width: '1rem' }} /></DropdownItem>
                                    ))}
                                  </DropdownMenu>
                                </Dropdown>
                              </div>
                            )}
                          </div>
                          <div onMouseEnter={() => onAllSelected(false)} className="mt-3">
                            {
                              data.description ?
                                <div className="text-secondary mb-3">{parse(data.description)}</div>
                                :
                                data.paprika && data.paprika.description ?
                                  <div className="text-secondary mb-3">{parse(data.paprika.description)}</div>
                                  :
                                  null
                            }
                            {width > 991 && (<Ads square={true} />)}
                          </div>
                        </Col>
                        <Col lg="8" md="12" xs="12" className="mt-4 order-5 order-sm-5 order-lg-5">
                          <div className="d-flex align-items-center">
                            <Nav className="nav-pills nav-primary ml-auto">
                              {timeRanges.map(r => (
                                <NavItem key={r.day} style={{ maxWidth: width <= 575 ? 'fit-content' : '' }}>
                                  <NavLink onClick={() => setChartTimeSelected(r.day)} className={`${chartTimeSelected === r.day ? 'active' : ''} f-12 text-center p-2`} style={{ width: '3rem' }}>
                                    {r.short}
                                  </NavLink>
                                </NavItem>
                              ))}
                            </Nav>
                          </div>
                          {volumeChartDataMap && (
                            <div>
                              {volumeChartLoading ?
                                <div className="loader-box" style={{ height: '25rem' }}>
                                  <div className="loader-10" />
                                </div>
                                :
                                volumeChartDataMap[chartTimeSelected] ?
                                  <Chart
                                    height="400"
                                    type="line"
                                    options={{
                                      chart: { width: 800, height: 400, type: 'line', toolbar: { show: false } },
                                      colors: [ConfigDB.data.color.primary_color, ConfigDB.data.color.secondary_color],
                                      stroke: { curve: 'smooth', width: 1.5 },
                                      markers: { size: 0 },
                                      title: {
                                        text: currencyVolume !== currency && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' ?
                                          `${data.name} Volume${currencyData ? currencyData.symbol ? ` (${currencyData.symbol})` : currencyData.id ? ` (${currencyData.id.toUpperCase()})` : '' : ''}`
                                          :
                                          `${data.name} Volume${currencyVolumeData ? currencyVolumeData.symbol ? ` (${currencyVolumeData.symbol})` : currencyVolumeData.id ? ` (${currencyVolumeData.id.toUpperCase()})` : '' : ''}`,
                                        align: 'left'
                                      },
                                      xaxis: { type: 'datetime', labels: { datetimeUTC: false } },
                                      yaxis: [
                                        {
                                          labels: { formatter: v => numberOptimizeDecimal(numeral(v.toFixed(_.min(volumeChartDataMap[chartTimeSelected].flatMap(d => d.slice(1))) > 1 ? 2 : 8)).format(`0,0.${[...Array(_.min(volumeChartDataMap[chartTimeSelected].flatMap(d => d.slice(1))) > 1 ? 2 : 8).keys()].map(i => '0')}`)) }
                                        }
                                      ],
                                      tooltip: { shared: true, x: { format: 'ddd, d MMM yyyy hh:mm TT' }, y: { formatter: v => numberOptimizeDecimal(numeral(v.toFixed(v >= 1000 ? 0 : v > 1 ? 2 : 8)).format(`0,0.${[...Array(v >= 1000 ? 0 : v > 1 ? 2 : 8).keys()].map(i => '0')}`)) } }
                                    }}
                                    series={[{ name: 'Volume', data: volumeChartDataMap[chartTimeSelected].map(v => { return { x: new Date(v[0]), y: v.slice(1).map(d => d * (currencyVolume !== currency && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' ? exchangeRatesData[currency].value : 1)) }; }) }]}
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
                        </Col>
                        {data.status_updates && data.status_updates.length > 0 && (
                          <Col lg="12" md="12" xs="12" className="mt-4 px-0 px-lg-4 order-6 order-sm-6 order-lg-6">
                            <h1 className="f-20 d-flex align-items-center pt-3 px-2">{data.image && (<div className="avatar mr-2"><Media body className="img-30" src={data.image.replace('small', 'large')} alt={!data.image.startsWith('missing_') ? data.name : ''} /></div>)}{"Project Updates"}</h1>
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
                        {width <= 991 && (<Col lg="12" md="12" xs="12" className="mt-5 px-0 px-lg-4 order-7"><div className="mx-auto" style={{ maxWidth: '25rem' }}><Ads square={true} /></div></Col>)}
                      </Row>
                    </CardHeader>
                    <CardBody className="pt-3 pb-2 px-0 px-lg-2">
                      {tickers && (
                        <>
                          {(tickers.length > 0 || marketLoading) && (
                            <>
                              <div ref={tableRef} className="p-absolute" style={{ marginTop: width <= 345 ? '-138px' : width <= 575 ? '-116px' : width <= 907 ? '-121px' : width <= 991 ? '-99px' : width <= 1200 ? '-119px' : '-81px' }} />
                              <div className="d-flex align-items-center pt-3 px-2">
                                <h1 className="f-20 d-flex align-items-center my-auto">{data.image && (<div className="avatar mr-2"><Media body className="img-30" src={data.image.replace('small', 'large')} alt={!data.image.startsWith('missing_') ? data.name : ''} /></div>)}{"Markets"}</h1>
                                <span className="d-flex align-items-center ml-auto"><Search /><Input type="text" value={marketSearch} onChange={e => setMarketSearch(e.target.value)} placeholder="Search" className="b-r-6 f-14 ml-2" style={{ maxWidth: 'max-content' }} /></span>
                              </div>
                            </>
                          )}
                          {tickers.length > 0 ?
                            <div className={`markets-table${isDerivative ? /*' markets-derivatives-table'*/'' : ''} responsive-tbl mt-3`}>
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
                                        onClick={() => setMarketSort({ field: 'coin_name', direction: marketSort.field === 'coin_name' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                        className={`${marketSort.field === 'coin_name' ? 'bg-light' : ''}`}
                                        style={{ maxWidth: '10rem', cursor: 'pointer' }}
                                      >
                                        {"Coin"}
                                        {marketSort.field === 'coin_name' && (
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
                                        style={{ minWidth: '7.5rem', cursor: 'pointer' }}
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
                                      {isDerivative && (
                                        <th
                                          onClick={() => setMarketSort({ field: 'h24_percentage_change', direction: marketSort.field === 'h24_percentage_change' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                          className={`text-right ${marketSort.field === 'h24_percentage_change' ? 'bg-light' : ''}`}
                                          style={{ cursor: 'pointer' }}
                                        >
                                          {"Change %"}
                                          {marketSort.field === 'h24_percentage_change' && (
                                            <>
                                              {marketSort.direction === 'desc' ?
                                                <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                                :
                                                <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                              }
                                            </>
                                          )}
                                        </th>
                                      )}
                                      {isDerivative && (
                                        <th
                                          onClick={() => setMarketSort({ field: 'index', direction: marketSort.field === 'index' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                          className={`text-right ${marketSort.field === 'index' ? 'bg-light' : ''}`}
                                          style={{ cursor: 'pointer' }}
                                        >
                                          {"Index Price"}
                                          {marketSort.field === 'index' && (
                                            <>
                                              {marketSort.direction === 'desc' ?
                                                <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                                :
                                                <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                              }
                                            </>
                                          )}
                                        </th>
                                      )}
                                      {isDerivative && (
                                        <th
                                          onClick={() => setMarketSort({ field: 'index_basis_percentage', direction: marketSort.field === 'index_basis_percentage' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                          className={`text-right ${marketSort.field === 'index_basis_percentage' ? 'bg-light' : ''}`}
                                          style={{ cursor: 'pointer' }}
                                        >
                                          {"Basis"}
                                          {marketSort.field === 'index_basis_percentage' && (
                                            <>
                                              {marketSort.direction === 'desc' ?
                                                <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                                :
                                                <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                              }
                                            </>
                                          )}
                                        </th>
                                      )}
                                      <th
                                        onClick={() => setMarketSort({ field: isDerivative ? 'bid_ask_spread' : 'bid_ask_spread_percentage', direction: marketSort.field === (isDerivative ? 'bid_ask_spread' : 'bid_ask_spread_percentage') && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                        className={`text-right ${marketSort.field === (isDerivative ? 'bid_ask_spread' : 'bid_ask_spread_percentage') ? 'bg-light' : ''}`}
                                        style={{ minWidth: '7rem', cursor: 'pointer' }}
                                      >
                                        {"Spread %"}
                                        {marketSort.field === (isDerivative ? 'bid_ask_spread' : 'bid_ask_spread_percentage') && (
                                          <>
                                            {marketSort.direction === 'desc' ?
                                              <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                              :
                                              <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                            }
                                          </>
                                        )}
                                      </th>
                                      {isDerivative ?
                                        <th
                                          onClick={() => setMarketSort({ field: 'funding_rate', direction: marketSort.field === 'funding_rate' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                          className={`text-right ${marketSort.field === 'funding_rate' ? 'bg-light' : ''}`}
                                          style={{ minWidth: '7rem', cursor: 'pointer' }}
                                        >
                                          {"Funding Rate"}
                                          {marketSort.field === 'funding_rate' && (
                                            <>
                                              {marketSort.direction === 'desc' ?
                                                <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                                :
                                                <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                              }
                                            </>
                                          )}
                                        </th>
                                        :
                                        <th
                                          onClick={() => setMarketSort({ field: 'up_depth', direction: marketSort.field === 'up_depth' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                          className={`text-right ${marketSort.field === 'up_depth' ? 'bg-light' : ''}`}
                                          style={{ minWidth: '7rem', cursor: 'pointer' }}
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
                                      }
                                      {isDerivative ?
                                        <th
                                          onClick={() => setMarketSort({ field: 'open_interest_usd', direction: marketSort.field === 'open_interest_usd' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                          className={`text-right ${marketSort.field === 'open_interest_usd' ? 'bg-light' : ''}`}
                                          style={{ minWidth: '7rem', cursor: 'pointer' }}
                                        >
                                          {"Open Interest"}
                                          {marketSort.field === 'open_interest_usd' && (
                                            <>
                                              {marketSort.direction === 'desc' ?
                                                <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                                :
                                                <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                              }
                                            </>
                                          )}
                                        </th>
                                        :
                                        <th
                                          onClick={() => setMarketSort({ field: 'down_depth', direction: marketSort.field === 'down_depth' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                          className={`text-right ${marketSort.field === 'down_depth' ? 'bg-light' : ''}`}
                                          style={{ minWidth: '7rem', cursor: 'pointer' }}
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
                                      }
                                      <th
                                        onClick={() => setMarketSort({ field: `converted_volume.${currencyMarket}`, direction: marketSort.field === `converted_volume.${currencyMarket}` && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                        className={`d-flex align-items-center justify-content-end ${marketSort.field === `converted_volume.${currencyMarket}` ? 'bg-light' : ''}`}
                                        style={{ minWidth: '7.5rem', cursor: 'pointer' }}
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
                                      {!isDerivative && (
                                        <th
                                          onClick={() => setMarketSort({ field: 'volume_percentage', direction: marketSort.field === 'volume_percentage' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                          className={`text-right ${marketSort.field === 'volume_percentage' ? 'bg-light' : ''}`}
                                          style={{ minWidth: '7rem', cursor: 'pointer' }}
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
                                      )}
                                      {!isDerivative && (
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
                                      )}
                                      {/*<th
                                        onClick={() => setMarketSort({ field: isDerivative ? 'last_traded' : 'last_traded_at', direction: (marketSort.field === 'last_traded' || marketSort.field === 'last_traded_at') && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                        className={`text-right ${marketSort.field === 'last_traded' || marketSort.field === 'last_traded_at' ? 'bg-light' : ''}`}
                                        style={{ cursor: 'pointer' }}
                                      >
                                        {"Updated"}
                                        {(marketSort.field === 'last_traded' || marketSort.field === 'last_traded_at') && (
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
                                    {sortedTickers.filter((ticker, i) => i >= tablePage * pageSize && i < (tablePage + 1) * pageSize).map((ticker, i) => (
                                      <tr key={i}>
                                        <td>{ticker.rank + 1}</td>
                                        <td className={`f-w-500 ${marketSort.field === 'coin_name' ? 'bg-light' : ''}`}>
                                          <Link to={`/coin${ticker.coin_id ? `/${ticker.coin_id}` : 's'}`}>
                                            <div className="d-flex">
                                              {ticker.coin && ticker.coin.image && (
                                                <span className="avatar mr-2">
                                                  <Media body className="img-20" src={ticker.coin.image} alt={!ticker.coin.image.startsWith('missing_') ? ticker.base : ''} />
                                                </span>
                                              )}
                                              <span>{ticker.coin_name}</span>
                                            </div>
                                          </Link>
                                        </td>
                                        <td className={`f-w-500 ${marketSort.field === 'pair' ? 'bg-light' : ''}`} style={{ wordBreak: 'break-all' }}>
                                          {ticker.trade_url || data.url ? <a href={ticker.trade_url || data.url} target="_blank" rel="noopener noreferrer">{ticker.pair}</a> : ticker.pair}
                                          {ticker.token_info_url && (<a href={ticker.token_info_url} target="_blank" rel="noopener noreferrer" className="ml-1"><Info className="w-auto font-info" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '4px' }} /></a>)}
                                          {ticker.base && ticker.base.startsWith('0X') && (<div className="f-10 text-info">{ticker.base}</div>)}
                                          {ticker.target && ticker.target.startsWith('0X') && (<div className="f-10 text-info">{"/"}{ticker.target}</div>)}
                                          {ticker.contract_type && (<div className="f-10 text-info">{ticker.contract_type}</div>)}
                                        </td>
                                        <td className={`text-right ${marketSort.field === `converted_last.${currencyMarket}` ? 'bg-light' : ''}`}>
                                          {ticker.converted_last && (typeof ticker.converted_last[currencyMarket] === 'number' || typeof ticker.converted_last[currencyMarket] === 'string') ?
                                            <>
                                              {currencyMarketData && currencyMarketData.symbol}
                                              {numberOptimizeDecimal(numeral(Number(ticker.converted_last[currencyMarket])).format(Number(ticker.converted_last[currencyMarket]) > 1 ? '0,0.00' : '0,0.0000000000') !== 'NaN' ? numeral(Number(ticker.converted_last[currencyMarket])).format(Number(ticker.converted_last[currencyMarket]) > 1 ? '0,0.00' : '0,0.0000000000') : Number(ticker.converted_last[currencyMarket]).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}
                                              {!(currencyMarketData && currencyMarketData.symbol) && (<>&nbsp;{currencyMarket.toUpperCase()}</>)}
                                              {currency && currencyMarket && currency.toLowerCase() !== currencyMarket.toLowerCase() && exchangeRatesData[currencyMarket] && typeof exchangeRatesData[currencyMarket].value === 'number' && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' && (<div className="f-10 text-info">{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(Number(ticker.converted_last[currencyMarket]) * exchangeRatesData[currency].value / exchangeRatesData[currencyMarket].value).format(Number(ticker.converted_last[currencyMarket]) * exchangeRatesData[currency].value / exchangeRatesData[currencyMarket].value > 1 ? '0,0.00' : '0,0.0000000000') !== 'NaN' ? numeral(Number(ticker.converted_last[currencyMarket]) * exchangeRatesData[currency].value / exchangeRatesData[currencyMarket].value).format(Number(ticker.converted_last[currencyMarket]) * exchangeRatesData[currency].value / exchangeRatesData[currencyMarket].value > 1 ? '0,0.00' : '0,0.0000000000') : (Number(ticker.converted_last[currencyMarket]) * exchangeRatesData[currency].value / exchangeRatesData[currencyMarket].value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</div>)}
                                            </>
                                            :
                                            'N/A'
                                          }
                                          {ticker.target && currencyMarket && ticker.target.toLowerCase() !== currencyMarket.toLowerCase() && typeof ticker.last === 'number' && (<div className="f-10 text-info" style={{ wordBreak: 'break-all' }}>{numberOptimizeDecimal(numeral(ticker.last).format(ticker.last > 1 ? '0,0.00' : '0,0.0000000000') !== 'NaN' ? numeral(ticker.last).format(ticker.last > 1 ? '0,0.00' : '0,0.0000000000') : ticker.last.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}{ticker.target && (<>&nbsp;{ticker.target.startsWith('0X') && ticker.target_coin_id && allCryptoData && allCryptoData.coins && allCryptoData.coins.findIndex(c => c.id === ticker.target_coin_id) > -1 ? allCryptoData.coins[allCryptoData.coins.findIndex(c => c.id === ticker.target_coin_id)].name : ticker.target.toUpperCase()}</>)}</div>)}
                                        </td>
                                        {isDerivative && (
                                          <td className={`text-right ${marketSort.field === 'h24_percentage_change' ? 'bg-light' : ''} ${ticker.h24_percentage_change > 0 ? 'font-success' : ticker.h24_percentage_change < 0 ? 'font-danger' : ''}`}>{typeof ticker.h24_percentage_change === 'number' ? numberOptimizeDecimal(numeral(ticker.h24_percentage_change / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(ticker.h24_percentage_change / 100).format('+0,0.00%')) : '-'}</td>
                                        )}
                                        {isDerivative && (
                                          <td className={`text-right ${marketSort.field === 'index' ? 'bg-light' : ''}`}>{typeof ticker.index === 'number' ? numberOptimizeDecimal(numeral(ticker.index).format(ticker.index > 1 ? '0,0.00' : '0,0.0000000000') !== 'NaN' ? numeral(ticker.index).format(ticker.index > 1 ? '0,0.00' : '0,0.0000000000') : ticker.index.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 })) : 'N/A'} {ticker.target}</td>
                                        )}
                                        {isDerivative && (
                                          <td className={`text-right ${marketSort.field === 'index_basis_percentage' ? 'bg-light' : ''}`}>{typeof ticker.index_basis_percentage === 'number' ? numberOptimizeDecimal(numeral(ticker.index_basis_percentage / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(ticker.index_basis_percentage / 100).format('0,0.00%')) : '-'}</td>
                                        )}
                                        {isDerivative ?
                                          <td className={`text-right ${marketSort.field === 'bid_ask_spread' ? 'bg-light' : ''}`}>{typeof ticker.bid_ask_spread === 'number' && ticker.bid_ask_spread >= 0 ? numberOptimizeDecimal(numeral(ticker.bid_ask_spread).format('0,0.00%')) : '-'}</td>
                                          :
                                          <td className={`text-right ${marketSort.field === 'bid_ask_spread_percentage' ? 'bg-light' : ''}`}>{typeof ticker.bid_ask_spread_percentage === 'number' && ticker.bid_ask_spread_percentage >= 0 ? numberOptimizeDecimal(numeral(ticker.bid_ask_spread_percentage / 100).format('0,0.00%')) : '-'}</td>
                                        }
                                        {isDerivative ?
                                          <td className={`text-right ${marketSort.field === 'funding_rate' ? 'bg-light' : ''}`}>
                                            {numeral(ticker.funding_rate).format('0,0.00%')}
                                          </td>
                                          :
                                          <td className={`text-right ${marketSort.field === 'up_depth' ? 'bg-light' : ''}`}>
                                            {numeral(ticker.up_depth).format('$0,0')}
                                            {currency && currency.toLowerCase() !== 'usd' && exchangeRatesData['usd'] && typeof exchangeRatesData['usd'].value === 'number' && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' && (<div className="f-10 text-info">{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(Number(ticker.up_depth) * exchangeRatesData[currency].value / exchangeRatesData['usd'].value).format(Number(ticker.up_depth) * exchangeRatesData[currency].value / exchangeRatesData['usd'].value > 1 ? '0,0.00' : '0,0.0000000000') !== 'NaN' ? numeral(Number(ticker.up_depth) * exchangeRatesData[currency].value / exchangeRatesData['usd'].value).format(Number(ticker.up_depth) * exchangeRatesData[currency].value / exchangeRatesData['usd'].value > 1 ? '0,0.00' : '0,0.0000000000') : (Number(ticker.up_depth) * exchangeRatesData[currency].value / exchangeRatesData['usd'].value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</div>)}
                                          </td>
                                        }
                                        {isDerivative ?
                                          <td className={`text-right ${marketSort.field === 'open_interest_usd' ? 'bg-light' : ''}`}>
                                            {numeral(ticker.open_interest_usd).format('$0,0')}
                                            {currency && currency.toLowerCase() !== 'usd' && exchangeRatesData['usd'] && typeof exchangeRatesData['usd'].value === 'number' && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' && (<div className="f-10 text-info">{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(Number(ticker.open_interest_usd) * exchangeRatesData[currency].value / exchangeRatesData['usd'].value).format(Number(ticker.open_interest_usd) * exchangeRatesData[currency].value / exchangeRatesData['usd'].value > 1 ? '0,0.00' : '0,0.0000000000') !== 'NaN' ? numeral(Number(ticker.open_interest_usd) * exchangeRatesData[currency].value / exchangeRatesData['usd'].value).format(Number(ticker.open_interest_usd) * exchangeRatesData[currency].value / exchangeRatesData['usd'].value > 1 ? '0,0.00' : '0,0.0000000000') : (Number(ticker.open_interest_usd) * exchangeRatesData[currency].value / exchangeRatesData['usd'].value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</div>)}
                                          </td>
                                          :
                                          <td className={`text-right ${marketSort.field === 'down_depth' ? 'bg-light' : ''}`}>
                                            {numeral(ticker.down_depth).format('$0,0')}
                                            {currency && currency.toLowerCase() !== 'usd' && exchangeRatesData['usd'] && typeof exchangeRatesData['usd'].value === 'number' && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' && (<div className="f-10 text-info">{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(Number(ticker.down_depth) * exchangeRatesData[currency].value / exchangeRatesData['usd'].value).format(Number(ticker.down_depth) * exchangeRatesData[currency].value / exchangeRatesData['usd'].value > 1 ? '0,0.00' : '0,0.0000000000') !== 'NaN' ? numeral(Number(ticker.down_depth) * exchangeRatesData[currency].value / exchangeRatesData['usd'].value).format(Number(ticker.down_depth) * exchangeRatesData[currency].value / exchangeRatesData['usd'].value > 1 ? '0,0.00' : '0,0.0000000000') : (Number(ticker.down_depth) * exchangeRatesData[currency].value / exchangeRatesData['usd'].value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</div>)}
                                          </td>
                                        }
                                        <td className={`text-right ${marketSort.field === `converted_volume.${currencyMarket}` ? 'bg-light' : ''}`}>
                                          {ticker.converted_volume && (typeof ticker.converted_volume[currencyMarket] === 'number' || typeof ticker.converted_volume[currencyMarket] === 'string') ?
                                            <>
                                              {currencyMarketData && currencyMarketData.symbol}
                                              {numberOptimizeDecimal(numeral(Number(ticker.converted_volume[currencyMarket])).format('0,0') !== 'NaN' ? numeral(Number(ticker.converted_volume[currencyMarket])).format('0,0') : Number(ticker.converted_volume[currencyMarket]).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}
                                              {!(currencyMarketData && currencyMarketData.symbol) && (<>&nbsp;{currencyMarket.toUpperCase()}</>)}
                                              {currency && currencyMarket && currency.toLowerCase() !== currencyMarket.toLowerCase() && exchangeRatesData[currencyMarket] && typeof exchangeRatesData[currencyMarket].value === 'number' && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' && (<div className="f-10 text-info">{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(Number(ticker.converted_volume[currencyMarket]) * exchangeRatesData[currency].value / exchangeRatesData[currencyMarket].value).format(Number(ticker.converted_last[currencyMarket]) * exchangeRatesData[currency].value / exchangeRatesData[currencyMarket].value > 1 ? '0,0.00' : '0,0.0000000000') !== 'NaN' ? numeral(Number(ticker.converted_volume[currencyMarket]) * exchangeRatesData[currency].value / exchangeRatesData[currencyMarket].value).format(Number(ticker.converted_last[currencyMarket]) * exchangeRatesData[currency].value / exchangeRatesData[currencyMarket].value > 1 ? '0,0.00' : '0,0.0000000000') : (Number(ticker.converted_volume[currencyMarket]) * exchangeRatesData[currency].value / exchangeRatesData[currencyMarket].value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</div>)}
                                            </>
                                            :
                                            'N/A'
                                          }
                                          {ticker.target && currencyMarket && ticker.target.toLowerCase() !== currencyMarket.toLowerCase() && (typeof ticker.volume === 'number' || typeof ticker.h24_volume === 'number') && (<div className="f-10 text-info" style={{ wordBreak: 'break-all' }}>{numberOptimizeDecimal(numeral((ticker.volume || ticker.h24_volume) * ticker.last).format('0,0') !== 'NaN' ? numeral((ticker.volume || ticker.h24_volume) * ticker.last).format('0,0') : ((ticker.volume || ticker.h24_volume) * ticker.last).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}{ticker.target && (<>&nbsp;{ticker.target.startsWith('0X') && ticker.target_coin_id && allCryptoData && allCryptoData.coins && allCryptoData.coins.findIndex(c => c.id === ticker.target_coin_id) > -1 ? allCryptoData.coins[allCryptoData.coins.findIndex(c => c.id === ticker.target_coin_id)].name : ticker.target.toUpperCase()}</>)}</div>)}
                                        </td>
                                        {!isDerivative && (<td className={`text-right ${marketSort.field === 'volume_percentage' ? 'bg-light' : ''}`}>{typeof ticker.volume_percentage === 'number' ? numberOptimizeDecimal(numeral(ticker.volume_percentage).format('0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(ticker.volume_percentage).format('0,0.00%')) : '-'}</td>)}
                                        {!isDerivative && (<td className={`text-right ${marketSort.field === 'trust_score' ? 'bg-light' : ''} font-${ticker.trust_score === 1 ? 'success' : ticker.trust_score === 0.5 ? 'warning' : 'danger'}`}>{ticker.trust_score ? <CheckCircle /> : <XCircle />}</td>)}
                                        {/*<td className={`font-roboto f-w-300 text-secondary text-right ${marketSort.field === 'last_traded' || marketSort.field === 'last_traded_at' ? 'bg-light' : ''}`}>{moment(isDerivative ? ticker.last_traded * 1000 : ticker.last_traded_at).fromNow()}</td>*/}
                                      </tr>
                                    ))}
                                  </tbody>
                                </Table>
                                {Math.ceil(sortedTickers.length / pageSize) > 1 && (
                                  <Pagination className="pagination pagination-primary justify-content-end mt-2 px-2">
                                    <PaginationItem disabled={tablePage === 0}><PaginationLink onClick={() => { tableRef.current.scrollIntoView({ behavior: 'smooth' }); setTablePage(tablePage - 1); }}>{"Previous"}</PaginationLink></PaginationItem>
                                    {[...Array(Math.ceil(sortedTickers.length / pageSize)).keys()].map(i => (
                                      <PaginationItem key={i} active={i === tablePage}><PaginationLink onClick={() => { tableRef.current.scrollIntoView({ behavior: 'smooth' }); setTablePage(i); }}>{i + 1}</PaginationLink></PaginationItem>
                                    ))}
                                    <PaginationItem disabled={tablePage === Math.ceil(sortedTickers.length / pageSize) - 1}><PaginationLink onClick={() => { tableRef.current.scrollIntoView({ behavior: 'smooth' }); setTablePage(tablePage + 1); }}>{"Next"}</PaginationLink></PaginationItem>
                                  </Pagination>
                                )}
                                {false && tickers.length % pageSize === 0 && !marketPageEnd && (<div className="text-center mt-3"><Button color="primary-2x" outline disabled={marketLoading} onClick={() => setMarketPage(marketPage + 1)}>{marketLoading ? 'Loading...' : 'See more'}</Button></div>)}
                              </div>
                            </div>
                            :
                            marketLoading ?
                              <div className="loader-box" style={{ height: '25rem' }}>
                                <div className="loader-10" />
                              </div>
                              :
                              null
                          }
                        </>
                      )}
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

export default Exchange;
