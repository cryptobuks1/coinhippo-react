import React, { Fragment, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ALL_CRYPTO_DATA } from '../../redux/types';
import { Container, Row, Col, Card, CardHeader, CardBody, Media, Input, Nav, NavItem, NavLink, Table, Button, Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import { Tooltip } from 'antd';
import { Grid, List, ChevronDown, ChevronUp, Search } from 'react-feather';
import _ from 'lodash';
import numeral from 'numeral';
import Spinner from '../spinner';
import Error404 from '../../pages/errors/error404';
import { currenciesGroups } from '../../layout/header/menus';
import { getPublicCompanies } from '../../api';
import { useIsMountedRef, sleep, getName, numberOptimizeDecimal } from '../../utils';

const PublicCompanies = props => {
  const pageSize = 100;
  const coinId = props.match ? props.match.params.coin_id.toLowerCase() : null;
  const isMountedRef = useIsMountedRef();
  const [data, setData] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [displayTypeSelected, setDisplayTypeSelected] = useState('table');
  const currency = 'usd';
  const allCryptoData = useSelector(content => content.Data[ALL_CRYPTO_DATA]);
  const [marketSort, setMarketSort] = useState({ field: null, direction: 'asc' });
  const [marketPage, setMarketPage] = useState(19);
  const [marketPageEnd, setMarketPageEnd] = useState(false);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketSearch, setMarketSearch] = useState('');
  const [redirectPath, setRedirectPath] = useState(null);
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
      if (coinId) {
        if (isMountedRef.current) {
          setMarketLoading(true);
        }
        const newData = data ? data : [];
        let size = 0;
        for (let i = 0; i <= marketPage; i++) {
          try {
            await sleep(500);
            let companiesData = await getPublicCompanies(coinId);
            if (companiesData && !companiesData.error) {
              setStatsData({ ...companiesData });
            }
            companiesData = companiesData && !companiesData.error && companiesData.companies ? companiesData.companies : null;
            if (companiesData) {
              for (let j = 0; j < companiesData.length; j++) {
                newData[size] = companiesData[j];
                size++;
              }
              if (companiesData.length < (pageSize / 2)) {
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
  }, [isMountedRef, coinId, currency, data, marketPage]);

  if (redirectPath) {
    if (window.location && window.location.pathname === redirectPath) {
      setRedirectPath(null);
    }
    return (<Redirect to={redirectPath} />);
  }
  const coinData = allCryptoData && allCryptoData.coins && _.head(allCryptoData.coins.filter(c => c.id === coinId));
  const currencyData = _.head(_.uniq(currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === currency), 'id'));
  const filteredData = data && _.orderBy(data.filter(d => d), ['total_holdings'], ['desc']).map((d, i) => {
    d.rank = i;
    return d;
  }).filter((d, i) => /*(i < (marketPage + (marketPage < 0 ? 2 : 1)) * (marketPage < 0 ? 10 : pageSize)) && */(!marketSearch || (d.name && d.name.toLowerCase().indexOf(marketSearch.toLowerCase()) > -1) || (d.symbol && d.symbol.toLowerCase().indexOf(marketSearch.toLowerCase()) > -1)));
  const sortedData = _.orderBy(filteredData, [marketSort.field || 'rank'], [marketSort.direction]);
  const statsComponent = statsData && (
    <Row className="w-100 f-w-500">
      <Col lg="4" md="4" xs="12" className="mt-3 mt-lg-0">
        <div className="d-flex align-items-center">
          <Link to={`/coin${coinData && coinData.id ? `/${coinData.id}` : '/s'}`}>
            {coinData && coinData.large && (
              <span className="avatar">
                <Media body className="img-20" src={coinData.large} alt={!coinData.large.startsWith('missing_') ? coinData.name : ''} />
              </span>
            )}
          </Link>
          &nbsp;{"Total Holdings"}
        </div>
        <div className="f-w-300 text-info ml-4">
          {statsData.total_holdings > 0 ?
            <>
              {numberOptimizeDecimal(numeral(Number(statsData.total_holdings)).format(Number(statsData.total_holdings) > 1 ? '0,0' : '0,0.00'))}
              {coinData && coinData.symbol && (<> {coinData.symbol.toUpperCase()}</>)}
            </>
            :
            'N/A'
          }
        </div>
      </Col>
      <Col lg="4" md="4" xs="12" className="mt-3 mt-lg-0">
        <div className="d-flex align-items-center">
          {"Total Value"}
        </div>
        <div className="f-w-300 text-info">
          {statsData.total_value_usd > 0 ?
            <>
              {currencyData && currencyData.symbol}
              {numberOptimizeDecimal(numeral(Number(statsData.total_value_usd)).format(Number(statsData.total_value_usd) > 1 ? '0,0' : '0,0.00'))}
              {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
            </>
            :
            'N/A'
          }
        </div>
      </Col>
      <Col lg="4" md="4" xs="12" className="mt-3 mt-lg-0">
        <div className="d-flex align-items-center">
          {"Dominance"}
        </div>
        <div className="f-w-300 text-info">
          {statsData.market_cap_dominance > 0 ?
            `${statsData.market_cap_dominance}%`
            :
            'N/A'
          }
        </div>
      </Col>
    </Row>
  );
  return (
    <Fragment>
      <Container fluid={true}>
        <Row>
          <Col xs="12">
            <Card className="bg-transparent border-0" style={{ boxShadow: 'none' }}>
              <CardHeader className="bg-transparent pt-2 pb-4 px-0">
                <Row className="px-0 px-lg-3 mx-0 mx-lg-1">
                  <Col xl="3" lg="3" md="12" xs="12">
                  </Col>
                  <Col xl="6" lg="6" md="9" xs="8" className={`mt-3 mt-md-0 d-flex align-items-top ${width <= 575 ? '' : 'justify-content-center'}`}>
                    <h1 className="text-center mb-0">
                      <div className={`${width <= 575 ? 'f-14' : width <= 991 ? 'f-18' : width <= 1200 ? 'f-16' : 'f-24'} d-flex align-items-center justify-content-center mb-2`} style={{ lineHeight: '1.25' }}>
                        {coinData && coinData.large && (
                          <span className="avatar mr-2">
                            <Media body className="img-30" src={coinData.large} alt={!coinData.large.startsWith('missing_') ? coinData.name : ''} />
                          </span>
                        )}
                        <span>{`${coinData && coinData.name} Holdings by Public Companies`}</span>
                      </div>
                      <div className={`f-w-300 text-info f-${width <= 575 ? 10 : 14} text-${width <= 575 ? 'left mt-2' : 'center'}`} style={{ lineHeight: 1.5 }}>{`Track publicly traded companies that are buying ${coinData && coinData.name} as part of corporate treasury`}</div>
                    </h1>
                  </Col>
                  <Col xl="3" lg="3" md="3" xs="4" className="mt-3 mt-md-0">
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
                {width <= 1200 && (<div className="mt-0 mt-lg-3 px-2 px-lg-3 mx-0 mx-lg-3">{statsComponent}</div>)}
              </CardHeader>
              <CardBody className="pt-3 pb-2 px-0 px-lg-4">
                {!data ?
                  <Error404 />
                  :
                  data.length > 0 || marketPageEnd ?
                    <>
                      <div ref={tableRef} className="p-absolute" style={{ marginTop: width <= 345 ? '-138px' : width <= 575 ? '-116px' : width <= 907 ? '-121px' : width <= 991 ? '-99px' : width <= 1200 ? '-119px' : '-81px' }} />
                      <div className="d-flex align-items-center pt-3 px-2">
                        {width > 1200 && statsComponent}
                        <span className="d-flex align-items-center ml-auto"><Search /><Input type="text" value={marketSearch} onChange={e => setMarketSearch(e.target.value)} placeholder="Search" className="b-r-6 f-14 ml-2" style={{ maxWidth: 'max-content' }} /></span>
                      </div>
                      {displayTypeSelected === 'card' ?
                        <Row className="mt-3 px-2">
                          {filteredData.filter((d, i) => i >= tablePage * pageSize && i < (tablePage + 1) * pageSize).map((d, i) => (
                            <Col key={i} xl="3" lg="4" md="6" xs="12" className={`mt-${i < 4 ? width <= 767 ? i < 1 ? 2 : 4 : width <= 991 ? i < 2 ? 2 : 4 : width <= 1200 ? i < 3 ? 2 : 4 : i < 4 ? 2 : 4 : 4}`}>
                              <Card className="mb-0 p-3" style={{ boxShadow: 'none' }}>
                                <div className="media">
                                  <div className="media-body">
                                    <h2 className="f-16 d-flex align-items-center">
                                      <div>
                                        {d.name}
                                        {d.symbol && (<div className="f-10 text-info mt-1">{d.symbol.toUpperCase()}</div>)}
                                      </div>
                                      <div className="ml-auto">
                                        {typeof d.rank === 'number' && (<div className="text-right"><Tooltip title="Rank">{"#"}{numeral(d.rank + 1).format('0,0')}</Tooltip></div>)}
                                        {d.country && (<div className="f-14 f-w-400 d-flex align-items-center justify-content-end">{getName(d.country, true)}<i className={`flag-icon flag-icon-${d.country.toLowerCase()} ml-1`} /></div>)}
                                      </div>
                                    </h2>
                                    <div className="mt-2 pt-1">
                                      <div className="f-w-500 font-primary d-flex align-items-center">{"Total Holdings"}</div>
                                      <Row className="mt-1">
                                        <Col xs="7" className="f-14 mt-1 mb-0">
                                          {typeof d.total_holdings === 'number' && d.total_holdings > 0 ?
                                            <>
                                              {numberOptimizeDecimal(numeral(Number(d.total_holdings)).format(Number(d.total_holdings) > 1 ? '0,0' : '0,0.00'))}
                                              {coinData && coinData.symbol && (<> {coinData.symbol.toUpperCase()}</>)}
                                            </>
                                            :
                                            'N/A'
                                          }
                                        </Col>
                                        <Col xs="5" className="f-12">
                                          {typeof d.percentage_of_total_supply === 'number' && d.percentage_of_total_supply > 0 ? `${d.percentage_of_total_supply}%` : '-'}
                                          <div className="f-10 text-info">{"Supply"}</div>
                                        </Col>
                                      </Row>
                                    </div>
                                    <div className="mt-2 pt-1">
                                      <div className="f-w-500 font-primary d-flex align-items-center">{"Entry Value"}</div>
                                      <h3 className="f-14 mt-1 mb-0">
                                        {typeof d.total_entry_value_usd === 'number' && d.total_entry_value_usd > 0 ?
                                          <>
                                            {currencyData && currencyData.symbol}
                                            {numberOptimizeDecimal(numeral(Number(d.total_entry_value_usd)).format(Number(d.total_entry_value_usd) > 1 ? '0,0' : '0,0.00'))}
                                            {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                          </>
                                          :
                                          'N/A'
                                        }
                                      </h3>
                                    </div>
                                    <div className="mt-2 pt-1">
                                      <div className="f-w-500 font-primary d-flex align-items-center">{"Current Value"}</div>
                                      <h3 className="f-14 mt-1 mb-0">
                                        {typeof d.total_current_value_usd === 'number' && d.total_current_value_usd > 0 ?
                                          <>
                                            {currencyData && currencyData.symbol}
                                            {numberOptimizeDecimal(numeral(Number(d.total_current_value_usd)).format(Number(d.total_current_value_usd) > 1 ? '0,0' : '0,0.00'))}
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
                                    {"Company"}
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
                                    onClick={() => setMarketSort({ field: 'country', direction: marketSort.field === 'country' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`${marketSort.field === 'country' ? 'bg-light' : ''}`}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {"Country"}
                                    {marketSort.field === 'country' && (
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
                                    onClick={() => setMarketSort({ field: 'total_holdings', direction: marketSort.field === 'total_holdings' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`text-right ${marketSort.field === 'total_holdings' ? 'bg-light' : ''}`}
                                    style={{ minWidth: '8rem', cursor: 'pointer' }}
                                  >
                                    {"Total Holdings"}
                                    {marketSort.field === 'total_holdings' && (
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
                                    onClick={() => setMarketSort({ field: 'total_entry_value_usd', direction: marketSort.field === 'total_entry_value_usd' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`text-right ${marketSort.field === 'total_entry_value_usd' ? 'bg-light' : ''}`}
                                    style={{ minWidth: '8rem', cursor: 'pointer' }}
                                  >
                                    {"Entry Value"}
                                    {marketSort.field === 'total_entry_value_usd' && (
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
                                    onClick={() => setMarketSort({ field: 'total_current_value_usd', direction: marketSort.field === 'total_current_value_usd' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`text-right ${marketSort.field === 'total_current_value_usd' ? 'bg-light' : ''}`}
                                    style={{ minWidth: '8rem', cursor: 'pointer' }}
                                  >
                                    {"Current Value"}
                                    {marketSort.field === 'total_current_value_usd' && (
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
                                    onClick={() => setMarketSort({ field: 'percentage_of_total_supply', direction: marketSort.field === 'percentage_of_total_supply' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`text-right ${marketSort.field === 'percentage_of_total_supply' ? 'bg-light' : ''}`}
                                    style={{ minWidth: '8rem', cursor: 'pointer' }}
                                  >
                                    {"% of Total Supply"}
                                    {marketSort.field === 'percentage_of_total_supply' && (
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
                                      <div className="d-flex">
                                        {d.image && (
                                          <span className="avatar mr-2">
                                            <Media body className="img-20" src={d.image} alt={!d.image.startsWith('missing_') ? d.name : ''} />
                                          </span>
                                        )}
                                        <span>{d.name}</span>
                                      </div>
                                      {d.symbol && (<div className={`f-10 text-info${d.image ? ' ml-4 pl-1' : ''}`}>{d.symbol.toUpperCase()}</div>)}
                                    </td>
                                    <td className={`${marketSort.field === 'country' ? 'bg-light' : ''}`}>
                                      {d.country ?
                                        <div className="d-flex align-items-center">{getName(d.country, true)}<i className={`flag-icon flag-icon-${d.country.toLowerCase()} ml-1`} /></div>
                                        :
                                        'N/A'
                                      }
                                    </td>
                                    <td className={`text-right ${marketSort.field === 'total_holdings' ? 'bg-light' : ''}`}>
                                      {typeof d.total_holdings === 'number' && d.total_holdings > 0 ?
                                        <>
                                          {numberOptimizeDecimal(numeral(Number(d.total_holdings)).format(Number(d.total_holdings) > 1 ? '0,0' : '0,0.00'))}
                                          {coinData && coinData.symbol && (<> {coinData.symbol.toUpperCase()}</>)}
                                        </>
                                        :
                                        'N/A'
                                      }
                                    </td>
                                    <td className={`text-right ${marketSort.field === 'total_entry_value_usd' ? 'bg-light' : ''}`}>
                                      {typeof d.total_entry_value_usd === 'number' && d.total_entry_value_usd > 0 ?
                                        <>
                                          {currencyData && currencyData.symbol}
                                          {numberOptimizeDecimal(numeral(Number(d.total_entry_value_usd)).format(Number(d.total_entry_value_usd) > 1 ? '0,0' : '0,0.00'))}
                                          {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                        </>
                                        :
                                        'N/A'
                                      }
                                    </td>
                                    <td className={`text-right ${marketSort.field === 'total_current_value_usd' ? 'bg-light' : ''}`}>
                                      {typeof d.total_current_value_usd === 'number' && d.total_current_value_usd > 0 ?
                                        <>
                                          {currencyData && currencyData.symbol}
                                          {numberOptimizeDecimal(numeral(Number(d.total_current_value_usd)).format(Number(d.total_current_value_usd) > 1 ? '0,0' : '0,0.00'))}
                                          {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                        </>
                                        :
                                        'N/A'
                                      }
                                    </td>
                                    <td className={`text-right ${marketSort.field === 'percentage_of_total_supply' ? 'bg-light' : ''}`}>
                                      {typeof d.percentage_of_total_supply === 'number' && d.percentage_of_total_supply > 0 ?
                                        `${d.percentage_of_total_supply}%`
                                        :
                                        'N/A'
                                      }
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

export default PublicCompanies;
