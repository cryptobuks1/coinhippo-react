import React, { Fragment, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { EXCHANGE_RATES_DATA } from '../../../../redux/types';
import { Container, Row, Col, Card, CardHeader, CardBody, Media, Table } from 'reactstrap';
import { Tooltip } from 'antd';
import SweetAlert from 'sweetalert2';
import { MoreHorizontal, Info, ExternalLink } from 'react-feather';
import _ from 'lodash';
import numeral from 'numeral';
import Spinner from '../../../spinner';
import Error404 from '../../../../pages/errors/error404';
import { currenciesGroups } from '../../../../layout/header/menus';
import { getDerivativesExchanges } from '../../../../api';
import { useIsMountedRef, affiliateData, cex, dex, getLocationData, numberOptimizeDecimal } from '../../../../utils';
import logo_min from '../../../../assets/images/logo/logo_square.png';
import logo_dark_min from '../../../../assets/images/logo/logo_square_white.png';

const DerivativeExchanges = props => {
  const locationData = getLocationData(window);
  const pageSize = 10;
  const isMountedRef = useIsMountedRef();
  const exchangeRatesData = useSelector(content => content.Data[EXCHANGE_RATES_DATA]);
  const currency = locationData.params && locationData.params.currency && currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === locationData.params.currency.toLowerCase()).length > 0 ? locationData.params.currency.toLowerCase() : 'usd';
  const n = locationData.params && !isNaN(locationData.params.n) ? Number(locationData.params.n) > 20 ? 20 : Number(locationData.params.n) < 1 ? 1 : Math.floor(Number(locationData.params.n)) : 10;

  const [derivativesData, setDerivativesData] = useState([]);
  const [derivativesLoading, setDerivativesLoading] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const getData = async () => {
      if (isMountedRef.current) {
        setDerivativesLoading(true);
      }
      const newData = derivativesData ? derivativesData : [];
      let size = 0;
      try {
        let data = await getDerivativesExchanges({ per_page: n || pageSize, page: 1 });
        data = data && !data.error ? data : null;
        if (data) {
          for (let j = 0; j < data.length; j++) {
            newData[size] = data[j];
            size++;
          }
        }
      } catch (err) {}
      newData.length = size;
      if (isMountedRef.current) {
        if (size !== 0) {
          setDerivativesData(newData.length > 0 ? newData : null);
        }
        setDerivativesLoading(false);
        setDataLoaded(true);
      }
    };
    getData();
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, currency, derivativesData, n]);

  document.body.className = locationData.params && locationData.params.theme && locationData.params.theme.toLowerCase() === 'dark' ? 'dark-only' : 'light';

  const currencyData = _.head(_.uniq(currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === currency), 'id'));

  const currencyVolume = 'btc';
  const currencyVolumeData = _.head(_.uniq(currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === currencyVolume), 'id'));

  return (
    <Fragment>
      <Container fluid={true} style={{ maxWidth: '37.5rem' }}>
        <Row>
          <Col xs="12">
            {!derivativesData && dataLoaded ?
              <Error404 />
              :
              !derivativesData && derivativesLoading ?
                <div className="loader-box">
                  <Spinner />
                </div>
                :
                derivativesData ?
                  <Card className="bg-transparent border-0 mb-3" style={{ boxShadow: 'none' }}>
                    <CardHeader className="widget-card-header bg-transparent p-0" style={{ borderBottom: 'none' }}>
                      <Row>
                        <Col lg="12" sm="12" xs="12">
                          <Card className="h-100 border-0 mb-0" style={{ boxShadow: 'none' }}>
                            <CardHeader className="top-10-card-header d-flex align-items-center pt-3 pb-2 px-3">
                              <h2 className="f-16"><a href="/exchanges/derivatives" target="_blank" rel="noopener noreferrer" style={{ color: 'unset', letterSpacing: 0 }}>{"Top "}{n}{" Derivatives Exchanges"}</a></h2>
                              <a href="/exchanges/derivatives" target="_blank" rel="noopener noreferrer" className="ml-auto"><Tooltip title="See more"><MoreHorizontal /></Tooltip></a>
                            </CardHeader>
                            <CardBody className="p-0">
                              <div className="top-10-table table-align-top responsive-tbl">
                                <div className="table-responsive">
                                  {derivativesLoading && !(derivativesData && derivativesData.length > 0) ?
                                    <div className="loader-box" style={{ height: '40rem' }}>
                                      <div className="loader-10" />
                                    </div>
                                    :
                                    <Table borderless>
                                      <thead>
                                        <tr>
                                          <th className="pl-3" style={{ top: 0 }}>{"#"}</th>
                                          <th style={{ top: 0 }}>{"Exchange"}</th>
                                          <th className="text-right" style={{ minWidth: '7rem', top: 0 }}>{"Open Interest"}</th>
                                          <th className="text-right" style={{ top: 0 }}>{"Volume"}</th>
                                          <th className="pr-3" style={{ top: 0 }}>
                                            <div className="d-flex align-items-center justify-content-end" style={{ marginBottom: '2px' }}>
                                              <span onClick={() => SweetAlert.fire(affiliateData)} className="text-info ml-1" style={{ height: '1rem', cursor: 'pointer', marginTop: '-1px' }}><Info style={{ width: '1rem', height: '1rem' }} /></span>
                                            </div>
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {derivativesData && derivativesData.map((d, i) => {
                                          d.rank = i;
                                          d.open_interest_btc = typeof d.open_interest_btc === 'number' ? d.open_interest_btc : -1;
                                          d.trade_volume_24h_btc = !isNaN(d.trade_volume_24h_btc) && typeof d.trade_volume_24h_btc === 'string' ? Number(d.trade_volume_24h_btc) : d.trade_volume_24h_btc;
                                          return d;
                                        }).map((d, i) => (
                                          <tr key={i} style={{ height: '52px' }}>
                                            <td className="pl-3">{d.rank + 1}</td>
                                            <td>
                                              <a href={`/exchange${d.id ? `/${d.id}` : 's'}`} target="_blank" rel="noopener noreferrer">
                                                <div className="d-flex">
                                                  {d.image && (
                                                    <span className="avatar mr-2">
                                                      <Media body className="img-20" src={d.image} alt={!d.image.startsWith('missing_') ? d.name : ''} />
                                                    </span>
                                                  )}
                                                  <span>{d.name}</span>
                                                </div>
                                                {dex.indexOf(d.id) > -1 ?
                                                  <div className={`f-10 text-info${d.image ? ' ml-4 pl-1' : ''}`}>{"Decentralized"}</div>
                                                  :
                                                  cex.indexOf(d.id) > -1 ?
                                                    <div className={`f-10 text-info${d.image ? ' ml-4 pl-1' : ''}`}>{"Centralized"}</div>
                                                    :
                                                    null
                                                }
                                              </a>
                                            </td>
                                            <td className="text-right">
                                              {currencyVolume !== currency && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' ?
                                                <>
                                                  {typeof d.open_interest_btc === 'number' && d.open_interest_btc >= 0 ?
                                                    <>
                                                      {currencyData && currencyData.symbol}
                                                      {numberOptimizeDecimal(numeral(d.open_interest_btc * exchangeRatesData[currency].value).format(d.open_interest_btc * exchangeRatesData[currency].value > 1 ? '0,0' : '0,0.00'))}
                                                      {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                                    </>
                                                    :
                                                    'N/A'
                                                  }
                                                  {typeof d.open_interest_btc === 'number' && d.open_interest_btc >= 0 && (<div className="f-10 text-info">{numberOptimizeDecimal(numeral(d.open_interest_btc).format(d.open_interest_btc > 1 ? '0,0' : '0,0.00'))}{currencyVolume && (<> {currencyVolume.toUpperCase()}</>)}</div>)}
                                                </>
                                                :
                                                <>
                                                  {typeof d.open_interest_btc === 'number' && d.open_interest_btc >= 0 ?
                                                    <>
                                                      {currencyVolumeData && currencyVolumeData.symbol}
                                                      {numberOptimizeDecimal(numeral(d.open_interest_btc).format(d.open_interest_btc > 1 ? '0,0' : '0,0.00'))}
                                                      {!(currencyVolumeData && currencyVolumeData.symbol) && (<> {currencyVolume.toUpperCase()}</>)}
                                                    </>
                                                    :
                                                    'N/A'
                                                  }
                                                </>
                                              }
                                            </td>
                                            <td className="text-right">
                                              {currencyVolume !== currency && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' ?
                                                <>
                                                  {typeof d.trade_volume_24h_btc === 'number' || typeof d.trade_volume_24h_btc === 'string' ?
                                                    <>
                                                      {currencyData && currencyData.symbol}
                                                      {numberOptimizeDecimal(numeral(Number(d.trade_volume_24h_btc) * exchangeRatesData[currency].value).format(Number(d.trade_volume_24h_btc) * exchangeRatesData[currency].value > 1 ? '0,0' : '0,0.00'))}
                                                      {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                                    </>
                                                    :
                                                    'N/A'
                                                  }
                                                  {(typeof d.trade_volume_24h_btc === 'number' || typeof d.trade_volume_24h_btc === 'string') && (<div className="f-10 text-info">{numberOptimizeDecimal(numeral(Number(d.trade_volume_24h_btc)).format(Number(d.trade_volume_24h_btc) > 1 ? '0,0' : '0,0.00'))}{currencyVolume && (<> {currencyVolume.toUpperCase()}</>)}</div>)}
                                                </>
                                                :
                                                <>
                                                  {typeof d.trade_volume_24h_btc === 'number' || typeof d.trade_volume_24h_btc === 'string' ?
                                                    <>
                                                      {currencyVolumeData && currencyVolumeData.symbol}
                                                      {numberOptimizeDecimal(numeral(Number(d.trade_volume_24h_btc)).format(Number(d.trade_volume_24h_btc) > 1 ? '0,0' : '0,0.00'))}
                                                      {!(currencyVolumeData && currencyVolumeData.symbol) && (<> {currencyVolume.toUpperCase()}</>)}
                                                    </>
                                                    :
                                                    'N/A'
                                                  }
                                                </>
                                              }
                                            </td>
                                            <td className="text-right pr-3">
                                              <div className="d-flex align-items-center justify-content-end">
                                                {d.url && (
                                                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="ml-2"><Tooltip placement="left" title="Start Trading" overlayClassName="f-12"><ExternalLink className="mt-1" style={{ width: '1rem' }} /></Tooltip></a>
                                                )}
                                              </div>
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

export default DerivativeExchanges;
