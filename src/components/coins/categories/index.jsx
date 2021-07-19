import React, { Fragment, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, CardHeader, CardBody, Media, Badge, Input, Nav, NavItem, NavLink, Table, Button } from 'reactstrap';
import { Tooltip } from 'antd';
import { Grid, List, ChevronDown, ChevronUp, Search } from 'react-feather';
import _ from 'lodash';
import moment from 'moment';
import numeral from 'numeral';
import Spinner from '../../spinner';
import Error404 from '../../../pages/errors/error404';
import { menus, currenciesGroups } from '../../../layout/header/menus';
import { getCategoriesMarkets } from '../../../api';
import { useIsMountedRef, sleep, numberOptimizeDecimal } from '../../../utils';

const Categories = props => {
  const currency = 'usd';
  const pageSize = 50;
  const isMountedRef = useIsMountedRef();

  const [data, setData] = useState([]);
  const [displayTypeSelected, setDisplayTypeSelected] = useState('table');
  const [marketSort, setMarketSort] = useState({ field: null, direction: 'asc' });
  const [marketPage, setMarketPage] = useState(0);
  const [marketPageEnd, setMarketPageEnd] = useState(false);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketSearch, setMarketSearch] = useState('');

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
    const getData = async lastPageOnly => {
      if (isMountedRef.current) {
        setMarketLoading(true);
      }
      const newData = data ? data : [];
      let size = 0;
      for (let i = 0; i <= marketPage; i++) {
        try {
          if (!lastPageOnly || i === marketPage || i <= 1) {
            await sleep(i === 0 ? 0 : 500);
            let categoriesData = await getCategoriesMarkets({ vs_currency: currency, order: 'market_cap_desc', per_page: pageSize, page: i + 1, market_cap_change_percentage: '1h,24h,7d,30d' });
            categoriesData = categoriesData && !categoriesData.error ? categoriesData : null;
            if (categoriesData) {
              for (let j = 0; j < categoriesData.length; j++) {
                newData[size] = categoriesData[j];
                size++;
              }
              if (categoriesData.length < pageSize) {
                if (isMountedRef.current) {
                  setMarketPageEnd(true);
                }
                break;
              }
            }
          }
          else {
            size += pageSize;
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
    };
    getData(true);
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, currency, data, marketPage]);

  const currencyData = _.head(_.uniq(currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === currency), 'id'));

  const filteredData = data && data.map((d, i) => {
    d.rank = i;
    return d;
  }).filter((d, i) => (i < (marketPage + (marketPage < 0 ? 2 : 1)) * (marketPage < 0 ? 10 : pageSize)) && (!marketSearch || (d.name && d.name.toLowerCase().indexOf(marketSearch.toLowerCase()) > -1) || (d.symbol && d.symbol.toLowerCase().indexOf(marketSearch.toLowerCase()) > -1)));
  const sortedData = _.orderBy(filteredData, [marketSort.field || 'rank'], [marketSort.direction]);

  return (
    <Fragment>
      <Container fluid={true}>
        <Row>
          <Col xs="12">
            <Card className="bg-transparent border-0" style={{ boxShadow: 'none' }}>
              <CardHeader className="bg-transparent pt-2 pb-4 px-0">
                <Row className="px-0 px-lg-3 mx-0 mx-lg-1">
                  <Col xl="4" lg="4" md="4" xs="12">
                    <Nav className="nav-pills nav-primary d-flex align-items-center">
                      {menus[0].subMenu[0][0].subMenu.map((m, key) => (
                        <NavItem key={key} style={{ maxWidth: width <= 575 ? 'fit-content' : '' }}>
                          <div className={`nav-link${m.path === '/coins/categories' ? ' active' : ''}${width <= 991 ? ' f-12 p-2' : ''}`}>
                            <Link to={m.path} style={{ color: 'unset' }}>
                              {m.title}
                            </Link>
                          </div>
                        </NavItem>
                      ))}
                    </Nav>
                  </Col>
                  <Col xl="6" lg="6" md="6" xs="8" className={`mt-3 mt-md-0 d-flex align-items-top ${width <= 575 ? '' : 'justify-content-center'}`}>
                    <h1 className="mb-0">
                      <div className={`${width <= 575 ? 'f-14' : width <= 991 ? 'f-18' : 'f-24'} mb-2`} style={{ lineHeight: '1.25' }}>{"Top Cryptocurrency Categories"}</div>
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
              <CardBody className={`pt-3 pb-2 px-0 px-lg-${displayTypeSelected === 'card' ? 4 : 5}`}>
                {!data ?
                  <Error404 />
                  :
                  data.length > 0 ?
                    <>
                      <div ref={tableRef} className="p-absolute" style={{ marginTop: width <= 345 ? '-138px' : width <= 575 ? '-116px' : width <= 907 ? '-121px' : width <= 991 ? '-99px' : width <= 1200 ? '-119px' : '-81px' }} />
                      <div className="d-flex align-items-center pt-3 px-2">
                        {data ?
                          <>
                            <span className="f-w-500">
                              <div>
                                {"Total Market Cap: "}
                                <span className="font-secondary f-w-400">
                                  {currencyData && currencyData.symbol}
                                  {numberOptimizeDecimal(numeral(_.sum(data.filter(d => d.market_cap >= 0).map(d => d.market_cap))).format('0,0'))}
                                  {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                </span>
                              </div>
                              <div>
                                {"Total Volume: "}
                                <span className="font-secondary f-w-400">
                                  {currencyData && currencyData.symbol}
                                  {numberOptimizeDecimal(numeral(_.sum(data.filter(d => d.volume_24h >= 0).map(d => d.volume_24h))).format('0,0'))}
                                  {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                </span>
                              </div>
                            </span>
                          </>
                          :
                          null
                        }
                        <span className="d-flex align-items-center ml-auto"><Search /><Input type="text" value={marketSearch} onChange={e => setMarketSearch(e.target.value)} placeholder="Search" className="b-r-6 f-14 ml-2" style={{ maxWidth: 'max-content' }} /></span>
                      </div>
                      {displayTypeSelected === 'card' ?
                        <Row className="mt-3 px-2">
                          {filteredData.map((d, i) => (
                            <Col key={i} xl="3" lg="4" md="6" xs="12" className={`mt-${i < 4 ? width <= 767 ? i < 1 ? 2 : 4 : width <= 991 ? i < 2 ? 2 : 4 : width <= 1200 ? i < 3 ? 2 : 4 : i < 4 ? 2 : 4 : 4}`}>
                              <Card className="mb-0 p-3" style={{ boxShadow: 'none' }}>
                                <div className="media">
                                  <Link to={`/coins${d.id ? `/${d.id}` : ''}`}>
                                    {d.image && (<img className="align-self-top img-fluid img-30 mr-3" src={d.image} alt={!d.image.startsWith('missing_') ? d.name : ''} />)}
                                  </Link>
                                  <div className="media-body">
                                    <h2 className="f-16 d-flex align-items-center">
                                      <Link to={`/coins${d.id ? `/${d.id}` : ''}`} style={{ color: 'unset' }}>
                                        {d.name}
                                        {d.symbol && (<div className="f-10 text-info mt-1">{d.symbol.toUpperCase()}</div>)}
                                      </Link>
                                      {typeof d.rank === 'number' && (<span className="ml-auto"><Tooltip title="Rank">{"#"}{numeral(d.rank + 1).format('0,0')}</Tooltip></span>)}
                                    </h2>
                                    <div className="mt-2 pt-1">
                                      <div className="f-w-500 font-primary d-flex align-items-center">{"Market Cap"}</div>
                                      <Row className="mt-1">
                                        <Col xs="7" className="f-14 mt-1 mb-0">
                                          {typeof d.market_cap === 'number' && d.market_cap > 0 ?
                                            <>
                                              {currencyData && currencyData.symbol}
                                              {numberOptimizeDecimal(numeral(Number(d.market_cap)).format(Number(d.market_cap) > 1 ? '0,0' : '0,0.00'))}
                                              {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                            </>
                                            :
                                            'N/A'
                                          }
                                        </Col>
                                        <Col xs="5" className={`f-16 ${d.market_cap_change_24h > 0 ? 'font-success' : d.market_cap_change_24h < 0 ? 'font-danger' : ''}`}>
                                          {typeof d.market_cap_change_24h === 'number' ? numberOptimizeDecimal(numeral(d.market_cap_change_24h / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(d.market_cap_change_24h / 100).format('+0,0.00%')) : '-'}
                                        </Col>
                                      </Row>
                                    </div>
                                    <div className="mt-2 pt-1">
                                      <div className="f-w-500 font-primary d-flex align-items-center">{"Volume"}<Badge color="light" pill className="f-10 text-secondary f-w-300 ml-2">24h</Badge></div>
                                      <h3 className="f-14 mt-1 mb-0">
                                        {typeof d.volume_24h === 'number' && d.volume_24h >= 0 ?
                                          <>
                                            {currencyData && currencyData.symbol}
                                            {numberOptimizeDecimal(numeral(Number(d.volume_24h)).format(Number(d.volume_24h) > 1 ? '0,0' : '0,0.00'))}
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
                                    {"Category"}
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
                                    onClick={() => setMarketSort({ field: 'market_cap_change_24h', direction: marketSort.field === 'market_cap_change_24h' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`text-right ${marketSort.field === 'market_cap_change_24h' ? 'bg-light' : ''}`}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <div className="d-flex align-items-center justify-content-end">
                                      {"% Change"}
                                      <Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">24h</Badge>
                                      {marketSort.field === 'market_cap_change_24h' && (
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
                                  <th
                                    onClick={() => setMarketSort({ field: 'updated_at', direction: marketSort.field === 'updated_at' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`text-right ${marketSort.field === 'updated_at' ? 'bg-light' : ''}`}
                                    style={{ minWidth: '7rem', cursor: 'pointer' }}
                                  >
                                    {"Updated"}
                                    {marketSort.field === 'updated_at' && (
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
                                {sortedData.map((d, i) => (
                                  <tr key={i}>
                                    <td>{d.rank + 1}</td>
                                    <td className={`f-w-500 ${marketSort.field === 'name' ? 'bg-light' : ''}`}>
                                      <Link to={`/coins${d.id ? `/${d.id}` : ''}`}>
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
                                    </td>
                                    <td className={`text-right ${marketSort.field === 'market_cap_change_24h' ? 'bg-light' : ''} ${d.market_cap_change_24h > 0 ? 'font-success' : d.market_cap_change_24h < 0 ? 'font-danger' : ''}`}>{typeof d.market_cap_change_24h === 'number' && d.market_cap_change_24h !== 0 ? numberOptimizeDecimal(numeral(d.market_cap_change_24h / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(d.market_cap_change_24h / 100).format('+0,0.00%')) : '-'}</td>
                                    <td className={`text-right ${marketSort.field === 'volume_24h' ? 'bg-light' : ''}`}>
                                      {typeof d.volume_24h === 'number' && d.volume_24h >= 0 ?
                                        <>
                                          {currencyData && currencyData.symbol}
                                          {numberOptimizeDecimal(numeral(Number(d.volume_24h)).format(Number(d.volume_24h) > 1 ? '0,0' : '0,0.00'))}
                                          {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                        </>
                                        :
                                        'N/A'
                                      }
                                    </td>
                                    <td className={`font-roboto f-w-300 text-secondary text-right ${marketSort.field === 'updated_at' ? 'bg-light' : ''}`}>{moment(d.updated_at).fromNow()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        </div>
                      }
                      {data.length % pageSize === 0 && !marketPageEnd && (<div className="text-center mt-3"><Button color="primary-2x" outline disabled={marketLoading} onClick={() => setMarketPage(marketPage + 1)}>{marketLoading ? 'Loading...' : 'See more'}</Button></div>)}
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

export default Categories;
