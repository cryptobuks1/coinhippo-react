import React, { Fragment, useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardHeader, CardBody, Media, Badge, Table } from 'reactstrap';
import { Tooltip } from 'antd';
import { MoreHorizontal } from 'react-feather';
import _ from 'lodash';
import numeral from 'numeral';
import Spinner from '../../../spinner';
import Error404 from '../../../../pages/errors/error404';
import { currenciesGroups } from '../../../../layout/header/menus';
import { getCoinsMarkets } from '../../../../api';
import { useIsMountedRef, getLocationData, numberOptimizeDecimal } from '../../../../utils';
import logo_min from '../../../../assets/images/logo/logo_square.png';
import logo_dark_min from '../../../../assets/images/logo/logo_square_white.png';

const Defi = props => {
  const locationData = getLocationData(window);
  const pageSize = 10;
  const isMountedRef = useIsMountedRef();
  const [defiData, setDefiData] = useState([]);
  const [defiLoading, setDefiLoading] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const currency = locationData.params && locationData.params.currency && currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === locationData.params.currency.toLowerCase()).length > 0 ? locationData.params.currency.toLowerCase() : 'usd';
  const n = locationData.params && !isNaN(locationData.params.n) ? Number(locationData.params.n) > 20 ? 20 : Number(locationData.params.n) < 1 ? 1 : Math.floor(Number(locationData.params.n)) : 10;

  useEffect(() => {
    const getData = async () => {
      if (isMountedRef.current) {
        setDefiLoading(true);
      }
      const newData = defiData ? defiData : [];
      let size = 0;
      try {
        let data = await getCoinsMarkets({ vs_currency: currency, category: 'decentralized-finance-defi', order: 'market_cap_desc', per_page: n || pageSize, page: 1, price_change_percentage: '24h' });
        data = data && !data.error ? data : null;
        if (data) {
          for (let j = 0; j < data.length; j++) {
            newData[size] = data[j];
            size++;
            if (size === n) {
              break;
            }
          }
        }
      } catch (err) {}
      newData.length = size;
      if (isMountedRef.current) {
        if (size !== 0) {
          setDefiData(newData.length > 0 ? newData : null);
        }
        setDefiLoading(false);
        setDataLoaded(true);
      }
    };
    getData();
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, currency, defiData, n]);

  document.body.className = locationData.params && locationData.params.theme && locationData.params.theme.toLowerCase() === 'dark' ? 'dark-only' : 'light';
  const currencyData = _.head(_.uniq(currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === currency), 'id'));
  return (
    <Fragment>
      <Container fluid={true} style={{ maxWidth: '30rem' }}>
        <Row>
          <Col xs="12">
            {!defiData && dataLoaded ?
              <Error404 />
              :
              !defiData && defiLoading ?
                <div className="loader-box">
                  <Spinner />
                </div>
                :
                defiData ?
                  <Card className="bg-transparent border-0 mb-3" style={{ boxShadow: 'none' }}>
                    <CardHeader className="widget-card-header bg-transparent p-0" style={{ borderBottom: 'none' }}>
                      <Row>
                        <Col lg="12" sm="12" xs="12">
                          <Card className="h-100 border-0 mb-0" style={{ boxShadow: 'none' }}>
                            <CardHeader className="top-10-card-header d-flex align-items-center pt-3 pb-2 px-3">
                              <h2 className="f-16"><a href="/coins/defi" target="_blank" rel="noopener noreferrer" style={{ color: 'unset', letterSpacing: 0 }}>{"Top "}{n}{" DeFi by Market Cap"}</a></h2>
                              <a href="/coins/defi" target="_blank" rel="noopener noreferrer" className="ml-auto"><Tooltip title="See more"><MoreHorizontal /></Tooltip></a>
                            </CardHeader>
                            <CardBody className="p-0">
                              <div className="top-10-table table-align-top responsive-tbl">
                                <div className="table-responsive">
                                  {defiLoading && !(defiData && defiData.length > 0) ?
                                    <div className="loader-box" style={{ height: '40rem' }}>
                                      <div className="loader-10" />
                                    </div>
                                    :
                                    <Table borderless>
                                      <thead>
                                        <tr>
                                          <th className="pl-3" style={{ top: 0 }}>{"#"}</th>
                                          <th style={{ top: 0 }}>{"Coin"}</th>
                                          <th className="text-right" style={{ top: 0 }}>{"Market Cap"}</th>
                                          <th className="pr-3" style={{ top: 0 }}>
                                            <div className="d-flex align-items-center justify-content-end">
                                              {"Price"}
                                              <Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">24h</Badge>
                                            </div>
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {defiData && defiData.map((d, i) => {
                                          d.rank = i;
                                          d.price_change_percentage_24h_in_currency = typeof d.price_change_percentage_24h_in_currency === 'number' ? d.price_change_percentage_24h_in_currency : 0;
                                          return d;
                                        }).map((d, i) => (
                                          <tr key={i}>
                                            <td className="pl-3">{d.rank + 1}</td>
                                            <td>
                                              <a href={`/coin${d.id ? `/${d.id}` : 's'}`} target="_blank" rel="noopener noreferrer">
                                                <div className="d-flex">
                                                  {d.image && (
                                                    <span className="avatar mr-2">
                                                      <Media body className="img-20" src={d.image} alt={!d.image.startsWith('missing_') ? d.name : ''} />
                                                    </span>
                                                  )}
                                                  <span>{d.name}</span>
                                                </div>
                                                {d.symbol && (<div className="f-10 text-info ml-4 pl-1">{d.symbol.toUpperCase()}</div>)}
                                              </a>
                                            </td>
                                            <td className="text-right">
                                              {typeof d.market_cap === 'number' && d.market_cap > 0 ?
                                                <>
                                                  {currencyData && currencyData.symbol}
                                                  {numberOptimizeDecimal(numeral(Number(d.market_cap)).format(Number(d.market_cap) > 1 ? '0,0' : '0,0.00') !== 'NaN' ? numeral(Number(d.market_cap)).format(Number(d.market_cap) > 1 ? '0,0' : '0,0.00') : Number(d.market_cap).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}
                                                  {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                                </>
                                                :
                                                'N/A'
                                              }
                                              {typeof d.total_volume === 'number' && d.total_volume >= 0 && (
                                                <div className="f-10 text-info">
                                                  {"Volume:"}&nbsp;
                                                  {currencyData && currencyData.symbol}
                                                  {numberOptimizeDecimal(numeral(Number(d.total_volume)).format(Number(d.total_volume) > 1 ? '0,0' : '0,0.00') !== 'NaN' ? numeral(Number(d.total_volume)).format(Number(d.total_volume) > 1 ? '0,0' : '0,0.00') : Number(d.total_volume).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}
                                                  {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                                </div>
                                              )}
                                            </td>
                                            <td className="text-right pr-3">
                                              {typeof d.current_price === 'number' && d.current_price >= 0 ?
                                                <>
                                                  {currencyData && currencyData.symbol}
                                                  {numberOptimizeDecimal(numeral(d.current_price).format(d.current_price > 1 ? '0,0.00' : '0,0.0000000000') !== 'NaN' ? numeral(d.current_price).format(d.current_price > 1 ? '0,0.00' : '0,0.0000000000') : d.current_price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}
                                                  {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                                </>
                                                :
                                                'N/A'
                                              }
                                              {typeof d.price_change_percentage_24h_in_currency === 'number' && d.price_change_percentage_24h_in_currency !== 0 && (<div className={`${d.price_change_percentage_24h_in_currency > 0 ? 'font-success' : d.price_change_percentage_24h_in_currency < 0 ? 'font-danger' : ''}`}>{numberOptimizeDecimal(numeral(d.price_change_percentage_24h_in_currency / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(d.price_change_percentage_24h_in_currency / 100).format('+0,0.00%'))}</div>)}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </Table>
                                  }
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        </Col>
                        <Col lg="12" sm="12" xs="12" className="d-flex align-items-center mt-3 pt-1">
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

export default Defi;
