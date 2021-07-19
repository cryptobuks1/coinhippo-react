import React, { Fragment, useState, useEffect, useLayoutEffect } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Row, Col, Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { Input, Select, Tooltip } from 'antd';
import { Home, Search } from 'react-feather';
import Fade from 'react-reveal/Fade';
import parse from 'html-react-parser';
import _ from 'lodash';
import numeral from 'numeral';
import Ads from '../../components/ads';
import { menus, currenciesGroups } from '../../layout/header/menus';
import { getFeeds, getEtherscan } from '../../api';
import { useIsMountedRef, sleep, getName, getLocationData, numberOptimizeDecimal, ignored_breadcrumb_paths } from '../../utils';

const SubHeader = props => {
  const locationData = getLocationData(window);
  const isMountedRef = useIsMountedRef();

  const currency = useSelector(content => content.Preferences.vs_currency);
  const allCryptoData = useSelector(content => content.Data.all_crypto_data);
  const exchangeRatesData = useSelector(content => content.Data.exchange_rates_data);

  const [feedsIndex, setFeedsIndex] = useState(0);
  const [feedsData, setFeedsData] = useState(null);
  const [gasData, setGasData] = useState(null);
  const [redirectPath, setRedirectPath] = useState(null);

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
    const updateFeeds = async () => {
      if (typeof feedsData !== 'boolean') {
        const newData = feedsData ? feedsData : [];
        let size = 0;
        try {
          const feeds = await getFeeds();
          if (feeds) {
            for (let i = 0; i < feeds.length; i++) {
              newData[size] = feeds[i];
              size++;
            }
          }
        } catch (err) {}
        newData.length = size;
        if (isMountedRef.current) {
          setFeedsData(newData);
        }
      }
    };
    updateFeeds();
    const interval = setInterval(() => updateFeeds(), 10 * Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, feedsData]);

  useEffect(() => {
    const updateFeeds = async () => {
      await sleep(feedsIndex.toString().indexOf('.') > -1 ? 1500 : Number(process.env.REACT_APP_FEEDS_ANIMATE_MS));
      if (isMountedRef.current) {
        setFeedsIndex(feedsIndex + 0.5);
      }
    };
    updateFeeds();
  }, [isMountedRef, feedsIndex]);

  useEffect(() => {
    const getData = async () => {
      try {
        let gasData = await getEtherscan({ module: 'gastracker', action: 'gasoracle' });
        gasData = gasData && gasData.result ? gasData.result : null;
        if (isMountedRef.current) {
          if (gasData) {
            setGasData(gasData);
          }
        }
      } catch (err) {}
    };
    getData();
    const interval = setInterval(() => getData(), 10 * Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef]);

  if (redirectPath) {
    if (window.location && window.location.pathname === redirectPath) {
      if (redirectPath.startsWith('/explorer/')) {
        window.location.reload();
      }
      setRedirectPath(null);
    }
    return (<Redirect to={redirectPath} />);
  }

  if ((props.breadcrumb && props.breadcrumb.length > 0) || props.static) {
    if (typeof feedsData !== 'boolean') {
      setFeedsData(false);
    }
  }
  else {
    if (typeof feedsData === 'boolean') {
      setFeedsData([]);
    }
  }

  const currencyData = _.head(_.uniq(currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === currency), 'id'));

  const gweiRate = exchangeRatesData && exchangeRatesData.eth && typeof exchangeRatesData.eth.value === 'number' && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' ? 0.000000001 * exchangeRatesData[currency].value / exchangeRatesData.eth.value : null;

  const explorerPaths = locationData && locationData.pathname && locationData.pathname.startsWith('/explorer') && locationData.pathname.split('/').filter(x => x).length > 1 && locationData.pathname.split('/').filter(x => x);

  return (
    <Fragment>
      <Container fluid={true} className={`sub-header-wrapper${props.visible ? '' : ' d-none'}`}>
        {props.visible && (
          <div className="page-title pt-0 pb-1 pt-md-4">
            <Row>
              <Col lg="9" sm="8" xs="12" className={`mt-${(props.breadcrumb && props.breadcrumb.length > 0) || (feedsData && feedsData.length > 0) ? 3 : 0} mt-md-0${explorerPaths ? ' order-2 order-sm-1' : ''}`}>
                <Row>
                  <Col lg="5" md="12" xs="12">
                    {props.breadcrumb && props.breadcrumb.length > 0 ?
                      <Breadcrumb>
                        <BreadcrumbItem><Link to="/" className="font-weight-bold">{width <= 767 ? <Home /> : "Home"}</Link></BreadcrumbItem>
                        {props.breadcrumb.map((breadcrumbItem, key) => (
                          <BreadcrumbItem key={key} active={key === props.breadcrumb.length - 1}>
                            {key < props.breadcrumb.length - 1 && breadcrumbItem.path && ignored_breadcrumb_paths.indexOf(breadcrumbItem.path.replace('/', '')) < 0 ?
                              <Link to={breadcrumbItem.path} className="font-secondary font-weight-bold">{breadcrumbItem.title}</Link>
                              :
                              breadcrumbItem.title
                            }
                          </BreadcrumbItem>
                        ))}
                      </Breadcrumb>
                      :
                      feedsData && feedsData.length > 0 && feedsData[(feedsIndex - (feedsIndex.toString().indexOf('.') > -1 ? 0.5 : 0)) % feedsData.length] ?
                        <Fade bottom opposite when={feedsIndex.toString().indexOf('.') < 0}>
                          {parse(feedsData[(feedsIndex - (feedsIndex.toString().indexOf('.') > -1 ? 0.5 : 0)) % feedsData.length])}
                        </Fade>
                        :
                        null
                    }
                  </Col>
                  {!explorerPaths && !props.static && (width <= 575 || width > 991) && (
                    <Col lg="7" md="0" xs="12" className="d-flex justify-content-center mt-3 mt-md-0"><Ads /></Col>
                  )}
                  {explorerPaths && explorerPaths.length > 2 && !props.static && (
                    <Col lg="7" md="12" xs="12" className="d-flex justify-content-center mt-3 mt-lg-0">
                      <Input.Search
                        enterButton
                        placeholder="Search by Address / Txn Hash"
                        onSearch={value => {
                          if (value) {
                            setRedirectPath(`/explorer/${explorerPaths[1]}${value && value.length > 40 && value.length < 45 ? '' : '/tx'}/${value}`);
                          }
                        }}
                      />
                    </Col>
                  )}
                </Row>
              </Col>
              {!props.static && (
                <Col lg="3" sm="4" xs="12" className={`mt-3 mt-md-0${explorerPaths ? ' order-1 order-sm-2' : ''}`}>
                  <div className={`d-flex align-items-center justify-content-${!explorerPaths && width <= 575 ? 'center' : 'end'}`}>
                    {!explorerPaths ?
                      <>
                        <Search className="text-secondary mr-2" />
                        <Select
                          showSearch
                          placeholder="Search Coin / Exchange"
                          optionFilterProp="children"
                          filterOption={(input, option) => option.data ? option.data.id.toLowerCase().startsWith(input.toLowerCase()) || option.data.name.toLowerCase().startsWith(input.toLowerCase()) || (option.data.symbol && option.data.symbol.toLowerCase().startsWith(input.toLowerCase())) || (option.data.dataType === 'categories' && (option.data.id.toLowerCase().indexOf(input.toLowerCase()) > -1 || option.data.name.toLowerCase().indexOf(input.toLowerCase()) > -1)) : false}
                          onSelect={value => setRedirectPath(value)}
                          dropdownClassName="vs-currency-select-dropdown"
                          style={{ width: '15rem' }}
                        >
                          {allCryptoData && Object.keys(allCryptoData).filter(dataType => allCryptoData[dataType] && allCryptoData[dataType].length > 0).map((dataType, key) => (
                            <Select.OptGroup key={key} label={getName(dataType, true)}>
                              {allCryptoData[dataType].map((d, sub_key) => (
                                <Select.Option key={`${key}_${sub_key}`} value={`/${dataType === 'exchanges' ? 'exchange' : dataType === 'categories' ? 'coins' : 'coin'}/${dataType === 'categories' && d.category_id ? d.category_id : d.id}`} data={{ ...d, dataType }} className="small">
                                  {d.thumb && (
                                    <img src={d.thumb} alt={!d.thumb.startsWith('missing_') ? d.name : ''} className="mr-2" style={{ width: '1rem' }} />
                                  )}
                                  {d.name}{d.symbol && (<span className="f-10 text-secondary">&nbsp;({d.symbol})</span>)}
                                  <span className="f-10 font-info f-right">{typeof d.market_cap_rank === 'number' ? `#${d.market_cap_rank}` : getName(d.market_type, true)}</span>
                                </Select.Option>
                              ))}
                            </Select.OptGroup>
                          ))}
                        </Select>
                      </>
                      :
                      <Select
                        placeholder="Select Chain"
                        value={explorerPaths[1]}
                        onSelect={value => setRedirectPath(`/explorer/${value}${explorerPaths.length > 2 ? _.slice(explorerPaths, 2).map(p => `/${p}`).join('') : ''}`)}
                        dropdownClassName="vs-currency-select-dropdown"
                        style={{ width: '14rem' }}
                      >
                        {menus[0].subMenu[2][0].subMenu.map((d, key) => (
                          <Select.Option key={key} value={d.path.split('/').filter(x => x)[1]} className="small">
                            {d.logo_url && (
                              <img src={d.logo_url} alt={d.title} className="mr-2" style={{ width: '1rem' }} />
                            )}
                            <span className="f-w-500">{d.title}</span>{d.network && (<span className="f-10 text-secondary">&nbsp;({getName(d.network, true)})</span>)}
                          </Select.Option>
                        ))}
                      </Select>
                    }
                  </div>
                  {((explorerPaths && explorerPaths[1] === 'ethereum') || !explorerPaths) && gasData && (
                    <div className={`f-12 d-flex align-items-top justify-content-${!explorerPaths && width <= 575 ? 'center' : 'end'} mt-2 pt-1`}>
                      <span className="f-20" style={{ marginTop: '-.4rem' }}>
                        <Tooltip placement="bottom" title={<>{"Data from "}<a href="https://etherscan.io/gastracker" target="_blank" rel="noopener noreferrer" className="f-w-500 text-white">{"etherscan.io"}</a></>}>{"⛽"}</Tooltip></span>
                      <span className="ml-1">{"ETH Gas:"}</span>
                      <Tooltip placement="bottom" title={typeof gweiRate === 'number' ? <>{"≅"}&nbsp;{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(gasData.SafeGasPrice * gweiRate).format('0,0.00000000'))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</> : null}>
                        <div className="text-info text-center ml-2 pl-1">
                          {numeral(gasData.SafeGasPrice).format('0,0')}
                          <div className="f-10 f-w-300">{"Safe"}</div>
                        </div>
                      </Tooltip>
                      <Tooltip placement="bottom" title={typeof gweiRate === 'number' ? <>{"≅"}&nbsp;{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(gasData.ProposeGasPrice * gweiRate).format('0,0.00000000'))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</> : null}>
                        <div className="text-info text-center ml-2 pl-1">
                          {numeral(gasData.ProposeGasPrice).format('0,0')}
                          <div className="f-10 f-w-300">{"Average"}</div>
                        </div>
                      </Tooltip>
                      <Tooltip placement="bottom" title={typeof gweiRate === 'number' ? <>{"≅"}&nbsp;{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(gasData.FastGasPrice * gweiRate).format('0,0.00000000'))}{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}</> : null}>
                        <div className="text-info text-center ml-2 pl-1">
                          {numeral(gasData.FastGasPrice).format('0,0')}
                          <div className="f-10 f-w-300">{"Fast"}</div>
                        </div>
                      </Tooltip>
                      &nbsp;&nbsp;&nbsp;<span className="text-secondary">{"Gwei"}</span>
                    </div>
                  )}
                </Col>
              )}
            </Row>
          </div>
        )}
      </Container>
    </Fragment>
  );
};

export default SubHeader;
