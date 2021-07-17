import React, { Fragment, useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, CardHeader, CardBody, Media, Badge, Progress, Input } from 'reactstrap';
import _ from 'lodash';
import numeral from 'numeral';
import Spinner from '../../../spinner';
import Error404 from '../../../../pages/errors/error404';
import { currenciesGroups } from '../../../../layout/header/menus';
import { getCoin } from '../../../../api';
import { useIsMountedRef, getLocationData, numberOptimizeDecimal } from '../../../../utils';
import logo_min from '../../../../assets/images/logo/logo_square.png';
import logo_dark_min from '../../../../assets/images/logo/logo_square_white.png';

const Coin = props => {
  const locationData = getLocationData(window);
  const coinId = props.match ? props.match.params.coin_id : null;
  const isMountedRef = useIsMountedRef();
  const [data, setData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const currency = locationData.params && locationData.params.currency && currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === locationData.params.currency.toLowerCase()).length > 0 ? locationData.params.currency.toLowerCase() : 'usd';
  const [fromCurrencyValue, setFromCurrencyValue] = useState('');
  const [toCurrencyValue, setToCurrencyValue] = useState('');

  const handleFromCurrencyValueChange = useCallback((value, theData) => {
    if (isMountedRef.current) {
      setFromCurrencyValue(value);
    }
    theData = theData ? theData : data;
    if (theData && theData.market_data && theData.market_data.current_price && typeof theData.market_data.current_price[currency] === 'number') {
      const v = value === '' ? '' : Number(typeof value === 'string' ? value.replaceAll(',', '') : value) * theData.market_data.current_price[currency];
      if (isMountedRef.current) {
        setToCurrencyValue(numberOptimizeDecimal(v === '' ? v : numeral(v).format('0,0.0000000000') !== 'NaN' ? numeral(v).format('0,0.0000000000') : v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 })));
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
        setFromCurrencyValue(numberOptimizeDecimal(v === '' ? v : numeral(v).format('0,0.0000000000') !== 'NaN' ? numeral(v).format('0,0.0000000000') : v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 })));
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
          let coinData = await getCoin(coinId, { localization: false, tickers: false, community_data: false, developer_data: false });
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
    getData();
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, coinId, currency]);

  if (coinId && data && data.id !== coinId && dataLoaded && isMountedRef.current) {
    setData(null);
    setDataLoaded(false);
  }
  document.body.className = locationData.params && locationData.params.theme && locationData.params.theme.toLowerCase() === 'dark' ? 'dark-only' : 'light';
  const extended = locationData.params && locationData.params.extended && locationData.params.extended.toLowerCase() === 'true' ? true : false;
  const extra = locationData.params && locationData.params.extra && locationData.params.extra.toLowerCase();
  const currencyData = _.head(_.uniq(currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === currency), 'id'));
  const highPrice = data && data.market_data && _.max([data.market_data.ath[currency], data.market_data.current_price[currency], data.market_data.high_24h[currency]].filter(x => typeof x === 'number'));
  const lowPrice = data && data.market_data && _.min([data.market_data.atl[currency], data.market_data.current_price[currency], data.market_data.low_24h[currency]].filter(x => typeof x === 'number'));
  const hasExtra = (extra === 'ath' && highPrice) || (extra === 'atl' && lowPrice);
  return (
    <Fragment>
      <Container fluid={true} style={{ maxWidth: extended ? '40rem' : '25rem' }}>
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
                  <Card className="bg-transparent border-0 mb-3" style={{ boxShadow: 'none' }}>
                    <CardHeader className="widget-card-header bg-transparent p-0" style={{ borderBottom: 'none' }}>
                      <Row>
                        {extended ?
                          <>
                            <Col lg="5" sm="5" xs="12">
                              <div className="d-flex align-items-center">
                                <h1 className={`f-${data.name.length > 10 ? 18 : 22} d-flex align-items-center mb-0`}>
                                  <a href={`/coin/${data.id}`} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center" style={{ color: 'unset' }}>
                                    {data.image && data.image.large && (<div className="avatar mr-2"><Media body className="img-40" src={data.image.large} alt={data.symbol && data.symbol.toUpperCase()} /></div>)}
                                    {data.name}
                                  </a>
                                  {data.symbol && (<Badge color="light" pill className="f-12 f-w-300 ml-2">{data.symbol.toUpperCase()}</Badge>)}
                                </h1>
                              </div>
                              <div className="mt-2">
                                {typeof data.market_cap_rank === 'number' && (<Badge color="light" pill className="f-12 f-w-300 mb-1 mr-1">{"Rank #"}{numeral(data.market_cap_rank).format('0,0')}</Badge>)}
                              </div>
                            </Col>
                            <Col lg="7" sm="7" xs="12" className="mt-3 mt-sm-1">
                              <div className="mt-1">
                                <div className="h2 f-20 d-flex align-items-center">
                                  {data.market_data && data.market_data.current_price && typeof data.market_data.current_price[currency] === 'number' ?
                                    <>
                                      {currencyData && currencyData.symbol}
                                      {numberOptimizeDecimal(numeral(data.market_data.current_price[currency]).format('0,0.0000000000') !== 'NaN' ? numeral(data.market_data.current_price[currency]).format('0,0.0000000000') : data.market_data.current_price[currency].toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}
                                      {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                    </>
                                    :
                                    'N/A'
                                  }
                                  {data.market_data && typeof data.market_data.price_change_percentage_24h_in_currency && typeof data.market_data.price_change_percentage_24h_in_currency[currency] === 'number' && (<Badge color={data.market_data.price_change_percentage_24h_in_currency[currency] > 0 ? 'success' : data.market_data.price_change_percentage_24h_in_currency[currency] < 0 ? 'danger' : 'light'} className="f-14 f-w-300 ml-2 py-1 px-2">{numeral(data.market_data.price_change_percentage_24h_in_currency[currency] / 100).format('+0,0.00%')}</Badge>)}
                                </div>
                                <div>
                                  {['btc', 'eth'].filter(c => (!data.symbol || c !== data.symbol) && data.market_data && data.market_data.current_price && typeof data.market_data.current_price[c] === 'number').map((c, i) => (
                                    <span key={i} className={`text-info f-w-300 small${i > 0 ? ' ml-2' : ''}`}>{numberOptimizeDecimal(numeral(data.market_data.current_price[c]).format('0,0.0000000000') !== 'NaN' ? numeral(data.market_data.current_price[c]).format('0,0.0000000000') : data.market_data.current_price[c].toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))} {c.toUpperCase()}</span>
                                  ))}
                                </div>
                              </div>
                              {data.market_data && data.market_data.low_24h && typeof data.market_data.low_24h[currency] === 'number' && data.market_data.high_24h && typeof data.market_data.high_24h[currency] === 'number' && (
                                <div className="d-flex align-items-center mt-0">
                                  <span className="f-10"><span className="text-info">Low:</span> {currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(data.market_data.low_24h[currency]).format('0,0.0000000000') !== 'NaN' ? numeral(data.market_data.low_24h[currency]).format('0,0.0000000000') : data.market_data.low_24h[currency].toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</span>
                                  <Progress value={100 * ((data.market_data.high_24h[currency] - data.market_data.low_24h[currency]) ? data.market_data.current_price[currency] - data.market_data.low_24h[currency] : 0.5) / ((data.market_data.high_24h[currency] - data.market_data.low_24h[currency]) ? data.market_data.high_24h[currency] - data.market_data.low_24h[currency] : 1)} className="progress-coin progress-8 w-50 mx-2" style={{ maxWidth: '10rem' }} />
                                  <span className="f-10 text-right"><span className="text-info">High:</span> {currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(data.market_data.high_24h[currency]).format('0,0.0000000000') !== 'NaN' ? numeral(data.market_data.high_24h[currency]).format('0,0.0000000000') : data.market_data.high_24h[currency].toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</span>
                                  <Badge color="light" pill className="f-10 text-secondary f-w-300 ml-2">24h</Badge>
                                </div>
                              )}
                            </Col>
                            <Col lg="5" sm="5" xs="12" className="mt-3 mt-sm-0">
                              <h2 style={{ display: 'contents', fontWeight: 'unset' }}><span className="f-12 text-secondary">{"Market Cap"}</span></h2>
                              {data.market_data && data.market_data.market_cap && typeof data.market_data.market_cap[currency] === 'number' && data.market_data.market_cap[currency] > 0 ?
                                <div className="h3 f-16 mt-2">{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(data.market_data.market_cap[currency]).format('0,0') !== 'NaN' ? numeral(data.market_data.market_cap[currency]).format('0,0') : data.market_data.market_cap[currency].toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}{!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}</div>
                                :
                                <div className="h3 f-16 mt-2">{"N/A"}</div>
                              }
                              <h2 style={{ display: 'contents', fontWeight: 'unset' }}><span className="f-12 text-secondary d-flex align-items-center" style={{ margin: '1.72px 0' }}>{"Volume"}<Badge color="light" pill className="f-10 text-secondary f-w-300 ml-2">24h</Badge></span></h2>
                              {data.market_data && data.market_data.total_volume && typeof data.market_data.total_volume[currency] === 'number' ?
                                <div className="h3 f-16 mt-2" style={{ marginTop: '9.2px' }}>{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(data.market_data.total_volume[currency]).format('0,0') !== 'NaN' ? numeral(data.market_data.total_volume[currency]).format('0,0') : data.market_data.total_volume[currency].toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}{!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}</div>
                                :
                                <div className="h3 f-16 mt-2">{"-"}</div>
                              }
                              {data.market_data && data.market_data.total_value_locked && typeof data.market_data.total_value_locked.usd === 'number' && data.market_data.total_value_locked.usd > 0 && (
                                <>
                                  <h2 style={{ display: 'contents', fontWeight: 'unset' }}><span className="f-12 text-secondary">{"Total Value Locked"}</span></h2>
                                  <div className="h3 f-16 mt-2">{"$"}{numberOptimizeDecimal(numeral(data.market_data.total_value_locked.usd).format('0,0') !== 'NaN' ? numeral(data.market_data.total_value_locked.usd).format('0,0') : data.market_data.total_value_locked.usd.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}</div>
                                </>
                              )}
                              <h2 style={{ display: 'contents', fontWeight: 'unset' }}><span className="f-12 text-secondary">{"Circulating Supply"}</span></h2>
                              {data.market_data && data.market_data && typeof data.market_data.circulating_supply === 'number' && data.market_data.circulating_supply > 0 ?
                                <div className="h3 f-16 mt-2">{numberOptimizeDecimal(numeral(data.market_data.circulating_supply).format('0,0') !== 'N/A' ? numeral(data.market_data.circulating_supply).format('0,0') : data.market_data.circulating_supply.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}{data.symbol && (<> {data.symbol.toUpperCase()}</>)}</div>
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
                                <div className="f-12 f-w-300"><span className="text-secondary">{typeof data.market_data.max_supply === 'number' ? 'Max' : 'Total'} Supply:</span> {numberOptimizeDecimal(numeral(typeof data.market_data.total_supply === 'number' ? data.market_data.total_supply : data.market_data.max_supply).format('0,0') !== 'NaN' ? numeral(typeof data.market_data.total_supply === 'number' ? data.market_data.total_supply : data.market_data.max_supply).format('0,0') : (typeof data.market_data.total_supply === 'number' ? data.market_data.total_supply : data.market_data.max_supply).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}</div>
                              )}
                            </Col>
                            <Col lg="7" sm="7" xs="12" className="mt-4">
                              <h2 className="f-16 mb-3">{"Calculator"}</h2>
                              <Card className="convert-price-card my-2">
                                <CardHeader className="d-flex align-items-center p-2">
                                  <div className="media py-1" style={{ maxWidth: '50%' }}>
                                    <img src={data.image && data.image.large} alt={data.symbol && data.symbol.toUpperCase()} className="img-fluid" style={{ maxWidth: '1.5rem', marginRight: '.5rem' }} />
                                    <div className="media-body">
                                      <span className="f-14">{data.symbol && data.symbol.toUpperCase()}</span>
                                      <p className="font-roboto f-10 text-secondary mb-0">{data.name}</p>
                                    </div>
                                  </div>
                                  <Input type="text" value={fromCurrencyValue} onChange={e => handleFromCurrencyValueChange(e.target.value)} className="b-r-6 f-14 text-right ml-auto" style={{ backgroundColor: 'rgba(0,0,0,.015)', maxWidth: 'max-content', border: 'none', boxShadow: 'none' }} />
                                </CardHeader>
                                <CardBody className="d-flex align-items-center p-2" style={{ backgroundColor: 'rgba(0,0,0,.025)', borderRadius: '0 0 15px 15px' }}>
                                  <div className="media py-1" style={{ maxWidth: '50%' }}>
                                    {currencyData && currencyData.flag ?
                                      <i className={`flag-icon flag-icon-${currencyData.flag} mt-1`} style={{ width: '1.5rem', marginRight: '.5rem' }} />
                                      :
                                      <img src={currencyData && currencyData.image} alt={currency && currency.toUpperCase()} className="img-fluid mt-1" style={{ maxWidth: '1.5rem', marginRight: '.5rem' }} />
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
                          </>
                          :
                          <>
                            <Col lg="12" sm="12" xs="12">
                              <div className="d-flex align-items-center">
                                <h1 className={`w-100 f-${data.name.length > 20 ? 18 : data.name.length > 10 ? 28 : 32} f-w-500 d-flex align-items-center mb-0`}>
                                  <a href={`/coin/${data.id}`} target="_blank" rel="noopener noreferrer">
                                    {data.image && data.image.large && (<div className="avatar mr-2"><Media body className="img-100" src={data.image.large} alt={data.symbol && data.symbol.toUpperCase()} /></div>)}
                                  </a>
                                  <a href={`/coin/${data.id}`} target="_blank" rel="noopener noreferrer" className="text-right ml-auto" style={{ display: 'grid' }}>
                                    {data.name}
                                    {data.symbol && (<Badge color="light" pill className="f-12 f-w-300 ml-auto">{data.symbol.toUpperCase()}</Badge>)}
                                  </a>
                                </h1>
                              </div>
                            </Col>
                            <Col lg="12" sm="12" xs="12" className="d-flex align-items-center mt-2">
                              {typeof data.market_cap_rank === 'number' && (<Badge color="light" pill className="f-16 f-w-300 my-auto ml-2">{"Rank #"}{numeral(data.market_cap_rank).format('0,0')}</Badge>)}
                              {data.market_data && typeof data.market_data.price_change_percentage_24h_in_currency && typeof data.market_data.price_change_percentage_24h_in_currency[currency] === 'number' && (
                                <span className={`f-24${data.market_data.price_change_percentage_24h_in_currency[currency] > 0 ? ' font-success' : data.market_data.price_change_percentage_24h_in_currency[currency] < 0 ? ' font-danger' : ''} ml-auto`}>{numeral(data.market_data.price_change_percentage_24h_in_currency[currency] / 100).format('+0,0.00%')}</span>
                              )}
                            </Col>
                            <Col lg="12" sm="12" xs="12" className={`my-${hasExtra ? '3 py-1' : 4}`}>
                              <div className={`h2 w-100 f-32 f-w-500 d-flex align-items-center justify-content-center${hasExtra ? ' mb-0' : ''}`}>
                                {data.market_data && data.market_data.current_price && typeof data.market_data.current_price[currency] === 'number' ?
                                  <>
                                    {currencyData && currencyData.symbol}
                                    {numberOptimizeDecimal(numeral(data.market_data.current_price[currency]).format('0,0.0000000000') !== 'NaN' ? numeral(data.market_data.current_price[currency]).format('0,0.0000000000') : data.market_data.current_price[currency].toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}
                                    {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                  </>
                                  :
                                  'N/A'
                                }
                              </div>
                              {extra === 'ath' && highPrice ?
                                <div className="f-12 text-info text-center">
                                  {"ATH: "}
                                  {currencyData && currencyData.symbol}
                                  {numberOptimizeDecimal(numeral(highPrice).format('0,0.0000000000') !== 'NaN' ? numeral(highPrice).format('0,0.0000000000') : highPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}
                                  {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                </div>
                                :
                                extra === 'atl' && lowPrice ?
                                  <div className="f-12 text-info text-center">
                                    {"ATL: "}
                                    {currencyData && currencyData.symbol}
                                    {numberOptimizeDecimal(numeral(lowPrice).format('0,0.0000000000') !== 'NaN' ? numeral(lowPrice).format('0,0.0000000000') : lowPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}
                                    {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                  </div>
                                  :
                                  null
                              }
                            </Col>
                            <Col lg="12" sm="12" xs="12" className={`mb-${hasExtra ? 1 : 2}`}>
                              <div className="d-flex align-items-center">
                                <h2 className="my-auto ml-2" style={{ fontWeight: 'unset' }}><span className="f-14 text-secondary d-flex align-items-center">{"Market Cap"}</span></h2>
                                {data.market_data && data.market_data.market_cap && typeof data.market_data.market_cap[currency] === 'number' && data.market_data.market_cap[currency] > 0 ?
                                  <div className="h3 f-14 f-w-400 ml-auto mb-0">{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(data.market_data.market_cap[currency]).format('0,0') !== 'NaN' ? numeral(data.market_data.market_cap[currency]).format('0,0') : data.market_data.market_cap[currency].toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}{!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}</div>
                                  :
                                  <div className="h3 f-14 f-w-400 ml-auto mb-0">{"N/A"}</div>
                                }
                              </div>
                              <div className="d-flex align-items-center mt-2">
                                <h2 className="my-auto ml-2" style={{ fontWeight: 'unset' }}><span className="f-14 text-secondary d-flex align-items-center">{"Volume"}<Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">24h</Badge></span></h2>
                                {data.market_data && data.market_data.total_volume && typeof data.market_data.total_volume[currency] === 'number' ?
                                  <div className="h3 f-14 f-w-400 ml-auto mb-0">{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(data.market_data.total_volume[currency]).format('0,0') !== 'NaN' ? numeral(data.market_data.total_volume[currency]).format('0,0') : data.market_data.total_volume[currency].toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}{!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}</div>
                                  :
                                  <div className="h3 f-14 f-w-400 ml-auto mb-0">{"-"}</div>
                                }
                              </div>
                              {data.market_data && data.market_data.total_value_locked && typeof data.market_data.total_value_locked.usd === 'number' && data.market_data.total_value_locked.usd > 0 && (
                                <div className="d-flex align-items-center mt-2">
                                  <h2 className="my-auto ml-2" style={{ fontWeight: 'unset' }}><span className="f-14 text-secondary d-flex align-items-center">{"Total Value Locked"}</span></h2>
                                  <div className="h3 f-14 f-w-400 ml-auto mb-0">{"$"}{numberOptimizeDecimal(numeral(data.market_data.total_value_locked.usd).format('0,0') !== 'NaN' ? numeral(data.market_data.total_value_locked.usd).format('0,0') : data.market_data.total_value_locked.usd.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}</div>
                                </div>
                              )}
                            </Col>
                          </>
                        }
                        <Col lg="12" sm="12" xs="12" className="d-flex align-items-center mt-2 pt-1">
                          <span className="f-10 text-secondary">
                            {"Data from "}
                            <a href="https://coingecko.com" target="_blank" rel="noopener noreferrer" style={{ color: 'unset' }}>{"CoinGecko"}</a>
                          </span>
                          <a href="/" target="_blank" rel="noopener noreferrer" className="f-10 d-flex align-items-center justify-content-end ml-auto">
                            <img className="img-fluid for-light" src={logo_min} alt={process.env.REACT_APP_APP_NAME} style={{ maxHeight: '1.25rem' }} />
                            <img className="img-fluid for-dark" src={logo_dark_min} alt={process.env.REACT_APP_APP_NAME} style={{ maxHeight: '1.25rem' }} />
                            &nbsp;{process.env.REACT_APP_APP_NAME}
                          </a>
                        </Col>
                      </Row>
                    </CardHeader>
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
