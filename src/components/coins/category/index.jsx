import React, { Fragment, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { VS_CURRENCY, ALL_CRYPTO_DATA } from '../../../redux/types';
import { Container, Row, Col, Card, CardHeader, CardBody, Media, Badge, Input, Nav, NavItem, NavLink, Table, Button, Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import { Select, Tooltip } from 'antd';
import { Grid, List, ChevronDown, ChevronUp, Search } from 'react-feather';
import _ from 'lodash';
import numeral from 'numeral';
import Spinner from '../../spinner';
import Error404 from '../../../pages/errors/error404';
import { menus, currenciesGroups } from '../../../layout/header/menus';
import { getCoinsMarkets } from '../../../api';
import { useIsMountedRef, sleep, numberOptimizeDecimal, capitalize } from '../../../utils';

const Category = props => {
  const pageSize = 100;
  const categoryId = props.match ? props.match.params.category_id.toLowerCase() : null;
  const isMountedRef = useIsMountedRef();
  const currency = useSelector(content => content.Preferences[VS_CURRENCY]);
  const allCryptoData = useSelector(content => content.Data[ALL_CRYPTO_DATA]);

  const [data, setData] = useState([]);
  const [displayTypeSelected, setDisplayTypeSelected] = useState('table');
  const [marketSort, setMarketSort] = useState({ field: null, direction: 'asc' });
  const [marketPage, setMarketPage] = useState(19);
  const [marketPageEnd, setMarketPageEnd] = useState(false);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketSearch, setMarketSearch] = useState('');
  const [redirectPath, setRedirectPath] = useState(null);
  const [tablePage, setTablePage] = useState(0);

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

  useEffect(() => {
    const getData = async () => {
      if (categoryId) {
        if (isMountedRef.current) {
          setMarketLoading(true);
        }
        const newData = data ? data : [];
        let size = 0;
        for (let i = 0; i <= marketPage; i++) {
          try {
            await sleep(500);
            let coinData = await getCoinsMarkets({ vs_currency: currency, category: categoryId, order: 'market_cap_desc', per_page: pageSize / 2, page: i + 1, price_change_percentage: '1h,24h,7d,30d' });
            coinData = coinData && !coinData.error ? coinData : null;
            if (coinData) {
              for (let j = 0; j < coinData.length; j++) {
                newData[size] = coinData[j];
                size++;
              }
              if (coinData.length < (pageSize / 2)) {
                if (isMountedRef.current) {
                  setMarketPageEnd(true);
                }
                break;
              }
            }
          } catch (err) {}
        }
        newData.length = size;
        if (isMountedRef.current) {
          if (size !== 0) {
            setData(newData.length > 0 ? newData : null);
          }
          setMarketLoading(false);
        }
      }
    };
    getData();
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, categoryId, currency, data, marketPage]);

  if (redirectPath) {
    if (window.location && window.location.pathname === redirectPath) {
      setRedirectPath(null);
    }
    return (<Redirect to={redirectPath} />);
  }

  const currencyData = _.head(_.uniq(currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === currency), 'id'));

  const filteredData = data && _.orderBy(data.filter(d => d).map(d => { return { ...d, market_cap: typeof d.market_cap === 'number' ? d.market_cap : 0 } }), ['market_cap'], ['desc']).map((d, i) => {
    d.rank = i;
    d.price_change_percentage_1h_in_currency = typeof d.price_change_percentage_1h_in_currency === 'number' ? d.price_change_percentage_1h_in_currency : 0;
    d.price_change_percentage_24h_in_currency = typeof d.price_change_percentage_24h_in_currency === 'number' ? d.price_change_percentage_24h_in_currency : 0;
    d.price_change_percentage_7d_in_currency = typeof d.price_change_percentage_7d_in_currency === 'number' ? d.price_change_percentage_7d_in_currency : 0;
    d.price_change_percentage_30d_in_currency = typeof d.price_change_percentage_30d_in_currency === 'number' ? d.price_change_percentage_30d_in_currency : 0;
    d.fully_diluted_valuation = typeof d.fully_diluted_valuation === 'number' ? d.fully_diluted_valuation : -1;
    return d;
  }).filter((d, i) => /*(i < (marketPage + (marketPage < 0 ? 2 : 1)) * (marketPage < 0 ? 10 : pageSize)) && */(!marketSearch || (d.name && d.name.toLowerCase().indexOf(marketSearch.toLowerCase()) > -1) || (d.symbol && d.symbol.toLowerCase().indexOf(marketSearch.toLowerCase()) > -1)));
  const sortedData = _.orderBy(filteredData, [marketSort.field || 'rank'], [marketSort.direction]);

  return (
    <Fragment>
      <Container fluid={true}>
        <Row>
          <Col xs="12">
            <Card className="bg-transparent border-0" style={{ boxShadow: 'none' }}>
              <CardHeader className="bg-transparent pt-2 pb-4 px-0">
                <Row className="px-0 px-lg-3 mx-0 mx-lg-1">
                  <Col xl="4" lg="4" md="5" xs="12">
                    <Nav className="nav-pills nav-primary d-flex align-items-center">
                      {menus[0].subMenu[1].subMenu.filter(m => m.fixed).map((m, key) => (
                        <NavItem key={key} style={{ maxWidth: width <= 575 ? 'fit-content' : '' }}>
                          <div className={`nav-link${width <= 1200 ? ' f-12 p-2' : ''}`}>
                            <Link to={m.path} style={{ color: 'unset' }}>
                              {m.title}
                            </Link>
                          </div>
                        </NavItem>
                      ))}
                      <div style={{ marginTop: width <= 1200 ? 'unset' : '-.6rem' }}>
                        <div className="f-10 text-secondary text-left ml-2 pl-1">{"Categories"}</div>
                        <Select
                          showSearch
                          bordered={false}
                          placeholder="Search Category"
                          optionFilterProp="children"
                          filterOption={(input, option) => option.data ? option.data.id.toLowerCase().indexOf(input.toLowerCase()) > -1 || option.data.name.toLowerCase().indexOf(input.toLowerCase()) > -1 : false}
                          value={categoryId}
                          onSelect={value => {
                            setMarketLoading(true);
                            setMarketPageEnd(false);
                            setRedirectPath(`/coins/${value}`);
                          }}
                          dropdownClassName="vs-currency-select-dropdown"
                          style={{ width: '12.5rem', marginTop: '-.5rem' }}
                        >
                          {allCryptoData && allCryptoData.categories && allCryptoData.categories.length > 0 && allCryptoData.categories.map((d, key) => (
                            <Select.Option key={key} disabled={d.category_id === categoryId} value={d.category_id} data={{ ...d, dataType: 'categories' }} className="small">
                              {d.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>
                    </Nav>
                  </Col>
                  <Col xl="6" lg="6" md="5" xs="8" className={`mt-3 mt-md-0 d-flex align-items-top ${width <= 575 ? '' : 'justify-content-center'}`}>
                    <h1 className="mb-0">
                      <div className={`${width <= 575 ? 'f-14' : width <= 991 ? 'f-18' : width <= 1200 ? 'f-16' : 'f-24'} mb-2`} style={{ lineHeight: '1.25' }}>{`Top ${capitalize(categoryId)} Coins`}</div>
                      <div className={`f-w-300 text-info f-${width <= 575 ? 10 : 14} text-${width <= 575 ? 'left mt-2' : 'center'}`} style={{ lineHeight: 1.5 }}>{"by Market Capitalization"}</div>
                    </h1>
                  </Col>
                  <Col xl="2" lg="2" md="2" xs="4" className="mt-3 mt-md-0">
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
                  (!marketLoading && data.length > 0) || marketPageEnd ?
                    <>
                      <div ref={tableRef} className="p-absolute" style={{ marginTop: width <= 345 ? '-138px' : width <= 575 ? '-116px' : width <= 907 ? '-121px' : width <= 991 ? '-99px' : width <= 1200 ? '-119px' : '-81px' }} />
                      <div className="d-flex align-items-center pt-3 px-2">
                        {data && (
                          <span className="f-w-500">
                            <div>
                              <h2 className="f-14 d-inline-flex mb-0">{"Total Market Cap"}</h2>{": "}
                              <span className="font-secondary f-w-400">
                                {currencyData && currencyData.symbol}
                                {numberOptimizeDecimal(numeral(_.sum(data.filter(d => d.market_cap >= 0).map(d => d.market_cap))).format('0,0'))}
                                {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                              </span>
                            </div>
                            <div>
                              <h2 className="f-14 d-inline-flex mb-0">{"Total Volume"}</h2>{": "}
                              <span className={`font-secondary f-w-400${width <= 575 ? ' d-flex' : ''}`}>
                                {currencyData && currencyData.symbol}
                                {numberOptimizeDecimal(numeral(_.sum(data.filter(d => d.total_volume >= 0).map(d => d.total_volume))).format('0,0'))}
                                {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
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
                                  <Link to={`/coin${d.id ? `/${d.id}` : 's/high-volume'}`}>
                                    {d.image && (<img className="align-self-top img-fluid img-30 mr-3" src={d.image} alt={!d.image.startsWith('missing_') ? d.name : ''} />)}
                                  </Link>
                                  <div className="media-body">
                                    <h2 className="f-16 d-flex align-items-center">
                                      <Link to={`/coin${d.id ? `/${d.id}` : 's/high-volume'}`} style={{ color: 'unset' }}>
                                        {d.name}
                                        {d.symbol && (<div className="f-10 text-info mt-1">{d.symbol.toUpperCase()}</div>)}
                                      </Link>
                                      {typeof d.market_cap_rank === 'number' && (<span className="ml-auto"><Tooltip title="Market Cap Rank">{"#"}{numeral(d.market_cap_rank).format('0,0')}</Tooltip></span>)}
                                    </h2>
                                    <div className="mt-2 pt-1">
                                      <div className="f-w-500 font-primary">{"Price"}</div>
                                      <Row className="mt-1">
                                        <Col xs="7" className="f-16">
                                          {typeof d.current_price === 'number' && d.current_price >= 0 ?
                                            <>
                                              {currencyData && currencyData.symbol}
                                              {numberOptimizeDecimal(numeral(d.current_price).format(d.current_price > 1 ? '0,0.00' : '0,0.0000000000'))}
                                              {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                            </>
                                            :
                                            'N/A'
                                          }
                                          {typeof d.low_24h === 'number' && typeof d.high_24h === 'number' && (
                                            <div className="f-10 text-info">
                                              {"Low:"}&nbsp;{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(d.low_24h).format(d.low_24h > 1 ? '0,0.00' : '0,0.0000000000'))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                              <br />
                                              {"High:"}&nbsp;{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(d.high_24h).format(d.high_24h > 1 ? '0,0.00' : '0,0.0000000000'))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                            </div>
                                          )}
                                        </Col>
                                        <Col xs="5" className={`f-16 ${d.price_change_percentage_24h_in_currency > 0 ? 'font-success' : d.price_change_percentage_24h_in_currency < 0 ? 'font-danger' : ''}`}>
                                          {typeof d.price_change_percentage_24h_in_currency === 'number' ? numberOptimizeDecimal(numeral(d.price_change_percentage_24h_in_currency / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(d.price_change_percentage_24h_in_currency / 100).format('+0,0.00%')) : '-'}
                                        </Col>
                                      </Row>
                                    </div>
                                    <div className="mt-2 pt-1">
                                      <Row>
                                        <Col xs="6" className="f-16" style={{ borderRight: '1px solid #dedede' }}>
                                          {typeof d.atl === 'number' && d.atl >= 0 ?
                                            <>
                                              {currencyData && currencyData.symbol}
                                              {numberOptimizeDecimal(numeral(d.atl).format(d.atl > 1 ? '0,0.00' : '0,0.000000'))}
                                              {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                            </>
                                            :
                                            'N/A'
                                          }
                                          <div className="f-12 text-info">{"All Time Low"}</div>
                                        </Col>
                                        <Col xs="6" className="f-16">
                                          {typeof d.ath === 'number' && d.ath >= 0 ?
                                            <>
                                              {currencyData && currencyData.symbol}
                                              {numberOptimizeDecimal(numeral(d.ath).format(d.ath > 1 ? '0,0.00' : '0,0.000000'))}
                                              {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                            </>
                                            :
                                            'N/A'
                                          }
                                          <div className="f-12 text-info">{"All Time High"}</div>
                                        </Col>
                                      </Row>
                                    </div>
                                    <div className="mt-2 pt-1">
                                      <div className="f-w-500 font-primary d-flex align-items-center">{"Market Cap"}</div>
                                      <h3 className="f-14 mt-1 mb-0">
                                        {typeof d.market_cap === 'number' && d.market_cap > 0 ?
                                          <>
                                            {currencyData && currencyData.symbol}
                                            {numberOptimizeDecimal(numeral(Number(d.market_cap)).format(Number(d.market_cap) > 1 ? '0,0' : '0,0.00'))}
                                            {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                          </>
                                          :
                                          'N/A'
                                        }
                                      </h3>
                                    </div>
                                    <div className="mt-2 pt-1">
                                      <div className="f-w-500 font-primary d-flex align-items-center">{"Volume"}<Badge color="light" pill className="f-10 text-secondary f-w-300 ml-2">24h</Badge></div>
                                      <h3 className="f-14 mt-1 mb-0">
                                        {typeof d.total_volume === 'number' && d.total_volume >= 0 ?
                                          <>
                                            {currencyData && currencyData.symbol}
                                            {numberOptimizeDecimal(numeral(Number(d.total_volume)).format(Number(d.total_volume) > 1 ? '0,0' : '0,0.00'))}
                                            {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                          </>
                                          :
                                          'N/A'
                                        }
                                      </h3>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                        :
                        <div className="markets-table table-align-top responsive-tbl mt-3">
                          <div className="table-responsive">
                            <Table borderless>
                              <thead>
                                <tr>
                                  <th
                                    onClick={() => setMarketSort({ field: 'rank', direction: (!marketSort.field || marketSort.field === 'rank') && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    style={{ minWidth: '3rem', cursor: 'pointer' }}
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
                                    onClick={() => setMarketSort({ field: 'name', direction: marketSort.field === 'name' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`${marketSort.field === 'name' ? 'bg-light' : ''}`}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {"Coin"}
                                    {marketSort.field === 'name' && (
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
                                    onClick={() => setMarketSort({ field: 'current_price', direction: marketSort.field === 'current_price' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`text-right ${marketSort.field === 'current_price' ? 'bg-light' : ''}`}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {"Price"}
                                    {marketSort.field === 'current_price' && (
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
                                    onClick={() => setMarketSort({ field: 'price_change_percentage_1h_in_currency', direction: marketSort.field === 'price_change_percentage_1h_in_currency' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`text-right ${marketSort.field === 'price_change_percentage_1h_in_currency' ? 'bg-light' : ''}`}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <div className="d-flex align-items-center justify-content-end">
                                      <Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">1h</Badge>
                                      {marketSort.field === 'price_change_percentage_1h_in_currency' && (
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
                                  <th
                                    onClick={() => setMarketSort({ field: 'price_change_percentage_24h_in_currency', direction: marketSort.field === 'price_change_percentage_24h_in_currency' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`text-right ${marketSort.field === 'price_change_percentage_24h_in_currency' ? 'bg-light' : ''}`}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <div className="d-flex align-items-center justify-content-end">
                                      <Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">24h</Badge>
                                      {marketSort.field === 'price_change_percentage_24h_in_currency' && (
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
                                  <th
                                    onClick={() => setMarketSort({ field: 'price_change_percentage_7d_in_currency', direction: marketSort.field === 'price_change_percentage_7d_in_currency' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`text-right ${marketSort.field === 'price_change_percentage_7d_in_currency' ? 'bg-light' : ''}`}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <div className="d-flex align-items-center justify-content-end">
                                      <Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">7d</Badge>
                                      {marketSort.field === 'price_change_percentage_7d_in_currency' && (
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
                                  <th
                                    onClick={() => setMarketSort({ field: 'price_change_percentage_30d_in_currency', direction: marketSort.field === 'price_change_percentage_30d_in_currency' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`text-right ${marketSort.field === 'price_change_percentage_30d_in_currency' ? 'bg-light' : ''}`}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <div className="d-flex align-items-center justify-content-end">
                                      <Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">30d</Badge>
                                      {marketSort.field === 'price_change_percentage_30d_in_currency' && (
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
                                  <th className="text-right" style={{ minWidth: '10rem' }}>{"History"}</th>
                                  <th
                                    onClick={() => setMarketSort({ field: 'total_volume', direction: marketSort.field === 'total_volume' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`${marketSort.field === 'total_volume' ? 'bg-light' : ''}`}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <div className="d-flex align-items-center justify-content-end">
                                      {"Volume"}
                                      <Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">24h</Badge>
                                      {marketSort.field === 'total_volume' && (
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
                                  <th
                                    onClick={() => setMarketSort({ field: 'market_cap', direction: marketSort.field === 'market_cap' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`text-right ${marketSort.field === 'market_cap' ? 'bg-light' : ''}`}
                                    style={{ minWidth: '8rem', cursor: 'pointer' }}
                                  >
                                    {"Market Cap"}
                                    {marketSort.field === 'market_cap' && (
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
                                    onClick={() => setMarketSort({ field: 'fully_diluted_valuation', direction: marketSort.field === 'fully_diluted_valuation' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`text-right ${marketSort.field === 'fully_diluted_valuation' ? 'bg-light' : ''}`}
                                    style={{ minWidth: '8rem', cursor: 'pointer' }}
                                  >
                                    {"Fully Diluted"}
                                    {marketSort.field === 'fully_diluted_valuation' && (
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
                                    onClick={() => setMarketSort({ field: 'circulating_supply', direction: marketSort.field === 'circulating_supply' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`text-right ${marketSort.field === 'circulating_supply' ? 'bg-light' : ''}`}
                                    style={{ minWidth: '10rem', cursor: 'pointer' }}
                                  >
                                    {"Circulating Supply"}
                                    {marketSort.field === 'circulating_supply' && (
                                      <>
                                        {marketSort.direction === 'desc' ?
                                          <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                          :
                                          <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                        }
                                      </>
                                    )}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {sortedData.filter((d, i) => i >= tablePage * pageSize && i < (tablePage + 1) * pageSize).map((d, i) => (
                                  <tr key={i}>
                                    <td>{d.rank + 1}</td>
                                    <td className={`f-w-500 ${marketSort.field === 'name' ? 'bg-light' : ''}`}>
                                      <Link to={`/coin${d.id ? `/${d.id}` : 's/high-volume'}`}>
                                        <div className="d-flex">
                                          {d.image && (
                                            <span className="avatar mr-2">
                                              <Media body className="img-20" src={d.image} alt={!d.image.startsWith('missing_') ? d.name : ''} />
                                            </span>
                                          )}
                                          <span>{d.name}</span>
                                        </div>
                                        {d.symbol && (<div className="f-10 text-info ml-4 pl-1">{d.symbol.toUpperCase()}</div>)}
                                      </Link>
                                    </td>
                                    <td className={`text-right ${marketSort.field === 'current_price' ? 'bg-light' : ''}`}>
                                      {typeof d.current_price === 'number' && d.current_price >= 0 ?
                                        <>
                                          {currencyData && currencyData.symbol}
                                          {numberOptimizeDecimal(numeral(d.current_price).format(d.current_price > 1 ? '0,0.00' : '0,0.0000000000'))}
                                          {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                        </>
                                        :
                                        'N/A'
                                      }
                                      {typeof d.low_24h === 'number' && typeof d.high_24h === 'number' && (
                                        <div className="f-10 text-info">
                                          {"Low:"}&nbsp;{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(d.low_24h).format(d.low_24h > 1 ? '0,0.00' : '0,0.0000000000'))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                          <br />
                                          {"High:"}&nbsp;{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(d.high_24h).format(d.high_24h > 1 ? '0,0.00' : '0,0.0000000000'))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                        </div>
                                      )}
                                    </td>
                                    <td className={`text-right ${marketSort.field === 'price_change_percentage_1h_in_currency' ? 'bg-light' : ''} ${d.price_change_percentage_1h_in_currency > 0 ? 'font-success' : d.price_change_percentage_1h_in_currency < 0 ? 'font-danger' : ''}`}>{typeof d.price_change_percentage_1h_in_currency === 'number' && d.price_change_percentage_1h_in_currency !== 0 ? numberOptimizeDecimal(numeral(d.price_change_percentage_1h_in_currency / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(d.price_change_percentage_1h_in_currency / 100).format('+0,0.00%')) : '-'}</td>
                                    <td className={`text-right ${marketSort.field === 'price_change_percentage_24h_in_currency' ? 'bg-light' : ''} ${d.price_change_percentage_24h_in_currency > 0 ? 'font-success' : d.price_change_percentage_24h_in_currency < 0 ? 'font-danger' : ''}`}>{typeof d.price_change_percentage_24h_in_currency === 'number' && d.price_change_percentage_24h_in_currency !== 0 ? numberOptimizeDecimal(numeral(d.price_change_percentage_24h_in_currency / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(d.price_change_percentage_24h_in_currency / 100).format('+0,0.00%')) : '-'}</td>
                                    <td className={`text-right ${marketSort.field === 'price_change_percentage_7d_in_currency' ? 'bg-light' : ''} ${d.price_change_percentage_7d_in_currency > 0 ? 'font-success' : d.price_change_percentage_7d_in_currency < 0 ? 'font-danger' : ''}`}>{typeof d.price_change_percentage_7d_in_currency === 'number' && d.price_change_percentage_7d_in_currency !== 0 ? numberOptimizeDecimal(numeral(d.price_change_percentage_7d_in_currency / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(d.price_change_percentage_7d_in_currency / 100).format('+0,0.00%')) : '-'}</td>
                                    <td className={`text-right ${marketSort.field === 'price_change_percentage_30d_in_currency' ? 'bg-light' : ''} ${d.price_change_percentage_30d_in_currency > 0 ? 'font-success' : d.price_change_percentage_30d_in_currency < 0 ? 'font-danger' : ''}`}>{typeof d.price_change_percentage_30d_in_currency === 'number' && d.price_change_percentage_30d_in_currency !== 0 ? numberOptimizeDecimal(numeral(d.price_change_percentage_30d_in_currency / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(d.price_change_percentage_30d_in_currency / 100).format('+0,0.00%')) : '-'}</td>
                                    <td className="text-right">
                                      <div className="f-10"><span className="text-info">{"ATL: "}</span>{currencyData && currencyData.symbol}{typeof d.atl === 'number' && d.atl >= 0 ? numberOptimizeDecimal(numeral(d.atl).format(d.atl > 1 ? '0,0.00' : '0,0.00000000')) : 'N/A'}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</div>
                                      <div className="f-10"><span className="text-info">{"ATH: "}</span>{currencyData && currencyData.symbol}{typeof d.ath === 'number' && d.ath >= 0 ? numberOptimizeDecimal(numeral(d.ath).format(d.ath > 1 ? '0,0.00' : '0,0.00000000')) : 'N/A'}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</div>
                                      {d.roi && typeof d.roi.percentage === 'number' && (<div className="f-10 text-info">{"ROI"}{d.roi.currency && (<>&nbsp;({d.roi.currency.toUpperCase()})</>)}{": "}<span className={`${d.roi.percentage > 0 ? 'font-success' : d.roi.percentage < 0 ? 'font-danger' : ''}`}>{numberOptimizeDecimal(numeral(d.roi.percentage / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(d.roi.percentage / 100).format('+0,0.00%'))}</span></div>)}
                                    </td>
                                    <td className={`text-right ${marketSort.field === 'total_volume' ? 'bg-light' : ''}`}>
                                      {typeof d.total_volume === 'number' && d.total_volume >= 0 ?
                                        <>
                                          {currencyData && currencyData.symbol}
                                          {numberOptimizeDecimal(numeral(Number(d.total_volume)).format(Number(d.total_volume) > 1 ? '0,0' : '0,0.00'))}
                                          {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                        </>
                                        :
                                        'N/A'
                                      }
                                    </td>
                                    <td className={`text-right ${marketSort.field === 'market_cap' ? 'bg-light' : ''}`}>
                                      {typeof d.market_cap === 'number' && d.market_cap > 0 ?
                                        <>
                                          {currencyData && currencyData.symbol}
                                          {numberOptimizeDecimal(numeral(Number(d.market_cap)).format(Number(d.market_cap) > 1 ? '0,0' : '0,0.00'))}
                                          {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                        </>
                                        :
                                        'N/A'
                                      }
                                      {typeof d.market_cap_change_percentage_24h === 'number' && d.market_cap > 0 && (<div className={`f-10 ${d.market_cap_change_percentage_24h > 0 ? 'font-success' : d.market_cap_change_percentage_24h < 0 ? 'font-danger' : ''}`}>{numberOptimizeDecimal(numeral(d.market_cap_change_percentage_24h / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(d.market_cap_change_percentage_24h / 100).format('+0,0.00%'))}</div>)}
                                    </td>
                                    <td className={`text-right ${marketSort.field === 'fully_diluted_valuation' ? 'bg-light' : ''}`}>
                                      {typeof d.fully_diluted_valuation === 'number' && d.fully_diluted_valuation >= 0 ?
                                        <>
                                          {currencyData && currencyData.symbol}
                                          {numberOptimizeDecimal(numeral(Number(d.fully_diluted_valuation)).format(Number(d.fully_diluted_valuation) > 1 ? '0,0' : '0,0.00'))}
                                          {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                        </>
                                        :
                                        '-'
                                      }
                                    </td>
                                    <td className={`text-right ${marketSort.field === 'circulating_supply' ? 'bg-light' : ''}`}>
                                      {typeof d.circulating_supply === 'number' && d.circulating_supply > 0 ? numberOptimizeDecimal(numeral(Number(d.circulating_supply)).format('0,0')) : 'N/A'}
                                      {d.symbol && (<>&nbsp;{d.symbol.toUpperCase()}</>)}
                                      {typeof d.fully_diluted_valuation === 'number' && d.fully_diluted_valuation >= 0 && typeof d.max_supply === 'number' && (<div className="f-10 text-info">{"Max: "}{numberOptimizeDecimal(numeral(Number(d.max_supply)).format('0,0'))}</div>)}
                                      {!(typeof d.fully_diluted_valuation === 'number' && d.fully_diluted_valuation >= 0) && typeof d.total_supply === 'number' && (<div className="f-10 text-info">{"Total: "}{numberOptimizeDecimal(numeral(Number(d.total_supply)).format('0,0'))}</div>)}
                                    </td>
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

export default Category;
