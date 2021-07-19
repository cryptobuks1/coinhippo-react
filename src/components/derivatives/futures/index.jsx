import React, { Fragment, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { VS_CURRENCY, ALL_CRYPTO_DATA, EXCHANGE_RATES_DATA } from '../../../redux/types';
import { Container, Row, Col, Card, CardHeader, CardBody, Media, Badge, Input, Nav, NavItem, NavLink, Table, Button, Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import { Grid, List, ChevronDown, ChevronUp, Search } from 'react-feather';
import _ from 'lodash';
//import moment from 'moment';
import numeral from 'numeral';
import Spinner from '../../spinner';
import Error404 from '../../../pages/errors/error404';
import { menus, currenciesGroups } from '../../../layout/header/menus';
import { getDerivatives } from '../../../api';
import { useIsMountedRef, cex, dex, numberOptimizeDecimal } from '../../../utils';

const Futures = props => {
  const pageSize = 100;
  const isMountedRef = useIsMountedRef();
  const [data, setData] = useState([]);
  const [displayTypeSelected, setDisplayTypeSelected] = useState('table');
  const currency = useSelector(content => content.Preferences[VS_CURRENCY]);
  const allCryptoData = useSelector(content => content.Data[ALL_CRYPTO_DATA]);
  const exchangeRatesData = useSelector(content => content.Data[EXCHANGE_RATES_DATA]);
  const [marketSort, setMarketSort] = useState({ field: null, direction: 'asc' });
  const [marketPage, setMarketPage] = useState(0);
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

  useEffect(() => {
    const getData = async () => {
      if (isMountedRef.current) {
        setMarketLoading(true);
      }
      const newData = data ? data : [];
      let size = 0;
      try {
        let derivativesData = await getDerivatives({ include_tickers: 'unexpired' });
        derivativesData = derivativesData && !derivativesData.error ? derivativesData : null;
        if (derivativesData) {
          for (let i = 0; i < derivativesData.length; i++) {
            if (derivativesData[i].contract_type === 'futures') {
              newData[size] = derivativesData[i];
              size++;
            }
          }
        }
      } catch (err) {}
      newData.length = size;
      if (isMountedRef.current) {
        if (size !== 0) {
          setMarketPage(Math.floor(newData.length / pageSize));
        }
        setMarketPageEnd(true);
        if (size !== 0) {
          setData(newData.length > 0 ? newData : null);
        }
        setMarketLoading(false);
      }
    };
    getData();
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, currency, data]);

  const currencyData = _.head(_.uniq(currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === currency), 'id'));
  const currencyVolume = 'usd';
  const currencyVolumeData = _.head(_.uniq(currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === currencyVolume), 'id'));
  const filteredData = data && data.map((d, i) => {
    d.rank = i;
    d.price = !isNaN(d.price) && typeof d.price === 'string' ? Number(d.price) : d.price;
    d.spread = typeof d.spread === 'number' ? d.spread : -1;
    d.open_interest = typeof d.open_interest === 'number' ? d.open_interest : -1;
    let coinIndex = -1;
    if (coinIndex < 0 && d.symbol.indexOf('-') > -1) {
      coinIndex = d.symbol.split('-')[0] && allCryptoData && allCryptoData.coins ? allCryptoData.coins.findIndex(c => c.symbol.toLowerCase() === d.symbol.split('-')[0].toLowerCase()) : -1;
    }
    if (coinIndex < 0 && d.symbol.indexOf('_') > -1) {
      coinIndex = d.symbol.split('_')[0] && allCryptoData && allCryptoData.coins ? allCryptoData.coins.findIndex(c => c.symbol.toLowerCase() === d.symbol.split('_')[0].toLowerCase()) : -1;
    }
    if (coinIndex < 0 && d.symbol.length >= 6 && d.symbol.substring(3, 6).toLowerCase() === 'usd' && d.symbol.indexOf('-') < 0 && d.symbol.indexOf('_') < 0) {
      coinIndex = d.symbol.substring(0, 3) && allCryptoData && allCryptoData.coins ? allCryptoData.coins.findIndex(c => c.symbol.toLowerCase() === d.symbol.substring(0, 3).toLowerCase()) : -1;
    }
    if (coinIndex < 0) {
      coinIndex = d.index_id && allCryptoData && allCryptoData.coins ? allCryptoData.coins.findIndex(c => c.symbol.toLowerCase() === d.index_id.toLowerCase()) : -1;
    }
    d.coin_data = coinIndex > -1 ? allCryptoData.coins[coinIndex] : null;
    if (d.coin_data && d.coin_data.large) {
      d.coin_data.image = d.coin_data.large;
    }
    const exchangeIndex = d.market && allCryptoData && allCryptoData.exchanges ? allCryptoData.exchanges.findIndex(e => e.name.toLowerCase() === d.market.toLowerCase()) : -1;
    d.exchange_data = exchangeIndex > -1 ? allCryptoData.exchanges[exchangeIndex] : null;
    if (d.exchange_data && d.exchange_data.large) {
      d.exchange_data.image = d.exchange_data.large;
    }
    return d;
  }).filter((d, i) => (i < (marketPage + (marketPage < 0 ? 2 : 1)) * (marketPage < 0 ? 10 : pageSize)) && (!marketSearch || (d.market && d.market.toLowerCase().indexOf(marketSearch.toLowerCase()) > -1) || (d.symbol && d.symbol.toLowerCase().indexOf(marketSearch.toLowerCase()) > -1) || (d.coin_data && d.coin_data.name && d.coin_data.name.toLowerCase().indexOf(marketSearch.toLowerCase()) > -1)));
  const sortedData = _.orderBy(filteredData, [marketSort.field || 'rank'], [marketSort.direction]);
  return (
    <Fragment>
      <Container fluid={true}>
        <Row>
          <Col xs="12">
            <Card className="bg-transparent border-0" style={{ boxShadow: 'none' }}>
              <CardHeader className="bg-transparent pt-2 pb-4 px-0">
                <Row className="px-0 px-lg-3 mx-0 mx-lg-1">
                  <Col lg="4" md="4" xs="12">
                    <Nav className="nav-pills nav-primary d-flex align-items-center">
                      {menus[0].subMenu[0][1].subMenu.map((m, key) => (
                        <NavItem key={key} style={{ maxWidth: width <= 575 ? 'fit-content' : '' }}>
                          <div className={`nav-link${m.path === '/derivatives/futures' ? ' active' : ''}${width <= 991 ? ' f-12 p-2' : ''}`}>
                            <Link to={m.path} style={{ color: 'unset' }}>
                              {m.title}
                            </Link>
                          </div>
                        </NavItem>
                      ))}
                    </Nav>
                  </Col>
                  <Col lg="6" md="6" xs="8" className={`mt-3 mt-md-0 d-flex align-items-center ${width <= 575 ? '' : 'justify-content-center'}`}>
                    <h1 className="mb-0">
                      <div className={`${width <= 575 ? 'f-16' : width <= 991 ? 'f-18' : 'f-24'} mb-2`} style={{ lineHeight: '1.25' }}>{"Top Cryptocurrency Derivatives"}</div>
                      <div className={`f-w-300 text-info f-${width <= 575 ? 10 : 14} text-${width <= 575 ? 'left mt-2' : 'center'}`} style={{ lineHeight: 1.5 }}>{"Futures Contract by Open Interest"}</div>
                    </h1>
                  </Col>
                  <Col lg="2" md="2" xs="4" className="mt-3 mt-md-0">
                    <Nav className="nav-pills nav-primary d-flex align-items-center justify-content-end">
                      {['table', 'card'].map(t => (
                        <NavItem key={t} style={{ maxWidth: width <= 575 ? 'fit-content' : '' }}>
                          <NavLink onClick={() => setDisplayTypeSelected(t)} className={`${displayTypeSelected === t ? 'active' : ''}${width <= 991 ? ' f-12' : ''} py-1 px-2`}>
                            {t === 'card' ? <Grid className="mt-1" style={{ width: '1.25rem', height: '1rem' }} /> : <List className="mt-1" style={{ width: '1.25rem', height: '1rem' }} />}
                          </NavLink>
                        </NavItem>
                      ))}
                    </Nav>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody className="pt-3 pb-2 px-0 px-lg-4">
                {!data ?
                  <Error404 />
                  :
                  data.length > 0 ?
                    <>
                      <div ref={tableRef} className="p-absolute" style={{ marginTop: width <= 345 ? '-138px' : width <= 575 ? '-116px' : width <= 907 ? '-121px' : width <= 991 ? '-99px' : width <= 1200 ? '-119px' : '-81px' }} />
                      <div className="d-flex align-items-center pt-3 px-2">
                        {data && (
                          <span className="f-w-500">
                            <div>
                              <h2 className="f-14 d-inline-flex mb-0">{"Total Open Interest"}</h2>{": "}
                              <span className="font-secondary f-w-400">
                                {exchangeRatesData[currencyVolume] && typeof exchangeRatesData[currencyVolume].value === 'number' && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' ?
                                  currencyData && currencyData.symbol
                                  :
                                  currencyVolumeData && currencyVolumeData.symbol
                                }
                                {numberOptimizeDecimal(numeral(_.sum(data.filter(d => d.open_interest >= 0).map(d => Number(d.open_interest))) * (exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' ? exchangeRatesData[currency].value : 1) / (exchangeRatesData[currencyVolume] && typeof exchangeRatesData[currencyVolume].value === 'number' ? exchangeRatesData[currencyVolume].value : 1)).format('0,0'))}
                                {exchangeRatesData[currencyVolume] && typeof exchangeRatesData[currencyVolume].value === 'number' && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' ?
                                  !(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)
                                  :
                                  !(currencyVolumeData && currencyVolumeData.symbol) && (<>&nbsp;{currencyVolume.toUpperCase()}</>)
                                }
                              </span>
                            </div>
                            <div>
                              <h2 className="f-14 d-inline-flex mb-0">{"Total Volume"}</h2>{": "}
                              <span className="font-secondary f-w-400">
                                {exchangeRatesData[currencyVolume] && typeof exchangeRatesData[currencyVolume].value === 'number' && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' ?
                                  currencyData && currencyData.symbol
                                  :
                                  currencyVolumeData && currencyVolumeData.symbol
                                }
                                {numberOptimizeDecimal(numeral(_.sum(data.map(d => Number(d.volume_24h))) * (exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' ? exchangeRatesData[currency].value : 1) / (exchangeRatesData[currencyVolume] && typeof exchangeRatesData[currencyVolume].value === 'number' ? exchangeRatesData[currencyVolume].value : 1)).format('0,0'))}
                                {exchangeRatesData[currencyVolume] && typeof exchangeRatesData[currencyVolume].value === 'number' && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' ?
                                  !(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)
                                  :
                                  !(currencyVolumeData && currencyVolumeData.symbol) && (<>&nbsp;{currencyVolume.toUpperCase()}</>)
                                }
                              </span>
                            </div>
                          </span>
                        )}
                        <span className="d-flex align-items-center ml-auto"><Search /><Input type="text" value={marketSearch} onChange={e => setMarketSearch(e.target.value)} placeholder="Search" className="b-r-6 f-14 ml-2" style={{ maxWidth: 'max-content' }} /></span>
                      </div>
                      {displayTypeSelected === 'card' ?
                        <Row className="mt-3 px-2">
                          {filteredData.filter((d, i) => i >= tablePage * pageSize && i < (tablePage + 1) * pageSize).map((d, i) => (
                            <Col key={i} xl="3" lg="4" md="6" xs="12" className={`mt-${i < 4 ? width <= 767 ? i < 1 ? 2 : 4 : width <= 991 ? i < 2 ? 2 : 4 : width <= 1200 ? i < 3 ? 2 : 4 : i < 4 ? 2 : 4 : 4}`}>
                              <Card className="mb-0 p-3" style={{ boxShadow: 'none' }}>
                                <div className="media">
                                  {d.coin_data && d.coin_data.image && (<img className="align-self-top img-fluid img-30 mr-3" src={d.coin_data.image} alt={!d.coin_data.image.startsWith('missing_') ? d.coin_data.name : ''} />)}
                                  <div className="media-body">
                                    <h2 className="f-16 d-flex align-items-center">
                                      {d.symbol}
                                    </h2>
                                    <div>
                                      <Link to={`/exchange${d.exchange_data && d.exchange_data.id ? `/${d.exchange_data.id}` : 's/derivatives'}`}>
                                        {d.exchange_data && d.exchange_data.image && (
                                          <span className="avatar mr-2">
                                            <Media body className="img-20" src={d.exchange_data.image} alt={!d.exchange_data.image.startsWith('missing_') ? d.exchange_data.name : ''} />
                                          </span>
                                        )}
                                        {d.market}
                                        {d.exchange_data && (
                                          dex.indexOf(d.exchange_data.id) > -1 ?
                                            <div className={`f-10 text-info${d.exchange_data.image ? ' ml-4 pl-1' : ''}`}>{"Decentralized"}</div>
                                            :
                                            cex.indexOf(d.exchange_data.id) > -1 ?
                                              <div className={`f-10 text-info${d.exchange_data.image ? ' ml-4 pl-1' : ''}`}>{"Centralized"}</div>
                                              :
                                              null
                                        )}
                                      </Link>
                                    </div>
                                    <div className="mt-2 pt-1">
                                      <div className="f-w-500 font-primary">{"Price"}</div>
                                      <Row className="mt-1">
                                        <Col xs="7" className="f-18">
                                          {typeof d.price === 'number' || typeof d.price === 'string' ?
                                            <>
                                              {currencyVolumeData && currencyVolumeData.symbol}
                                              {numberOptimizeDecimal(numeral(Number(d.price)).format(Number(d.price) > 1 ? '0,0.00' : '0,0.000000'))}
                                              {!(currencyVolumeData && currencyVolumeData.symbol) && (<>&nbsp;{currencyVolume.toUpperCase()}</>)}
                                            </>
                                            :
                                            'N/A'
                                          }
                                          {currencyVolume !== currency && (typeof d.price === 'number' || typeof d.price === 'string') && exchangeRatesData[currencyVolume] && typeof exchangeRatesData[currencyVolume].value === 'number' && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' && (
                                            <div className="f-10 text-info">
                                              {currencyData && currencyData.symbol}
                                              {numberOptimizeDecimal(numeral(Number(d.price * exchangeRatesData[currency].value / exchangeRatesData[currencyVolume].value)).format(Number(d.price) > 1 ? '0,0.00' : '0,0.000000'))}
                                              {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                            </div>
                                          )}
                                        </Col>
                                        <Col xs="5" className={`f-18 ${d.price_percentage_change_24h > 0 ? 'font-success' : d.price_percentage_change_24h < 0 ? 'font-danger' : ''}`}>
                                          {typeof d.price_percentage_change_24h === 'number' ? numberOptimizeDecimal(numeral(d.price_percentage_change_24h / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(d.price_percentage_change_24h / 100).format('+0,0.00%')) : '-'}
                                        </Col>
                                      </Row>
                                    </div>
                                    <div className="mt-2 pt-1">
                                      <Row>
                                        <Col xs="6" className="f-18" style={{ borderRight: '1px solid #dedede' }}>
                                          {typeof d.index === 'number' ? numberOptimizeDecimal(numeral(d.index).format(d.index > 1 ? '0,0.00' : '0,0.000000')) : 'N/A'}
                                          <div className="f-12 text-info">{"Index Price"}</div>
                                        </Col>
                                        <Col xs="6" className="f-18">
                                          {typeof d.basis === 'number' ? numberOptimizeDecimal(numeral(d.basis / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(d.basis / 100).format('0,0.00%')) : '-'}
                                          <div className="f-12 text-info">{"Basis"}</div>
                                        </Col>
                                      </Row>
                                    </div>
                                    <div className="mt-2 pt-1">
                                      <Row>
                                        <Col xs="6" className="f-18" style={{ borderRight: '1px solid #dedede' }}>
                                          {typeof d.spread === 'number' && d.spread >= 0 ? numberOptimizeDecimal(numeral(d.spread / 100).format('0,0.00%')) : '-'}
                                          <div className="f-12 text-info">{"Spread"}</div>
                                        </Col>
                                        <Col xs="6" className="f-18">
                                          {numeral(d.funding_rate / 100).format('0,0.00%')}
                                          <div className="f-12 text-info">{"Funding Rate"}</div>
                                        </Col>
                                      </Row>
                                    </div>
                                    <div className="mt-2 pt-1">
                                      <div className="f-w-500 font-primary d-flex align-items-center">{"Open Interest"}</div>
                                      <h3 className="f-14 mt-1 mb-0">
                                        {(typeof d.open_interest === 'number' || typeof d.open_interest === 'string') && d.open_interest >= 0 ?
                                          <>
                                            {currencyVolumeData && currencyVolumeData.symbol}
                                            {numberOptimizeDecimal(numeral(Number(d.open_interest)).format(Number(d.open_interest) > 1 ? '0,0' : '0,0.00'))}
                                            {!(currencyVolumeData && currencyVolumeData.symbol) && (<>&nbsp;{currencyVolume.toUpperCase()}</>)}
                                          </>
                                          :
                                          'N/A'
                                        }
                                        {currencyVolume !== currency && (typeof d.open_interest === 'number' || typeof d.open_interest === 'string') && d.open_interest >= 0 && exchangeRatesData[currencyVolume] && typeof exchangeRatesData[currencyVolume].value === 'number' && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' && (
                                          <div className="f-10 text-info">
                                            {currencyData && currencyData.symbol}
                                            {numberOptimizeDecimal(numeral(Number(d.open_interest * exchangeRatesData[currency].value / exchangeRatesData[currencyVolume].value)).format(Number(d.open_interest) > 1 ? '0,0.00' : '0,0.000000'))}
                                            {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                          </div>
                                        )}
                                      </h3>
                                    </div>
                                    <div className="mt-2 pt-1">
                                      <div className="f-w-500 font-primary d-flex align-items-center">{"Volume"}<Badge color="light" pill className="f-10 text-secondary f-w-300 ml-2">24h</Badge></div>
                                      <h3 className="f-14 mt-1 mb-0">
                                        {typeof d.volume_24h === 'number' || typeof d.volume_24h === 'string' ?
                                          <>
                                            {currencyVolumeData && currencyVolumeData.symbol}
                                            {numberOptimizeDecimal(numeral(Number(d.volume_24h)).format(Number(d.volume_24h) > 1 ? '0,0' : '0,0.00'))}
                                            {!(currencyVolumeData && currencyVolumeData.symbol) && (<>&nbsp;{currencyVolume.toUpperCase()}</>)}
                                          </>
                                          :
                                          'N/A'
                                        }
                                        {currencyVolume !== currency && (typeof d.volume_24h === 'number' || typeof d.volume_24h === 'string') && exchangeRatesData[currencyVolume] && typeof exchangeRatesData[currencyVolume].value === 'number' && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' && (
                                          <div className="f-10 text-info">
                                            {currencyData && currencyData.symbol}
                                            {numberOptimizeDecimal(numeral(Number(d.volume_24h * exchangeRatesData[currency].value / exchangeRatesData[currencyVolume].value)).format(Number(d.volume_24h) > 1 ? '0,0.00' : '0,0.000000'))}
                                            {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                          </div>
                                        )}
                                      </h3>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                        :
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
                                    onClick={() => setMarketSort({ field: 'market', direction: marketSort.field === 'market' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`${marketSort.field === 'market' ? 'bg-light' : ''}`}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {"Exchange"}
                                    {marketSort.field === 'market' && (
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
                                    onClick={() => setMarketSort({ field: 'symbol', direction: marketSort.field === 'symbol' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`${marketSort.field === 'symbol' ? 'bg-light' : ''}`}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {"Pairs"}
                                    {marketSort.field === 'symbol' && (
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
                                    onClick={() => setMarketSort({ field: 'price', direction: marketSort.field === 'price' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`text-right ${marketSort.field === 'price' ? 'bg-light' : ''}`}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {"Price"}
                                    {marketSort.field === 'price' && (
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
                                    onClick={() => setMarketSort({ field: 'price_percentage_change_24h', direction: marketSort.field === 'price_percentage_change_24h' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`text-right ${marketSort.field === 'price_percentage_change_24h' ? 'bg-light' : ''}`}
                                    style={{ minWidth: '7rem', cursor: 'pointer' }}
                                  >
                                    {"Change %"}
                                    {marketSort.field === 'price_percentage_change_24h' && (
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
                                  <th
                                    onClick={() => setMarketSort({ field: 'basis', direction: marketSort.field === 'basis' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`text-right ${marketSort.field === 'basis' ? 'bg-light' : ''}`}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {"Basis"}
                                    {marketSort.field === 'basis' && (
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
                                    onClick={() => setMarketSort({ field: 'spread', direction: marketSort.field === 'spread' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`text-right ${marketSort.field === 'spread' ? 'bg-light' : ''}`}
                                    style={{ minWidth: '7rem', cursor: 'pointer' }}
                                  >
                                    {"Spread %"}
                                    {marketSort.field === 'spread' && (
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
                                  <th
                                    onClick={() => setMarketSort({ field: 'open_interest', direction: marketSort.field === 'open_interest' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`text-right ${marketSort.field === 'open_interest' ? 'bg-light' : ''}`}
                                    style={{ minWidth: '10rem', cursor: 'pointer' }}
                                  >
                                    {"Open Interest"}
                                    {marketSort.field === 'open_interest' && (
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
                                    onClick={() => setMarketSort({ field: 'volume_24h', direction: marketSort.field === 'volume_24h' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`${marketSort.field === 'volume_24h' ? 'bg-light' : ''}`}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <div className="d-flex align-items-center justify-content-end">
                                      {"Volume"}
                                      <Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">24h</Badge>
                                      {marketSort.field === 'volume_24h' && (
                                        <>
                                          {marketSort.direction === 'desc' ?
                                            <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                            :
                                            <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                          }
                                        </>
                                      )}
                                    </div>
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
                                {sortedData.filter((d, i) => i >= tablePage * pageSize && i < (tablePage + 1) * pageSize).map((d, i) => (
                                  <tr key={i}>
                                    <td>{d.rank + 1}</td>
                                    <td className={`f-w-500 ${marketSort.field === 'market' ? 'bg-light' : ''}`}>
                                      <Link to={`/exchange${d.exchange_data && d.exchange_data.id ? `/${d.exchange_data.id}` : 's/derivatives'}`}>
                                        <div className="d-flex">
                                          {d.exchange_data && d.exchange_data.image && (
                                            <span className="avatar mr-2">
                                              <Media body className="img-20" src={d.exchange_data.image} alt={!d.exchange_data.image.startsWith('missing_') ? d.exchange_data.name : ''} />
                                            </span>
                                          )}
                                          <span>{d.market}</span>
                                        </div>
                                        {d.exchange_data && (
                                          dex.indexOf(d.exchange_data.id) > -1 ?
                                            <div className={`f-10 text-info${d.exchange_data.image ? ' ml-4 pl-1' : ''}`}>{"Decentralized"}</div>
                                            :
                                            cex.indexOf(d.exchange_data.id) > -1 ?
                                              <div className={`f-10 text-info${d.exchange_data.image ? ' ml-4 pl-1' : ''}`}>{"Centralized"}</div>
                                              :
                                              null
                                        )}
                                      </Link>
                                    </td>
                                    <td className={`f-w-500 ${marketSort.field === 'symbol' ? 'bg-light' : ''}`}>
                                      {d.coin_data && d.coin_data.image && (
                                        <span className="avatar mr-2">
                                          <Media body className="img-20" src={d.coin_data.image} alt={!d.coin_data.image.startsWith('missing_') ? d.coin_data.name : ''} />
                                        </span>
                                      )}
                                      {d.symbol}
                                    </td>
                                    <td className={`text-right ${marketSort.field === 'price' ? 'bg-light' : ''}`}>
                                      {typeof d.price === 'number' || typeof d.price === 'string' ?
                                        <>
                                          {currencyVolumeData && currencyVolumeData.symbol}
                                          {numberOptimizeDecimal(numeral(Number(d.price)).format(Number(d.price) > 1 ? '0,0.00' : '0,0.0000000000'))}
                                          {!(currencyVolumeData && currencyVolumeData.symbol) && (<>&nbsp;{currencyVolume.toUpperCase()}</>)}
                                        </>
                                        :
                                        'N/A'
                                      }
                                      {currencyVolume !== currency && (typeof d.price === 'number' || typeof d.price === 'string') && exchangeRatesData[currencyVolume] && typeof exchangeRatesData[currencyVolume].value === 'number' && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' && (
                                        <div className="f-10 text-info">
                                          {currencyData && currencyData.symbol}
                                          {numberOptimizeDecimal(numeral(Number(d.price * exchangeRatesData[currency].value / exchangeRatesData[currencyVolume].value)).format(Number(d.price) > 1 ? '0,0.00' : '0,0.000000'))}
                                          {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                        </div>
                                      )}
                                    </td>
                                    <td className={`text-right ${marketSort.field === 'price_percentage_change_24h' ? 'bg-light' : ''} ${d.price_percentage_change_24h > 0 ? 'font-success' : d.price_percentage_change_24h < 0 ? 'font-danger' : ''}`}>{typeof d.price_percentage_change_24h === 'number' ? numberOptimizeDecimal(numeral(d.price_percentage_change_24h / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(d.price_percentage_change_24h / 100).format('+0,0.00%')) : '-'}</td>
                                    <td className={`text-right ${marketSort.field === 'index' ? 'bg-light' : ''}`}>{typeof d.index === 'number' ? numberOptimizeDecimal(numeral(d.index).format(d.index > 1 ? '0,0.00' : '0,0.0000000000')) : 'N/A'}</td>
                                    <td className={`text-right ${marketSort.field === 'basis' ? 'bg-light' : ''}`}>{typeof d.basis === 'number' ? numberOptimizeDecimal(numeral(d.basis / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(d.basis / 100).format('0,0.00%')) : '-'}</td>
                                    <td className={`text-right ${marketSort.field === 'spread' ? 'bg-light' : ''}`}>{typeof d.spread === 'number' && d.spread >= 0 ? numberOptimizeDecimal(numeral(d.spread / 100).format('0,0.00%')) : '-'}</td>
                                    <td className={`text-right ${marketSort.field === 'funding_rate' ? 'bg-light' : ''}`}>
                                      {numeral(d.funding_rate / 100).format('0,0.00%')}
                                    </td>
                                    <td className={`text-right ${marketSort.field === 'open_interest' ? 'bg-light' : ''}`}>
                                      {(typeof d.open_interest === 'number' || typeof d.open_interest === 'string') && d.open_interest >= 0 ?
                                        <>
                                          {currencyVolumeData && currencyVolumeData.symbol}
                                          {numberOptimizeDecimal(numeral(Number(d.open_interest)).format(Number(d.open_interest) > 1 ? '0,0' : '0,0.00'))}
                                          {!(currencyVolumeData && currencyVolumeData.symbol) && (<>&nbsp;{currencyVolume.toUpperCase()}</>)}
                                        </>
                                        :
                                        'N/A'
                                      }
                                      {currencyVolume !== currency && (typeof d.open_interest === 'number' || typeof d.open_interest === 'string') && d.open_interest >= 0 && exchangeRatesData[currencyVolume] && typeof exchangeRatesData[currencyVolume].value === 'number' && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' && (
                                        <div className="f-10 text-info">
                                          {currencyData && currencyData.symbol}
                                          {numberOptimizeDecimal(numeral(Number(d.open_interest * exchangeRatesData[currency].value / exchangeRatesData[currencyVolume].value)).format(Number(d.open_interest) > 1 ? '0,0.00' : '0,0.000000'))}
                                          {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                        </div>
                                      )}
                                    </td>
                                    <td className={`text-right ${marketSort.field === 'volume_24h' ? 'bg-light' : ''}`}>
                                      {typeof d.volume_24h === 'number' || typeof d.volume_24h === 'string' ?
                                        <>
                                          {currencyVolumeData && currencyVolumeData.symbol}
                                          {numberOptimizeDecimal(numeral(Number(d.volume_24h)).format(Number(d.volume_24h) > 1 ? '0,0' : '0,0.00'))}
                                          {!(currencyVolumeData && currencyVolumeData.symbol) && (<>&nbsp;{currencyVolume.toUpperCase()}</>)}
                                        </>
                                        :
                                        'N/A'
                                      }
                                      {currencyVolume !== currency && (typeof d.volume_24h === 'number' || typeof d.volume_24h === 'string') && exchangeRatesData[currencyVolume] && typeof exchangeRatesData[currencyVolume].value === 'number' && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' && (
                                        <div className="f-10 text-info">
                                          {currencyData && currencyData.symbol}
                                          {numberOptimizeDecimal(numeral(Number(d.volume_24h * exchangeRatesData[currency].value / exchangeRatesData[currencyVolume].value)).format(Number(d.volume_24h) > 1 ? '0,0.00' : '0,0.000000'))}
                                          {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                        </div>
                                      )}
                                    </td>
                                    {/*<td className={`font-roboto f-w-300 text-secondary text-right ${marketSort.field === 'last_traded_at' ? 'bg-light' : ''}`}>{moment(d.last_traded_at * 1000).fromNow()}</td>*/}
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                            {data.length % pageSize === 0 && !marketPageEnd && (<div className="text-center mt-3"><Button color="primary-2x" outline disabled={marketLoading} onClick={() => setMarketPage(marketPage + 1)}>{marketLoading ? 'Loading...' : 'See more'}</Button></div>)}
                          </div>
                        </div>
                      }
                      {Math.ceil(filteredData.length / pageSize) > 1 && (
                        <Pagination className={`pagination pagination-primary justify-content-end mt-${displayTypeSelected === 'card' ? 4 : 2}`}>
                          <PaginationItem disabled={tablePage === 0}><PaginationLink onClick={() => { tableRef.current.scrollIntoView({ behavior: 'smooth' }); setTablePage(tablePage - 1); }}>{"Previous"}</PaginationLink></PaginationItem>
                          {[...Array(Math.ceil(filteredData.length / pageSize)).keys()].map(i => (
                            <PaginationItem key={i} active={i === tablePage}><PaginationLink onClick={() => { tableRef.current.scrollIntoView({ behavior: 'smooth' }); setTablePage(i); }}>{i + 1}</PaginationLink></PaginationItem>
                          ))}
                          <PaginationItem disabled={tablePage === Math.ceil(filteredData.length / pageSize) - 1}><PaginationLink onClick={() => { tableRef.current.scrollIntoView({ behavior: 'smooth' }); setTablePage(tablePage + 1); }}>{"Next"}</PaginationLink></PaginationItem>
                        </Pagination>
                      )}
                    </>
                    :
                    <div className="loader-box">
                      <Spinner />
                    </div>
                }
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
}

export default Futures;
