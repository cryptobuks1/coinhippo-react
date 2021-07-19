import React, { Fragment, useState, useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { VS_CURRENCY, EXCHANGE_RATES_DATA } from '../../../redux/types';
import { Container, Row, Col, Card, CardHeader, CardBody, Media, Badge, Input, Nav, NavItem, NavLink, Table, Button, Progress } from 'reactstrap';
import { Tooltip } from 'antd';
import SweetAlert from 'sweetalert2';
import { Grid, List, ChevronDown, ChevronUp, Search, Info, Briefcase } from 'react-feather';
import _ from 'lodash';
import numeral from 'numeral';
import Spinner from '../../spinner';
import Error404 from '../../../pages/errors/error404';
import { menus, currenciesGroups } from '../../../layout/header/menus';
import { getExchanges } from '../../../api';
import { useIsMountedRef, sleep, affiliateData, dex, numberOptimizeDecimal } from '../../../utils';

const DexExchanges = props => {
  const pageSize = 100;
  const isMountedRef = useIsMountedRef();
  const [data, setData] = useState([]);
  const [displayTypeSelected, setDisplayTypeSelected] = useState('table');
  const currency = useSelector(content => content.Preferences[VS_CURRENCY]);
  const exchangeRatesData = useSelector(content => content.Data[EXCHANGE_RATES_DATA]);
  const [marketSort, setMarketSort] = useState({ field: null, direction: 'asc' });
  const [marketPage, setMarketPage] = useState(19);
  const [marketPageEnd, setMarketPageEnd] = useState(false);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketSearch, setMarketSearch] = useState('');
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
      for (let i = 0; i <= marketPage; i++) {
        try {
          await sleep(i === 0 ? 0 : 500);
          let exchangesData = await getExchanges({ per_page: pageSize, page: i + 1 });
          exchangesData = exchangesData && !exchangesData.error ? exchangesData : null;
          if (exchangesData) {
            const filteredData = exchangesData.filter(d => dex.indexOf(d.id) > -1);
            for (let j = 0; j < filteredData.length; j++) {
              newData[size] = filteredData[j];
              size++;
            }
            if (exchangesData.length < pageSize) {
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
    };
    getData();
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, currency, data, marketPage]);

  const currencyData = _.head(_.uniq(currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === currency), 'id'));
  const currencyVolume = 'btc';
  const currencyVolumeData = _.head(_.uniq(currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === currencyVolume), 'id'));
  const filteredData = data && _.orderBy(data, ['trade_volume_24h_btc'], ['desc']).map((d, i) => {
    d.rank = i;
    d.trade_volume_24h_btc = !isNaN(d.trade_volume_24h_btc) && typeof d.trade_volume_24h_btc === 'string' ? Number(d.trade_volume_24h_btc) : d.trade_volume_24h_btc;
    d.market_share_percentage = typeof d.trade_volume_24h_btc === 'number' ? d.trade_volume_24h_btc / _.sum(data.map(d => Number(d.trade_volume_24h_btc))) : null;
    return d;
  }).filter((d, i) => (i < (marketPage + (marketPage < 0 ? 2 : 1)) * (marketPage < 0 ? 10 : pageSize)) && (!marketSearch || (d.name && d.name.toLowerCase().indexOf(marketSearch.toLowerCase()) > -1)));
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
                      {menus[1].subMenu.map((m, key) => (
                        <NavItem key={key} style={{ maxWidth: width <= 575 ? 'fit-content' : '' }}>
                          <div className={`nav-link${m.path === '/exchanges/dex' ? ' active' : ''}${width <= 991 ? ' f-12 p-2' : ''}`}>
                            <Link to={m.path} style={{ color: 'unset' }}>
                              {m.title}
                            </Link>
                          </div>
                        </NavItem>
                      ))}
                    </Nav>
                  </Col>
                  <Col xl="5" lg="6" md="6" xs="8" className={`mt-3 mt-md-0 d-flex align-items-center ${width <= 575 ? '' : 'justify-content-center'}`}>
                    <h1 className="mb-0">
                      <div className={`${width <= 575 ? 'f-16' : width <= 991 ? 'f-16' : width <= 1200 ? 'f-22' : 'f-24'} mb-2`} style={{ lineHeight: '1.25' }}>{"Top Decentralized (DEX) Exchanges"}</div>
                      <div className={`f-w-300 text-info f-${width <= 575 ? 10 : 14} text-${width <= 575 ? 'left mt-2' : 'center'}`} style={{ lineHeight: 1.5 }}>{"by Volume"}</div>
                    </h1>
                  </Col>
                  <Col xl="3" lg="2" md="2" xs="4" className="mt-3 mt-md-0">
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
              <CardBody className="pt-4 pb-2 px-0 px-lg-4">
                {!data ?
                  <Error404 />
                  :
                  data.length > 0 ?
                    <>
                      <div className="d-flex align-items-center px-2">
                        {data && (
                          <span className="f-w-500">
                            <h2 className="f-14 d-inline-flex mb-0">{"Total Volume"}</h2>{": "}
                            <span className="font-secondary f-w-400">
                              {exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' ?
                                currencyData && currencyData.symbol
                                :
                                currencyVolumeData && currencyVolumeData.symbol
                              }
                              {numberOptimizeDecimal(numeral(_.sum(data.map(d => Number(d.trade_volume_24h_btc))) * (exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' ? exchangeRatesData[currency].value : 1)).format('0,0'))}
                              {exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' ?
                                !(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)
                                :
                                !(currencyVolumeData && currencyVolumeData.symbol) && (<>&nbsp;{currencyVolume.toUpperCase()}</>)
                              }
                            </span>
                          </span>
                        )}
                        <span className="d-flex align-items-center ml-auto"><Search /><Input type="text" value={marketSearch} onChange={e => setMarketSearch(e.target.value)} placeholder="Search" className="b-r-6 f-14 ml-2" style={{ maxWidth: 'max-content' }} /></span>
                      </div>
                      {displayTypeSelected === 'card' ?
                        <Row className="mt-3 px-2">
                          {filteredData.map((d, i) => (
                            <Col key={i} xl="3" lg="4" md="6" xs="12" className={`mt-${i < 4 ? width <= 767 ? i < 1 ? 2 : 4 : width <= 991 ? i < 2 ? 2 : 4 : width <= 1200 ? i < 3 ? 2 : 4 : i < 4 ? 2 : 4 : 4}`}>
                              <Card className="mb-0 p-3" style={{ boxShadow: 'none' }}>
                                <div className="media">
                                  <Link to={`/exchange${d.id ? `/${d.id}` : 's'}`}>
                                    <img className="align-self-top img-fluid img-30 mr-3" src={d.image.replace('small', 'large')} alt={!d.image.startsWith('missing_') ? d.name : ''} />
                                  </Link>
                                  <div className="media-body">
                                    <h2 className="f-16 d-flex align-items-center">
                                      <Link to={`/exchange${d.id ? `/${d.id}` : 's'}`} style={{ color: 'unset' }}>{d.name}</Link>
                                      {d.url && (
                                        <a href={d.url} target="_blank" rel="noopener noreferrer" className="ml-auto"><Tooltip title="Start Trading"><Briefcase style={{ width: '1rem', height: '1rem' }} /></Tooltip></a>
                                      )}
                                    </h2>
                                    <div>
                                      <span className="f-w-500 text-info">{"Country: "}</span><span className="text-secondary">{d.country ? d.country : 'N/A'}</span>
                                      {d.year_established && (<div className="f-10 text-info">{"Launched: "}{d.year_established}</div>)}
                                    </div>
                                    <div className="mt-2 pt-1">
                                      <Row>
                                        <Col xs="6">
                                          <div className="f-w-500 font-primary">{"Market Share"}</div>
                                          <div>
                                            {typeof d.market_share_percentage === 'number' ? numeral(d.market_share_percentage).format('0,0.00%').startsWith('NaN') ? '0.00%' : numeral(d.market_share_percentage).format('0,0.00%') : '-'}
                                          </div>
                                        </Col>
                                        <Col xs="6">
                                          <div className="f-w-500 font-primary">{"Confidence"}</div>
                                          <div className="d-flex align-items-center">
                                            <Progress color={d.trust_score >=5 ? 'success' : 'danger'} value={typeof d.trust_score === 'number' ? 100 * d.trust_score / 10 : 0} className="progress-confidence progress-6 w-75 mr-2" />
                                            {typeof d.trust_score === 'number' ? numeral(d.trust_score).format('0,0') : 'N/A'}
                                          </div>
                                        </Col>
                                      </Row>
                                    </div>
                                    <div className="mt-2 pt-1">
                                      <div className="f-w-500 font-primary d-flex align-items-center">{"Volume"}<Badge color="light" pill className="f-10 text-secondary f-w-300 ml-2">24h</Badge></div>
                                      <h3 className="mt-1 mb-0">
                                        {currencyVolume !== currency && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' ?
                                          <div className={`${currencyData && currencyData.symbol ? 'f-14' : 'f-12'} d-flex align-items-center`}>
                                            {typeof d.trade_volume_24h_btc === 'number' || typeof d.trade_volume_24h_btc === 'string' ?
                                              <>
                                                {currencyData && currencyData.symbol}
                                                {numberOptimizeDecimal(numeral(Number(d.trade_volume_24h_btc) * exchangeRatesData[currency].value).format(Number(d.trade_volume_24h_btc) * exchangeRatesData[currency].value > 1 ? '0,0' : '0,0.00'))}
                                                {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                              </>
                                              :
                                              'N/A'
                                            }
                                            {(typeof d.trade_volume_24h_btc === 'number' || typeof d.trade_volume_24h_btc === 'string') && (<div className="f-10 text-info ml-auto">{numberOptimizeDecimal(numeral(Number(d.trade_volume_24h_btc)).format(Number(d.trade_volume_24h_btc) > 1 ? '0,0' : '0,0.00'))}{currencyVolume && (<>&nbsp;{currencyVolume.toUpperCase()}</>)}</div>)}
                                          </div>
                                          :
                                          <>
                                            {typeof d.trade_volume_24h_btc === 'number' || typeof d.trade_volume_24h_btc === 'string' ?
                                              <>
                                                {currencyVolumeData && currencyVolumeData.symbol}
                                                {numberOptimizeDecimal(numeral(Number(d.trade_volume_24h_btc)).format(Number(d.trade_volume_24h_btc) > 1 ? '0,0' : '0,0.00'))}
                                                {!(currencyVolumeData && currencyVolumeData.symbol) && (<>&nbsp;{currencyVolume.toUpperCase()}</>)}
                                              </>
                                              :
                                              'N/A'
                                            }
                                          </>
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
                                    onClick={() => setMarketSort({ field: 'name', direction: marketSort.field === 'name' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`${marketSort.field === 'name' ? 'bg-light' : ''}`}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {"Name"}
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
                                    onClick={() => setMarketSort({ field: 'trade_volume_24h_btc', direction: marketSort.field === 'trade_volume_24h_btc' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`${marketSort.field === 'trade_volume_24h_btc' ? 'bg-light' : ''}`}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <div className="d-flex align-items-center justify-content-end">
                                      {"Volume"}
                                      <Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">24h</Badge>
                                      {marketSort.field === 'trade_volume_24h_btc' && (
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
                                    onClick={() => setMarketSort({ field: 'market_share_percentage', direction: marketSort.field === 'market_share_percentage' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`text-right ${marketSort.field === 'market_share_percentage' ? 'bg-light' : ''}`}
                                    style={{ minWidth: '10rem', cursor: 'pointer' }}
                                  >
                                    {"Market Share %"}
                                    {marketSort.field === 'market_share_percentage' && (
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
                                    onClick={() => setMarketSort({ field: 'trust_score_rank', direction: marketSort.field === 'trust_score_rank' && marketSort.direction === 'desc' ? 'asc' : 'desc' })}
                                    className={`text-right ${marketSort.field === 'trust_score_rank' ? 'bg-light' : ''}`}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {"Confidence"}
                                    {marketSort.field === 'trust_score_rank' && (
                                      <>
                                        {marketSort.direction === 'desc' ?
                                          <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                          :
                                          <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                        }
                                      </>
                                    )}
                                  </th>
                                  <th style={{ minWidth: '10rem' }}>
                                    <div className="d-flex align-items-center justify-content-end">
                                      {"Action"}
                                      <span onClick={() => SweetAlert.fire(affiliateData)} className="text-info ml-1" style={{ height: '1rem', cursor: 'pointer', marginTop: '-1px' }}><Info style={{ width: '1rem', height: '1rem' }} /></span>
                                    </div>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {sortedData.map((d, i) => (
                                  <tr key={i}>
                                    <td>{d.rank + 1}</td>
                                    <td className={`f-w-500 ${marketSort.field === 'name' ? 'bg-light' : ''}`}>
                                      <Link to={`/exchange${d.id ? `/${d.id}` : 's'}`}>
                                        <div className="d-flex">
                                          {d.image && (
                                            <span className="avatar mr-2">
                                              <Media body className="img-20" src={d.image.replace('small', 'large')} alt={!d.image.startsWith('missing_') ? d.name : ''} />
                                            </span>
                                          )}
                                          <span>{d.name}</span>
                                        </div>
                                      </Link>
                                    </td>
                                    <td className={`${marketSort.field === 'country' ? 'bg-light' : ''}`} style={{ maxWidth: '7rem' }}>
                                      {d.country ? d.country : <div className="text-secondary">{"N/A"}</div>}
                                      {d.year_established && (<div className="f-10 text-info">{"Launched: "}{d.year_established}</div>)}
                                    </td>
                                    <td className={`text-right ${marketSort.field === 'trade_volume_24h_btc' ? 'bg-light' : ''}`}>
                                      {currencyVolume !== currency && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' ?
                                        <>
                                          {typeof d.trade_volume_24h_btc === 'number' || typeof d.trade_volume_24h_btc === 'string' ?
                                            <>
                                              {currencyData && currencyData.symbol}
                                              {numberOptimizeDecimal(numeral(Number(d.trade_volume_24h_btc) * exchangeRatesData[currency].value).format(Number(d.trade_volume_24h_btc) * exchangeRatesData[currency].value > 1 ? '0,0' : '0,0.00'))}
                                              {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                                            </>
                                            :
                                            'N/A'
                                          }
                                          {(typeof d.trade_volume_24h_btc === 'number' || typeof d.trade_volume_24h_btc === 'string') && (<div className="f-10 text-info">{numberOptimizeDecimal(numeral(Number(d.trade_volume_24h_btc)).format(Number(d.trade_volume_24h_btc) > 1 ? '0,0' : '0,0.00'))}{currencyVolume && (<>&nbsp;{currencyVolume.toUpperCase()}</>)}</div>)}
                                        </>
                                        :
                                        <>
                                          {typeof d.trade_volume_24h_btc === 'number' || typeof d.trade_volume_24h_btc === 'string' ?
                                            <>
                                              {currencyVolumeData && currencyVolumeData.symbol}
                                              {numberOptimizeDecimal(numeral(Number(d.trade_volume_24h_btc)).format(Number(d.trade_volume_24h_btc) > 1 ? '0,0' : '0,0.00'))}
                                              {!(currencyVolumeData && currencyVolumeData.symbol) && (<>&nbsp;{currencyVolume.toUpperCase()}</>)}
                                            </>
                                            :
                                            'N/A'
                                          }
                                        </>
                                      }
                                    </td>
                                    <td className={`text-right ${marketSort.field === 'market_share_percentage' ? 'bg-light' : ''}`}>
                                      {typeof d.market_share_percentage === 'number' ? numeral(d.market_share_percentage).format('0,0.00%').startsWith('NaN') ? '0.00%' : numeral(d.market_share_percentage).format('0,0.00%') : '-'}
                                    </td>
                                    <td className={`${marketSort.field === 'trust_score_rank' ? 'bg-light' : ''}`} style={{ minWidth: '10rem' }}>
                                      <div className="d-flex align-items-center justify-content-end">
                                        <Progress color={d.trust_score >=5 ? 'success' : 'danger'} value={typeof d.trust_score === 'number' ? 100 * d.trust_score / 10 : 0} className="progress-confidence w-50 mr-2" />
                                        {typeof d.trust_score === 'number' ? numeral(d.trust_score).format('0,0') : 'N/A'}
                                      </div>
                                    </td>
                                    <td className="text-right">
                                      {d.url ?
                                        <a href={d.url} target="_blank" rel="noopener noreferrer"><Button color="primary" className="btn-sm">{"Start Trading"}</Button></a>
                                        :
                                        d.id ?
                                          <Link to={`/exchange/${d.id}`}><Button color="light" className="btn-sm">{"See more"}</Button></Link>
                                          :
                                          null
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

export default DexExchanges;
