import React, { Fragment, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { THEME, ALL_CRYPTO_DATA} from '../../../redux/types';
import { Container, Row, Col, Card, CardHeader, CardBody, Media, Badge, Input, Nav, NavItem, NavLink, Table, Button } from 'reactstrap';
import { Input as AntInput, Tooltip, message } from 'antd';
import Slider from 'react-slick';
import { Copy, CheckCircle, XCircle, ChevronDown, ChevronUp, Search } from 'react-feather';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import _ from 'lodash';
import convert from 'ether-converter';
import moment from 'moment';
import numeral from 'numeral';
import Spinner from '../../spinner';
import Error404 from '../../../pages/errors/error404';
import NotFound from '../../../pages/errors/notFound';
import { menus, currenciesGroups } from '../../../layout/header/menus';
import { getAddressBalances/*, getAddressHistorical*/, getAddressTransactions, getAddressTransfers, getAddressNftTransactions, getHistoricalByAddressesV2 } from '../../../api';
import { useIsMountedRef, getLocationData, getName, numberOptimizeDecimal } from '../../../utils';

const Address = props => {
  const locationData = getLocationData(window);
  const pageSize = 100;
  const chain = props.match ? props.match.params.chain : null;
  const address = props.match ? props.match.params.address : null;
  const chains = menus[0].subMenu[2][0].subMenu;
  const chainData = chains.findIndex(c => c.path === `/explorer/${chain}`) > -1 ? chains[chains.findIndex(c => c.path === `/explorer/${chain}`)] : null;
  const chainId = chainData && chainData.chain_id;
  const isMountedRef = useIsMountedRef();
  const [contractData, setContractData] = useState([]);
  const [data, setData] = useState([]);
  const [assetTypeSelected, setAssetTypeSelected] = useState(locationData.params && locationData.params.type && locationData.params.type.toLowerCase() === 'nft' ? 'nft' : 'asset');
  const currency = 'usd';
  const theme = useSelector(content => content.Preferences[THEME]);
  const allCryptoData = useSelector(content => content.Data[ALL_CRYPTO_DATA]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMore, setViewMore] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [transactionsSort, setTransactionsSort] = useState({ field: null, direction: 'asc' });
  const [transactionsPage, setTransactionsPage] = useState(0);
  const [transactionsPageEnd, setTransactionsPageEnd] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsSearch, setTransactionsSearch] = useState('');
  const [redirectPath, setRedirectPath] = useState(null);
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
      if (chainId && address) {
        const newData = contractData ? contractData : [];
        let size = 0;
        try {
          let addressPricesData = await getHistoricalByAddressesV2(chainId, currency, address, {});
          addressPricesData = addressPricesData && !addressPricesData.error && addressPricesData.data ? addressPricesData.data : null;
          if (addressPricesData) {
            for (let i = 0; i < addressPricesData.length; i++) {
              newData[size] = { ...addressPricesData[i], address, chain_id: chainId };
              size++;
            }
          }
        } catch (err) {}
        newData.length = size;
        if (isMountedRef.current) {
          if (size !== 0) {
            setContractData(newData.length > 0 ? newData : null);
          }
        }
      }
    };
    getData();
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS) * 2);
    return () => clearInterval(interval);
  }, [isMountedRef, chainId, address, contractData, assetTypeSelected]);

  useEffect(() => {
    const getData = async () => {
      if (chainId && address) {
        if (isMountedRef.current) {
          setLoading(true);
        }
        const newData = data ? data : [];
        let size = 0;
        let page = 0;
        let finish = false;
        while (!finish) {
          try {
            let addressItemsData = await getAddressBalances(chainId, address, { nft: true || assetTypeSelected === 'nft', /*skip: (page * pageSize / 4) || undefined, limit: pageSize / 4*/'page-number': page, 'page-size': pageSize / 4 });
            if (!addressItemsData) {
              size = newData.length;
              finish = true;
            }
            else {
              addressItemsData = addressItemsData && !addressItemsData.error && addressItemsData.data && addressItemsData.data.items ? addressItemsData.data.items : null;
              if (addressItemsData) {
                for (let i = 0; i < addressItemsData.length; i++) {
                  newData[size] = { ...addressItemsData[i], address, chain_id: chainId };
                  size++;
                }
                // if (addressItemsData.length < pageSize / 4) {
                  finish = true;
                // }
              }
              else {
                finish = true;
              }
              page++;
            }
          } catch (err) {
            finish = true;
          }
        }
        newData.length = size;
        // page = 0;
        // finish = false;
        // while (!finish) {
        //   try {
        //     let addressItemsData = await getAddressHistorical(chainId, address, { 'page-number': page, 'page-size': pageSize / 4 });
        //     addressItemsData = addressItemsData && !addressItemsData.error && addressItemsData.data && addressItemsData.data.items ? addressItemsData.data.items : null;
        //     if (addressItemsData) {
        //       for (let i = 0; i < addressItemsData.length; i++) {
        //         const itemIndex = newData.findIndex(d => d.contract_address === addressItemsData[i].contract_address);
        //         if (itemIndex > -1) {
        //           newData[itemIndex] = { ...newData[itemIndex], holdings: addressItemsData[i].holdings };
        //         }
        //       }
        //       if (addressItemsData.length < pageSize / 4) {
        //         finish = true;
        //       }
        //     }
        //     else {
        //       finish = true;
        //     }
        //     page++;
        //   } catch (err) {
        //     finish = true;
        //   }
        // }
        if (isMountedRef.current) {
          if (size !== 0) {
            setData(newData.length > 0 ? newData : null);
          }
          setLoading(false);
          setLoaded(true);
        }
      }
    };
    getData();
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS) * 6);
    return () => clearInterval(interval);
  }, [isMountedRef, chainId, address, data, assetTypeSelected]);

  useEffect(() => {
    const getTransactions = async page => {
      if (chainId && address) {
        if (isMountedRef.current) {
          setTransactionsLoading(true);
        }
        const newData = transactions ? transactions : [];
        let size = 0;
        if (assetTypeSelected === 'nft') {
          const nftsData = data && data.filter(d => d.type === 'nft' && d.nft_data).flatMap(d => d.nft_data.map(nd => { return { ...nd, contract_address: d.contract_address }; }));
          if (nftsData) {
            let iNft = 0;
            while (iNft < nftsData.length) {
              try {
                let transactionsData = await getAddressNftTransactions(chainId, nftsData[iNft].contract_address, nftsData[iNft].token_id);
                if (!transactionsData) {
                  iNft++;
                }
                else {
                  transactionsData = transactionsData && !transactionsData.error && transactionsData.data && transactionsData.data.items ? transactionsData.data.items.filter(item => item.nft_transactions).flatMap(item => item.nft_transactions) : null;
                  if (transactionsData) {
                    for (let i = 0; i < transactionsData.length; i++) {
                      newData[size] = { ...transactionsData[i], type: assetTypeSelected, address, chain_id: chainId };
                      size++;
                    }
                    if (size >= (page + 1) * pageSize / 10) {
                      if (isMountedRef.current) {
                        setTransactionsPageEnd(true);
                      }
                      break;
                    }
                  }
                  iNft++;
                }
              } catch (err) {
                iNft++;
              }
            }
            if (iNft >= nftsData.length) {
              if (isMountedRef.current) {
                setTransactionsPageEnd(true);
              }
            }
          }
        }
        else {
          if (transactions.findIndex(d => d.transfers) < 0) {
            for (let i = 0; i <= (page < 0 ? 0 : page); i++) {
              try {
                if (page > 2 && i < page) {
                  size += pageSize / 10;
                }
                else {
                  let transactionsData = await getAddressTransactions(chainId, address, { 'page-number': i, 'page-size': pageSize / 10 });
                  transactionsData = transactionsData && !transactionsData.error && transactionsData.data && transactionsData.data.items ? transactionsData.data.items : null;
                  if (transactionsData) {
                    for (let j = 0; j < transactionsData.length; j++) {
                      newData[size] = { ...transactionsData[j], address, chain_id: chainId };
                      size++;
                    }
                    if (transactionsData.length < pageSize / 10) {
                      if (isMountedRef.current) {
                        setTransactionsPageEnd(true);
                      }
                      break;
                    }
                  }
                  else {
                    if (isMountedRef.current) {
                      setTransactionsPageEnd(true);
                    }
                    break;
                  }
                }
              } catch (err) {}
            }
          }
          if (size < 1) {
            for (let i = 0; i <= (page < 0 ? 0 : page); i++) {
              try {
                if (page > 2 && i < page) {
                  size += pageSize / 10;
                }
                else {
                  let transactionsData = await getAddressTransfers(chainId, address, { 'contract-address': address, 'page-number': i, 'page-size': pageSize / 10 });
                  transactionsData = transactionsData && !transactionsData.error && transactionsData.data && transactionsData.data.items ? transactionsData.data.items : null;
                  if (transactionsData) {
                    for (let j = 0; j < transactionsData.length; j++) {
                      newData[size] = { ...transactionsData[j], address, chain_id: chainId };
                      size++;
                    }
                    if (transactionsData.length < pageSize / 10) {
                      if (isMountedRef.current) {
                        setTransactionsPageEnd(true);
                      }
                      break;
                    }
                  }
                  else {
                    if (isMountedRef.current) {
                      setTransactionsPageEnd(true);
                    }
                    break;
                  }
                }
              } catch (err) {}
            }
          }
        }
        newData.length = size;
        if (isMountedRef.current) {
          if (size !== 0) {
            setTransactions(newData.length > 0 ? newData : null);
          }
          setTransactionsLoading(false);
        }
      }
    };
    if (loaded) {
      getTransactions(transactionsPage);
    }
  }, [isMountedRef, chainId, address, data, transactions, assetTypeSelected, transactionsPage, loaded]);

  if (redirectPath) {
    if (window.location && window.location.pathname === redirectPath) {
      if (redirectPath.startsWith('/explorer/')) {
        window.location.reload();
      }
      setRedirectPath(null);
    }
    return (<Redirect to={redirectPath} />);
  }
  const currencyData = _.head(_.uniq(currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === currency), 'id'));
  let filteredData = data && data.map(d => {
    const coinIndex = allCryptoData && allCryptoData.coins ? allCryptoData.coins.findIndex((c, i) => (i < 200 && c.symbol && d.contract_ticker_symbol && c.symbol.toLowerCase() === d.contract_ticker_symbol.toLowerCase()) || (c.name && d.contract_name && c.name.toLowerCase() === d.contract_name.toLowerCase()) || (c.id && d.contract_name && c.id.toLowerCase() === d.contract_name.toLowerCase())) : -1;
    const coinData = coinIndex > -1 ? { ...allCryptoData.coins[coinIndex], rank: coinIndex + 1 } : null;
    return { ...d, balance: Number(d.balance), coin: coinData };
  }).filter(d => d.address === address && d.chain_id === chainId && (assetTypeSelected === 'nft' ? d.type === assetTypeSelected : d.type !== 'nft'));
  filteredData = filteredData && filteredData.filter((d, i) => d.balance > 0 || (filteredData.findIndex(dd => dd.balance > 0) < 0 && i < 3));
  const filteredTransactionsData = transactions && transactions.map((d, i) => {
    d.index = i;
    d.value = typeof d.value === 'number' ? d.value : Number(d.value);
    d.transaction_fee = typeof d.gas_quote === 'number' && typeof d.gas_quote_rate === 'number' ? d.gas_quote / d.gas_quote_rate : null;
    d.from_address_label = d.transfers && d.transfers.findIndex(t => t.from_address_label) > -1 ? d.transfers[d.transfers.findIndex(t => t.from_address_label)].from_address_label : d.from_address_label;
    d.to_address_label = d.transfers && d.transfers.findIndex(t => t.to_address_label) > -1 ? d.transfers[d.transfers.findIndex(t => t.to_address_label)].to_address_label : d.to_address_label;
    return d;
  }).filter((d, i) => (assetTypeSelected === 'nft' ? d.type === 'nft' : d.type !== 'nft') && d.address === address && d.chain_id === chainId && (!transactionsSearch || (d.from_address && d.from_address.toLowerCase().indexOf(transactionsSearch.toLowerCase()) > -1) || (d.from_address_label && d.from_address_label.toLowerCase().indexOf(transactionsSearch.toLowerCase()) > -1) || (d.to_address && d.to_address.toLowerCase().indexOf(transactionsSearch.toLowerCase()) > -1) || (d.to_address_label && d.to_address_label.toLowerCase().indexOf(transactionsSearch.toLowerCase()) > -1)));
  const sortedTransactionsData = _.orderBy(filteredTransactionsData, [transactionsSort.field || 'index'], [transactionsSort.direction]);
  const settings = {
    className: `center mt-0 mb-${width <= 575 ? 5 : 4}`,
    centerMode: true,
    dots: true,
    arrows: false,
    infinite: true,
    speed: 1000,
    centerPadding: 0,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 8500,
  };
  const viewMoreSize = width <= 575 ? 4 : width <= 991 ? 6 : 8;
  return (
    <Fragment>
      <Container fluid={true}>
        <Row>
          <Col xs="12">
            <Card className="bg-transparent border-0 px-0 px-lg-3 mx-0 mx-lg-1" style={{ boxShadow: 'none' }}>
              <CardHeader className="bg-transparent pt-0 pb-2 px-0">
                {address && (
                  <Row>
                    <Col xl="10" lg="10" md="8" xs="6">
                      <h1 className="mb-0">
                        <div className={`${width <= 575 ? 'f-14' : width <= 991 ? 'f-18' : 'f-20'} mb-2`} style={{ lineHeight: '1.25' }}>{`${contractData && contractData.length > 0 ? 'Contract' : 'Address'} Details`}</div>
                      </h1>
                    </Col>
                    <Col xl="2" lg="2" md="4" xs="6">
                      <Nav className="nav-pills nav-primary d-flex align-items-center justify-content-end">
                        {['asset', 'nft'].map(t => (
                          <NavItem key={t} style={{ maxWidth: width <= 575 ? 'fit-content' : '' }}>
                            <NavLink onClick={() => { setAssetTypeSelected(t); setViewMore(false); setTransactionsPage(0); setTransactionsPageEnd(false); }} className={`${assetTypeSelected === t ? 'active' : ''}${width <= 991 ? ' f-12' : ''} py-1 px-2`}>
                              {getName(t, true)}
                            </NavLink>
                          </NavItem>
                        ))}
                      </Nav>
                    </Col>
                  </Row>
                )}
              </CardHeader>
              <CardBody className="pt-4 pb-3 px-1">
                {!data ?
                  <Error404 />
                  :
                  data.length > 0 || (contractData && contractData.length > 0) ?
                    <>
                      <Row className="mb-3">
                        {contractData && contractData.length > 0 && (
                          <Col xl="12" lg="12" md="12" xs="12" className="mb-3">
                            <div className="d-flex align-items-center">
                              <div className="avatar">
                                <Media body className="img-50" src={contractData[0].logo_url} alt="" />
                              </div>
                              <div className="ml-3">
                                <div className="f-16 f-w-500 d-flex align-items-center">
                                  {contractData[0].contract_name}
                                  {contractData[0].prices.findIndex(p => typeof p.price === 'number') > -1 && [contractData[0].prices[contractData[0].prices.findIndex(p => typeof p.price === 'number')]].map((p, i) => (
                                    <Badge key={i} color="primary" pill className="f-10 f-w-100 ml-2">
                                      {currencyData && currencyData.symbol}
                                      {numberOptimizeDecimal(numeral(p.price).format(p.price > 1.01 ? '0,0.00' : '0,0.0000000000'))}
                                    </Badge>
                                  ))}
                                </div>
                                {contractData[0].contract_ticker_symbol && (<Badge color="light" pill className="f-12 f-w-100">{contractData[0].contract_ticker_symbol}</Badge>)}
                              </div>
                            </div>
                          </Col>
                        )}
                        <Col xl="6" lg="6" md="7" xs="12">
                          <div className="d-inline-flex align-items-center" style={{ overflowWrap: 'anywhere' }}>
                            <div className="f-w-500 text-info mr-2" style={{ minWidth: 'fit-content' }}>{"Address:"}</div>
                            <CopyToClipboard text={address}>
                              <div onClick={() => { message.destroy(); message.success('Copied'); }} className="f-14 f-w-300 d-flex align-items-center" style={{ cursor: 'pointer' }}>
                                <Tooltip placement="top" title={<div className="text-center" style={{ marginTop: '.125rem' }}>{address}</div>} overlayClassName="f-10 f-w-200" overlayStyle={{ minWidth: 'fit-content' }}>
                                  {width <= 991 && address.length > 13 ? `${address.substring(0, 6)}...${address.substring(address.length - 7)}` : address}
                                </Tooltip>
                                <Badge color="light" pill className="f-12 ml-2"><Copy /></Badge>
                              </div>
                            </CopyToClipboard>
                          </div>
                        </Col>
                        <Col xl="6" lg="6" md="5" xs="12" className="text-left text-md-right mt-2 mt-md-0">
                          <div className="h-100 d-inline-flex align-items-center" style={{ overflowWrap: 'anywhere' }}>
                            <div className="f-w-500 text-info mr-2" style={{ minWidth: 'fit-content' }}>{`${assetTypeSelected === 'nft' ? 'Amount' : 'Balance'}:`}</div>
                            <div className="text-primary">
                              {assetTypeSelected === 'nft' ?
                                <>
                                  {filteredData ? numeral(filteredData.length).format('0,0') : '-'}
                                  &nbsp;{"NFT(s)"}
                                </>
                                :
                                <>
                                  {currencyData && currencyData.symbol}
                                  {numberOptimizeDecimal(numeral(_.sumBy(filteredData, 'quote')).format(_.sumBy(filteredData, 'quote') > 1.01 ? '0,0.00' : '0,0.0000000000'))}
                                </>
                              }
                            </div>
                          </div>
                        </Col>
                      </Row>
                      {loading && !(filteredData && filteredData.length > 0) && (<div className="loader-box"><Spinner /></div>)}
                      <Row>
                        {filteredData && filteredData.filter((d, i) => viewMore || i < viewMoreSize).map((d, i) => (
                          <Col key={i} xl="3" lg="4" md="6" xs="12" className="mb-3 mb-md-4">
                            {assetTypeSelected === 'nft' && d.nft_data ?
                              <Slider {...settings}>
                                {d.nft_data.map((nft, j) => (
                                  <div key={j} className="carousel-item">
                                    <Card className="border-0 mb-0" style={{ boxShadow: 'none' }}>
                                      <CardBody className="text-center p-0">
                                        <div className="p-3" style={{ minHeight: width > 1200 ? '157px' : '' }}>
                                          <div className="text-left">
                                            <h1 className="f-12">
                                              <Link to={d.contract_address ? `/explorer/${chain}/${d.contract_address}` : d.coin && d.coin.id ? `/coin/${d.coin.id}` : `/explorer/${chain}/${d.contract_address}`} target="_blank">{d.contract_name}</Link>
                                              {d.contract_ticker_symbol && (<div className="f-10 f-w-300 text-secondary mt-1">{d.contract_ticker_symbol.toUpperCase()}</div>)}
                                            </h1>
                                          </div>
                                          <div className="avatar mt-3">
                                            <a href={nft.external_data ? nft.external_data.image ? nft.external_data.image : nft.external_data.external_url ? nft.external_data.external_url : nft.token_url : nft.token_url} target="_blank" rel="noopener noreferrer">
                                              <Media body className="w-100 mx-auto" src={nft.external_data ? nft.external_data.image : null} alt={nft.external_data && nft.external_data.name} />
                                            </a>
                                          </div>
                                        </div>
                                        <div className="text-center pb-3">
                                          <div className="h2 f-16 mb-0 px-2 position-relative" style={{ zIndex: 2 }}>
                                            {nft.external_data && nft.external_data.name ? <a href={nft.token_url} target="_blank" rel="noopener noreferrer"><div title={nft.external_data.name} style={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', whiteSpace: 'pre-wrap', overflow: 'hidden' }}>{nft.external_data.name}</div></a> : '-'}
                                            {nft.external_data && nft.external_data.description && (<div title={nft.external_data.description} className="f-12 f-w-300 text-info mt-2" style={{ display: '-webkit-box', WebkitLineClamp: '5', WebkitBoxOrient: 'vertical', whiteSpace: 'pre-wrap', overflow: 'hidden' }}>{nft.external_data.description}</div>)}
                                          </div>
                                          <div className="d-flex align-items-top mt-3 px-4 position-relative" style={{ zIndex: 2 }}>
                                            <div className="h3 f-14 mt-1 mb-0">
                                              {"Token ID"}
                                            </div>
                                            <div className="f-12 text-right ml-auto">
                                              <div className="f-16 f-w-500 mb-1">
                                                {nft.token_id ?
                                                  <>
                                                    {"#"}
                                                    {nft.token_id}
                                                  </>
                                                  :
                                                  <span className="f-w-300 text-info">{"N/A"}</span>
                                                }
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </CardBody>
                                    </Card>
                                  </div>
                                ))}
                              </Slider>
                              :
                              <Card className="border-0 mb-0" style={{ boxShadow: 'none' }}>
                                <CardBody className="text-center p-0">
                                  <div className="d-flex align-items-center p-4" style={{ minHeight: width > 1200 ? '157px' : '' }}>
                                    <div className="avatar w-25 text-left">
                                      <Link to={d.coin && d.coin.id ? `/coin/${d.coin.id}` : `/explorer/${chain}/${d.contract_address}`} target="_blank"><Media body className="img-80" src={d.logo_url ? d.logo_url : d.coin && d.coin.large ? d.coin.large : null} alt="" /></Link>
                                    </div>
                                    <div className="w-75 text-right ml-2 pl-1">
                                      <h1 className="f-20">
                                        <Link to={d.coin && d.coin.id ? `/coin/${d.coin.id}` : `/explorer/${chain}/${d.contract_address}`} target="_blank">{d.contract_name}</Link>
                                        {d.contract_ticker_symbol && (<div className="f-16 f-w-300 text-secondary mt-1">{d.contract_ticker_symbol.toUpperCase()}</div>)}
                                      </h1>
                                      <div className="f-12 text-info">
                                        {typeof d.quote_rate === 'number' ?
                                          <>{currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(d.quote_rate).format(d.quote_rate > 1.01 ? '0,0.00' : '0,0.0000000000'))}</>
                                          :
                                          '-'
                                        }
                                      </div>
                                    </div>
                                  </div>
                                  {assetTypeSelected !== 'nft' && (
                                    <div className="text-center pb-3">
                                      <div className="h2 f-16 mb-0 position-relative" style={{ zIndex: 2 }}>
                                        {numberOptimizeDecimal(numeral(d.balance * Math.pow(10, -1 * d.contract_decimals)).format(d.balance * Math.pow(10, -1 * d.contract_decimals) > 1.01 ? '0,0.00' : '0,0.0000000000'))}
                                        {typeof d.quote === 'number' && (<div className="f-12 text-primary mt-1">{typeof d.quote_rate === 'number' ? <>({currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(d.quote).format(d.quote > 1.01 ? '0,0.00' : '0,0.0000000000'))})</> : '-'}</div>)}
                                      </div>
                                      <div className="d-flex align-items-top mt-3 px-4 position-relative" style={{ zIndex: 2 }}>
                                        <div className="h3 f-16 mt-1 mb-0">
                                          {"Market Cap"}
                                        </div>
                                        <div className="f-12 text-right ml-auto">
                                          <div className="f-18 f-w-500 mb-1">
                                            {d.coin && (typeof d.coin.market_cap_rank === 'number' || typeof d.coin.rank === 'number') ?
                                              <>
                                                {"#"}
                                                {numberOptimizeDecimal(numeral(Number(d.coin.market_cap_rank || d.coin.rank)).format('0,0'))}
                                              </>
                                              :
                                              <span className="f-w-300 text-info">{"N/A"}</span>
                                            }
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </CardBody>
                              </Card>
                            }
                          </Col>
                        ))}
                        {filteredData && filteredData.length > viewMoreSize && (
                          <Col xl="12" lg="12" md="12" xs="12" className="d-flex align-items-center">
                            <div onClick={() => setViewMore(!viewMore)} className="f-w-500 text-secondary d-flex align-items-center mx-auto" style={{ cursor: 'pointer' }}>
                              {`See ${viewMore ? 'Less' : 'More'}`}{viewMore ? <ChevronUp className="ml-2" /> : <ChevronDown className="ml-2" />}
                            </div>
                          </Col>
                        )}
                      </Row>
                      {(true || (transactions && transactions.length > 0)) && (
                        <div className="mt-4 mb-2 px-0 px-lg-4">
                          <div ref={tableRef} className="p-absolute" style={{ marginTop: width <= 345 ? '-138px' : width <= 575 ? '-116px' : width <= 907 ? '-121px' : width <= 991 ? '-99px' : width <= 1200 ? '-119px' : '-81px' }} />
                          <div className="d-flex align-items-center pt-3 px-2">
                            <h1 className={`f-${width <= 575 ? '12' : width <= 991 ? '14' : '18'} d-flex align-items-center my-auto mr-2`}>{chainData && chainData.logo_url && (<div className="avatar mr-2"><Media body className="img-20" src={chainData.logo_url} alt="" /></div>)}{"Transactions"}</h1>
                            <span className="d-flex align-items-center ml-auto"><Search /><Input type="text" value={transactionsSearch} onChange={e => setTransactionsSearch(e.target.value)} placeholder="Search" className="b-r-6 f-14 ml-2" style={{ maxWidth: 'max-content' }} /></span>
                          </div>
                          <div className="markets-table responsive-tbl mt-3">
                            <div className="table-responsive">
                              <Table borderless>
                                <thead>
                                  <tr>
                                    <th
                                      onClick={() => setTransactionsSort({ field: 'index', direction: (!transactionsSort.field || transactionsSort.field === 'index') && transactionsSort.direction === 'desc' ? 'asc' : 'desc' })}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      {"Txn Hash"}
                                      {transactionsSort.field === 'index' && (
                                        <>
                                          {transactionsSort.direction === 'desc' ?
                                            <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                            :
                                            <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                          }
                                        </>
                                      )}
                                    </th>
                                    <th
                                      onClick={() => setTransactionsSort({ field: 'successful', direction: transactionsSort.field === 'successful' && transactionsSort.direction === 'desc' ? 'asc' : 'desc' })}
                                      className={`${transactionsSort.field === 'successful' ? 'bg-light' : ''}`}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      {"Status"}
                                      {transactionsSort.field === 'successful' && (
                                        <>
                                          {transactionsSort.direction === 'desc' ?
                                            <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                            :
                                            <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                          }
                                        </>
                                      )}
                                    </th>
                                    <th
                                      onClick={() => setTransactionsSort({ field: 'block_signed_at', direction: transactionsSort.field === 'block_signed_at' && transactionsSort.direction === 'desc' ? 'asc' : 'desc' })}
                                      className={`${transactionsSort.field === 'block_signed_at' ? 'bg-light' : ''}`}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      {"Time"}
                                      {transactionsSort.field === 'block_signed_at' && (
                                        <>
                                          {transactionsSort.direction === 'desc' ?
                                            <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                            :
                                            <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                          }
                                        </>
                                      )}
                                    </th>
                                    <th
                                      onClick={() => setTransactionsSort({ field: 'block_height', direction: transactionsSort.field === 'block_height' && transactionsSort.direction === 'desc' ? 'asc' : 'desc' })}
                                      className={`${transactionsSort.field === 'block_height' ? 'bg-light' : ''}`}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      {"Block"}
                                      {transactionsSort.field === 'block_height' && (
                                        <>
                                          {transactionsSort.direction === 'desc' ?
                                            <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                            :
                                            <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                          }
                                        </>
                                      )}
                                    </th>
                                    <th
                                      onClick={() => setTransactionsSort({ field: 'from_address', direction: transactionsSort.field === 'from_address' && transactionsSort.direction === 'desc' ? 'asc' : 'desc' })}
                                      className={`${transactionsSort.field === 'from_address' ? 'bg-light' : ''}`}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      {"From"}
                                      {transactionsSort.field === 'from_address' && (
                                        <>
                                          {transactionsSort.direction === 'desc' ?
                                            <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                            :
                                            <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                          }
                                        </>
                                      )}
                                    </th>
                                    <th
                                      onClick={() => setTransactionsSort({ field: 'to_address', direction: transactionsSort.field === 'to_address' && transactionsSort.direction === 'desc' ? 'asc' : 'desc' })}
                                      className={`${transactionsSort.field === 'to_address' ? 'bg-light' : ''}`}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      {"To"}
                                      {transactionsSort.field === 'to_address' && (
                                        <>
                                          {transactionsSort.direction === 'desc' ?
                                            <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                            :
                                            <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                          }
                                        </>
                                      )}
                                    </th>
                                    <th
                                      onClick={() => setTransactionsSort({ field: 'value', direction: transactionsSort.field === 'value' && transactionsSort.direction === 'desc' ? 'asc' : 'desc' })}
                                      className={`text-right ${transactionsSort.field === 'value' ? 'bg-light' : ''}`}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      {"Value"}
                                      {transactionsSort.field === 'value' && (
                                        <>
                                          {transactionsSort.direction === 'desc' ?
                                            <ChevronDown className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                            :
                                            <ChevronUp className="table-sort-direction w-auto text-secondary ml-1" style={{ height: '1rem', verticalAlign: 'middle', marginBottom: '2px' }} />
                                          }
                                        </>
                                      )}
                                    </th>
                                    <th
                                      onClick={() => setTransactionsSort({ field: 'transaction_fee', direction: transactionsSort.field === 'transaction_fee' && transactionsSort.direction === 'desc' ? 'asc' : 'desc' })}
                                      className={`text-right ${transactionsSort.field === 'transaction_fee' ? 'bg-light' : ''}`}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      {"Transaction Fee"}
                                      {transactionsSort.field === 'transaction_fee' && (
                                        <>
                                          {transactionsSort.direction === 'desc' ?
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
                                  {!(transactionsLoading && !(sortedTransactionsData && sortedTransactionsData.length > 0)) && sortedTransactionsData.map((d, i) => (
                                    <tr key={i}>
                                      <td>
                                        <div className="d-inline-flex align-items-center">
                                          {d.tx_hash ?
                                            <>
                                              <Tooltip placement="top" title={<div className="text-center" style={{ marginTop: '.125rem' }}>{d.tx_hash}</div>} overlayClassName="f-10 f-w-200" overlayStyle={{ minWidth: 'fit-content' }}>
                                                <Link to={`/explorer/${chain}/tx/${d.tx_hash}`}>
                                                  {d.tx_hash.length > 16 ? `${d.tx_hash.substring(0, 9)}...${d.tx_hash.substring(d.tx_hash.length - 10)}` : d.tx_hash}
                                                </Link>
                                              </Tooltip>
                                              <CopyToClipboard text={d.tx_hash}>
                                                <div onClick={() => { message.destroy(); message.success('Copied'); }} className="f-12 f-w-300 d-flex align-items-center" style={{ cursor: 'pointer' }}>
                                                  <Badge color="light" pill className="f-12 ml-2"><Copy /></Badge>
                                                </div>
                                              </CopyToClipboard>
                                            </>
                                            :
                                            'N/A'
                                          }
                                        </div>
                                      </td>
                                      <td className={`f-12 f-w-300 ${transactionsSort.field === 'successful' ? 'bg-light' : ''}`}>
                                        <Badge color={d.successful ? 'success' : 'danger'} pill className="f-10 text-white">{d.successful ? <CheckCircle className="mr-1" /> : <XCircle className="mr-1" />}{d.successful ? 'Success' : 'Failed'}</Badge>
                                      </td>
                                      <td className={`font-roboto f-12 f-w-300 text-secondary ${transactionsSort.field === 'block_signed_at' ? 'bg-light' : ''}`}>
                                        {moment(d.block_signed_at).fromNow()}<br /><span className="f-w-200 text-info">({moment(d.block_signed_at).format('MMM D, YYYY LTS')})</span>
                                      </td>
                                      <td className={`f-12 f-w-300 ${transactionsSort.field === 'block_height' ? 'bg-light' : ''}`}>
                                        {d.block_height}
                                      </td>
                                      <td className={`${transactionsSort.field === 'from_address' ? 'bg-light' : ''}`}>
                                        <div className="d-inline-flex align-items-center">
                                          {d.from_address ?
                                            <>
                                              <Tooltip placement="top" title={<div className="text-center" style={{ marginTop: '.125rem' }}>{d.from_address}{d.from_address_label && (<><br /><span className="f-w-500">({d.from_address_label})</span></>)}</div>} overlayClassName="f-10 f-w-200" overlayStyle={{ minWidth: 'fit-content' }}>
                                                <Link to={`/explorer/${chain}/${d.from_address}`}>
                                                  {d.from_address.length > 13 ? `${d.from_address.substring(0, 6)}...${d.from_address.substring(d.from_address.length - 7)}` : d.from_address}
                                                </Link>
                                              </Tooltip>
                                              <CopyToClipboard text={d.from_address}>
                                                <div onClick={() => { message.destroy(); message.success('Copied'); }} className="f-12 f-w-300 d-flex align-items-center" style={{ cursor: 'pointer' }}>
                                                  <Badge color="light" pill className="f-12 ml-2"><Copy /></Badge>
                                                </div>
                                              </CopyToClipboard>
                                            </>
                                            :
                                            'N/A'
                                          }
                                        </div>
                                        {d.from_address_label && (<div className="f-12 f-w-200 text-info">{d.from_address_label}</div>)}
                                      </td>
                                      <td className={`${transactionsSort.field === 'to_address' ? 'bg-light' : ''}`}>
                                        <div className="d-inline-flex align-items-center">
                                          {d.to_address ?
                                            <>
                                              <Tooltip placement="top" title={<div className="text-center" style={{ marginTop: '.125rem' }}>{d.to_address}{d.to_address_label && (<><br /><span className="f-w-500">({d.to_address_label})</span></>)}</div>} overlayClassName="f-10 f-w-200" overlayStyle={{ minWidth: 'fit-content' }}>
                                            <Link to={`/explorer/${chain}/${d.to_address}`}>
                                              {d.to_address.length > 13 ? `${d.to_address.substring(0, 6)}...${d.to_address.substring(d.to_address.length - 7)}` : d.to_address}
                                            </Link>
                                              </Tooltip>
                                              <CopyToClipboard text={d.to_address}>
                                                <div onClick={() => { message.destroy(); message.success('Copied'); }} className="f-12 f-w-300 d-flex align-items-center" style={{ cursor: 'pointer' }}>
                                                  <Badge color="light" pill className="f-12 ml-2"><Copy /></Badge>
                                                </div>
                                              </CopyToClipboard>
                                            </>
                                            :
                                            'N/A'
                                          }
                                        </div>
                                        {d.to_address_label && (<div className="f-12 f-w-200 text-info">{d.to_address_label}</div>)}
                                      </td>
                                      <td className={`text-right f-12 f-w-300 ${transactionsSort.field === 'value' ? 'bg-light' : ''}`}>
                                        <Badge color="light" pill className="f-12">{numberOptimizeDecimal(numeral(convert(Number(d.value), 'wei', 'ether')).format('0,0.0000000000'))}&nbsp;{chainData && chainData.unit}</Badge>
                                        {typeof d.value_quote === 'number' && (<div className="text-info">({currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(d.value_quote).format(d.value_quote > 1.01 ? '0,0.00' : '0,0.0000000000'))})</div>)}
                                      </td>
                                      <td className={`text-right f-12 f-w-300 ${transactionsSort.field === 'transaction_fee' ? 'bg-light' : ''}`}>
                                        {typeof d.transaction_fee === 'number' ? <>{numberOptimizeDecimal(numeral(d.transaction_fee).format(d.transaction_fee > 1.01 ? '0,0.00' : '0,0.0000000000'))}&nbsp;{chainData && chainData.unit}</> : 'N/A'}
                                        {typeof d.gas_quote === 'number' && (<div className="text-info">({currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(d.gas_quote).format(d.gas_quote > 1.01 ? '0,0.00' : '0,0.0000000000'))})</div>)}
                                        <div className="f-10 text-info">
                                          {"Gas Price:"} {convert(d.gas_price, 'wei', 'gwei')}&nbsp;{(chainData && chainData.gas_unit) || 'Gwei'}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                              {transactionsLoading && !(sortedTransactionsData && sortedTransactionsData.length > 0) && (<div className="loader-box"><Spinner /></div>)}
                              {transactions && transactions.length % (pageSize / 10) === 0 && !transactionsPageEnd && (<div className="text-center mt-3"><Button color="primary-2x" outline disabled={transactionsLoading} onClick={() => setTransactionsPage(transactionsPage + 1)}>{transactionsLoading ? 'Loading...' : 'See more'}</Button></div>)}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                    :
                    !loading ?
                      address ?
                        <NotFound message={<>Sorry, We are unable to locate this Address:<br /><span className="f-14 text-info">{address}</span>{chainData && chainData.altExplorerUrl && (<div className="f-12 f-w-300 text-info mt-2">{"Find more information on "}<a href={chainData.altExplorerUrl.replace('{address}', address)} target="_blank" rel="noopener noreferrer" className="f-w-500">{new URL(chainData.altExplorerUrl).hostname}</a></div>)}</>} />
                        :
                        <Row className="mt-4">
                          {chainData && (
                            <Col lg="6" md="12" xs="12" className="text-center mt-4 mx-auto">
                              <Media body className="img-100 mb-4" src={chainData.logo_url} alt="" />
                              <div className="f-18 mb-0">{"Search address or transaction on"} <span className="f-w-500">{chainData.title}</span> <span className="f-14 f-w-300 text-info">({getName(chainData.network, true)})</span></div>
                              <AntInput.Search
                                enterButton
                                placeholder="Search by Address / Txn Hash"
                                onSearch={value => {
                                  if (value) {
                                    setRedirectPath(`/explorer/${chain}${value && value.length > 40 && value.length < 45 ? '' : '/tx'}/${value}`);
                                  }
                                }}
                                className="w-75 mt-3 pt-3"
                              />
                              <div className="f-12 f-w-300 d-flex align-items-center justify-content-center mt-2 mx-auto">
                                {"Data taken from"}
                                <a href="https://covalenthq.com/" target="_blank" rel="noopener noreferrer" className="d-flex align-items-center ml-1">
                                  {theme === 'dark-only' ?
                                    <img src="https://www.covalenthq.com/static/images/covalent-logo-tri.svg" alt="" className="for-dark img-fluid ml-1" style={{ height: '20px' }} />
                                    :
                                    <>
                                      <img src="https://www.covalenthq.com/static/images/covalent-logomark.png" alt="" className="for-light img-fluid mx-1" style={{ height: '22px' }} />
                                      {"Covalent"}
                                    </>
                                  }
                                </a>
                              </div>
                            </Col>
                          )}
                        </Row>
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

export default Address;
