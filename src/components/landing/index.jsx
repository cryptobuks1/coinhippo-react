import React, { Fragment, useState, useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { VS_CURRENCY, ALL_CRYPTO_DATA, EXCHANGE_RATES_DATA } from '../../redux/types';
import { Container, Row, Col, Card, CardHeader, CardBody, Media, Badge, Table, Progress, ButtonGroup, Button } from 'reactstrap';
import { Tooltip } from 'antd';
import SweetAlert from 'sweetalert2';
import Chart from 'react-apexcharts';
import LazyLoad from 'react-lazyload';
import Slider from 'react-slick';
import { MoreHorizontal, Info, ExternalLink } from 'react-feather';
import _ from 'lodash';
import moment from 'moment';
import numeral from 'numeral';
import Spinner from '../spinner';
import ConfigDB from '../../data/customizer/config';
import { currenciesGroups } from '../../layout/header/menus';
import coingecko from '../../assets/images/logo/api/CoinGecko Logo.png';
import { getFearAndGreed, getTrendingSearch, getCoinsMarkets, getDerivatives, getExchanges, getDerivativesExchanges } from '../../api';
import { useIsMountedRef, sleep, affiliateData, cex, dex, getName, numberOptimizeDecimal } from '../../utils';

const timesSelection = [
  { day: 0, title: 'Today' },
  { day: 1, title: 'Yesterday' },
  { day: 7, title: 'Last Week' },
  { day: 30, title: 'Last Month' },
];

const Landing = props => {
  const pageSize = 10;
  const isMountedRef = useIsMountedRef();
  const currency = useSelector(content => content.Preferences[VS_CURRENCY]);
  const allCryptoData = useSelector(content => content.Data[ALL_CRYPTO_DATA]);
  const exchangeRatesData = useSelector(content => content.Data[EXCHANGE_RATES_DATA]);

  const [fearAndGreed, setFearAndGreed] = useState([]);
  const [fearAndGreedLoading, setFearAndGreedLoading] = useState(null);
  const [fearAndGreedTime, setFearAndGreedTime] = useState(0);
  const [trendingSearch, setTrendingSearch] = useState({});
  const [trendingCoinsData, setTrendingCoinsData] = useState([]);
  const [trendingCoinsLoading, setTrendingCoinsLoading] = useState(null);
  const [marketCapData, setMarketCapData] = useState([]);
  const [marketCapLoading, setMarketCapLoading] = useState(null);
  const [marketCapBy, setMarketCapBy] = useState('market_cap');
  const [highVolumeData, setHighVolumeData] = useState([]);
  const [highVolumeLoading, setHighVolumeLoading] = useState(null);
  const [defiData, setDefiData] = useState([]);
  const [defiLoading, setDefiLoading] = useState(null);
  const [nftsData, setNftsData] = useState([]);
  const [nftsLoading, setNftsLoading] = useState(null);
  const [bscData, setBscData] = useState([]);
  const [bscLoading, setBscLoading] = useState(null);
  const [polkadotData, setPolkadotData] = useState([]);
  const [polkadotLoading, setPolkadotLoading] = useState(null);
  const [perpetualsData, setPerpetualsData] = useState([]);
  const [perpetualsLoading, setPerpetualsLoading] = useState(null);
  const [futuresData, setFuturesData] = useState([]);
  const [futuresLoading, setFuturesLoading] = useState(null);
  const [exchangesData, setExchangesData] = useState([]);
  const [exchangesLoading, setExchangesLoading] = useState(null);
  const [dexData, setDexData] = useState([]);
  const [dexLoading, setDexLoading] = useState(null);
  const [derivativesData, setDerivativesData] = useState([]);
  const [derivativesLoading, setDerivativesLoading] = useState(null);

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
        setFearAndGreedLoading(true);
      }
      try {
        const fearAndGreedData = await getFearAndGreed({ limit: 31 });
        if (fearAndGreedData && fearAndGreedData.data) {
          if (isMountedRef.current) {
            setFearAndGreed(fearAndGreedData.data);
          }
        }
      } catch (err) {}
      if (isMountedRef.current) {
        setFearAndGreedLoading(false);
      }
    };
    getData();
    const interval = setInterval(() => getData(), 120 * Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef]);

  useEffect(() => {
    const getData = async () => {
      if (isMountedRef.current) {
        setTrendingCoinsLoading(true);
      }
      let trendingSearchData = null;
      const newData = trendingCoinsData ? trendingCoinsData : [];
      let size = 0;
      try {
        trendingSearchData = await getTrendingSearch();
        if (trendingSearchData && !trendingSearchData.error) {
          if (isMountedRef.current) {
            setTrendingSearch(trendingSearchData);
          }
          if (trendingSearchData.coins && trendingSearchData.coins.length > 0) {
            let data = await getCoinsMarkets({ vs_currency: currency, ids: trendingSearchData.coins.map(c => c.item && c.item.id).join(','), order: 'market_cap_desc', per_page: pageSize, page: 1, sparkline: true, price_change_percentage: '24h' });
            data = data && !data.error ? data : null;
            if (data) {
              for (let j = 0; j < data.length; j++) {
                newData[size] = data[j];
                size++;
              }
            }
          }
        }
      } catch (err) {}
      newData.length = size;
      if (isMountedRef.current) {
        if (size !== 0) {
          setTrendingCoinsData(newData.length > 0 ? newData : null);
        }
        setTrendingCoinsLoading(false);
      }
    };
    getData();
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, currency, trendingCoinsData]);

  useEffect(() => {
    const getData = async () => {
      if (isMountedRef.current) {
        setMarketCapLoading(true);
      }
      const newData = marketCapData ? marketCapData : [];
      let size = 0;
      try {
        let data = await getCoinsMarkets({ vs_currency: currency, order: 'market_cap_desc', per_page: pageSize, page: 1, sparkline: true, price_change_percentage: '24h' });
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
          setMarketCapData(newData.length > 0 ? newData : null);
        }
        setMarketCapLoading(false);
      }
    };
    getData();
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, currency, marketCapData]);

  useEffect(() => {
    const getData = async () => {
      if (isMountedRef.current) {
        setHighVolumeLoading(true);
      }
      const newData = highVolumeData ? highVolumeData : [];
      let size = 0;
      try {
        await sleep(1000);
        let data = await getCoinsMarkets({ vs_currency: currency, order: 'volume_desc', per_page: pageSize * 2, page: 1, price_change_percentage: '24h' });
        data = data && !data.error ? data : null;
        if (data) {
          const filteredData = data.filter(c => typeof c.market_cap_rank === 'number');
          for (let j = 0; j < filteredData.length; j++) {
            newData[size] = filteredData[j];
            size++;
            if (size === pageSize) {
              break;
            }
          }
        }
      } catch (err) {}
      newData.length = size;
      if (isMountedRef.current) {
        if (size !== 0) {
          setHighVolumeData(newData.length > 0 ? newData : null);
        }
        setHighVolumeLoading(false);
      }
    };
    getData();
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, currency, highVolumeData]);

  useEffect(() => {
    const getData = async () => {
      if (isMountedRef.current) {
        setDefiLoading(true);
      }
      const newData = defiData ? defiData : [];
      let size = 0;
      try {
        let data = await getCoinsMarkets({ vs_currency: currency, category: 'decentralized-finance-defi', order: 'market_cap_desc', per_page: pageSize, page: 1, sparkline: true, price_change_percentage: '24h' });
        data = data && !data.error ? data : null;
        if (data) {
          for (let j = 0; j < data.length; j++) {
            newData[size] = data[j];
            size++;
            if (size === pageSize) {
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
      }
    };
    getData();
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, currency, defiData]);

  useEffect(() => {
    const getData = async () => {
      if (isMountedRef.current) {
        setNftsLoading(true);
      }
      const newData = nftsData ? nftsData : [];
      let size = 0;
      try {
        let data = await getCoinsMarkets({ vs_currency: currency, category: 'non-fungible-tokens-nft', order: 'market_cap_desc', per_page: pageSize, page: 1, sparkline: true, price_change_percentage: '24h' });
        data = data && !data.error ? data : null;
        if (data) {
          for (let j = 0; j < data.length; j++) {
            newData[size] = data[j];
            size++;
            if (size === pageSize) {
              break;
            }
          }
        }
      } catch (err) {}
      newData.length = size;
      if (isMountedRef.current) {
        if (size !== 0) {
          setNftsData(newData.length > 0 ? newData : null);
        }
        setNftsLoading(false);
      }
    };
    getData();
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, currency, nftsData]);

  useEffect(() => {
    const getData = async () => {
      if (isMountedRef.current) {
        setBscLoading(true);
      }
      const newData = bscData ? bscData : [];
      let size = 0;
      try {
        let data = await getCoinsMarkets({ vs_currency: currency, category: 'binance-smart-chain', order: 'market_cap_desc', per_page: pageSize, page: 1, sparkline: true, price_change_percentage: '24h' });
        data = data && !data.error ? data : null;
        if (data) {
          for (let j = 0; j < data.length; j++) {
            newData[size] = data[j];
            size++;
            if (size === pageSize) {
              break;
            }
          }
        }
      } catch (err) {}
      newData.length = size;
      if (isMountedRef.current) {
        if (size !== 0) {
          setBscData(newData.length > 0 ? newData : null);
        }
        setBscLoading(false);
      }
    };
    getData();
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, currency, bscData]);

  useEffect(() => {
    const getData = async () => {
      if (isMountedRef.current) {
        setPolkadotLoading(true);
      }
      const newData = polkadotData ? polkadotData : [];
      let size = 0;
      try {
        let data = await getCoinsMarkets({ vs_currency: currency, category: 'dot-ecosystem', order: 'market_cap_desc', per_page: pageSize, page: 1, sparkline: true, price_change_percentage: '24h' });
        data = data && !data.error ? data : null;
        if (data) {
          for (let j = 0; j < data.length; j++) {
            newData[size] = data[j];
            size++;
            if (size === pageSize) {
              break;
            }
          }
        }
      } catch (err) {}
      newData.length = size;
      if (isMountedRef.current) {
        if (size !== 0) {
          setPolkadotData(newData.length > 0 ? newData : null);
        }
        setPolkadotLoading(false);
      }
    };
    getData();
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, currency, polkadotData]);

  useEffect(() => {
    const getData = async () => {
      if (isMountedRef.current) {
        setPerpetualsLoading(true);
      }
      const newData = perpetualsData ? perpetualsData : [];
      let size = 0;
      try {
        await sleep(1500);
        let data = await getDerivatives({ include_tickers: 'unexpired' });
        data = data && !data.error ? data : null;
        if (data) {
          for (let i = 0; i < data.length; i++) {
            if (data[i].contract_type === 'perpetual') {
              newData[size] = data[i];
              size++;
              if (size === pageSize) {
                break;
              }
            }
          }
        }
      } catch (err) {}
      newData.length = size;
      if (isMountedRef.current) {
        if (size !== 0) {
          setPerpetualsData(newData.length > 0 ? newData : null);
        }
        setPerpetualsLoading(false);
      }
    };
    getData();
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, currency, perpetualsData]);

  useEffect(() => {
    const getData = async () => {
      if (isMountedRef.current) {
        setFuturesLoading(true);
      }
      const newData = futuresData ? futuresData : [];
      let size = 0;
      try {
        await sleep(1500);
        let data = await getDerivatives({ include_tickers: 'unexpired' });
        data = data && !data.error ? data : null;
        if (data) {
          for (let i = 0; i < data.length; i++) {
            if (data[i].contract_type === 'futures') {
              newData[size] = data[i];
              size++;
              if (size === pageSize) {
                break;
              }
            }
          }
        }
      } catch (err) {}
      newData.length = size;
      if (isMountedRef.current) {
        if (size !== 0) {
          setFuturesData(newData.length > 0 ? newData : null);
        }
        setFuturesLoading(false);
      }
    };
    getData();
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, currency, futuresData]);

  useEffect(() => {
    const getData = async () => {
      if (isMountedRef.current) {
        setExchangesLoading(true);
      }
      const newData = exchangesData ? exchangesData : [];
      let size = 0;
      try {
        let data = await getExchanges({ per_page: pageSize, page: 1 });
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
          setExchangesData(newData.length > 0 ? newData : null);
        }
        setExchangesLoading(false);
      }
    };
    getData();
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, currency, exchangesData]);

  useEffect(() => {
    const getData = async () => {
      if (isMountedRef.current) {
        setDexLoading(true);
      }
      const newData = dexData ? dexData : [];
      let size = 0;
      let sortedData = [];
      for (let i = 0; i <= pageSize; i++) {
        try {
          await sleep(500);
          let data = await getExchanges({ per_page: pageSize * 10, page: i + 1 });
          data = data && !data.error ? data : null;
          if (data) {
            const filteredData = data.filter(d => dex.indexOf(d.id) > -1);
            for (let j = 0; j < filteredData.length; j++) {
              sortedData.push(filteredData[j]);
            }
            if (data.length < pageSize * 10) {
              break;
            }
          }
        } catch (err) {}
      }
      size = sortedData.length < pageSize ? sortedData.length : pageSize; 
      sortedData = _.orderBy(sortedData, ['trade_volume_24h_btc'], ['desc']);
      sortedData.length = size;
      for (let i = 0; i < sortedData.length; i++) {
        newData[i] = sortedData[i];
      }
      newData.length = size;
      if (isMountedRef.current) {
        if (size !== 0) {
          setDexData(newData.length > 0 ? newData : null);
        }
        setDexLoading(false);
      }
    };
    getData();
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, currency, dexData]);

  useEffect(() => {
    const getData = async () => {
      if (isMountedRef.current) {
        setDerivativesLoading(true);
      }
      const newData = derivativesData ? derivativesData : [];
      let size = 0;
      try {
        await sleep(1000);
        let data = await getDerivativesExchanges({ per_page: pageSize, page: 1 });
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
      }
    };
    getData();
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, currency, derivativesData]);

  const currencyData = _.head(_.uniq(currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === currency), 'id'));

  const currencyVolume = 'btc';
  const currencyVolumeData = _.head(_.uniq(currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === currencyVolume), 'id'));

  const currencyDerivativesVolume = 'usd';
  const currencyDerivativesVolumeData = _.head(_.uniq(currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === currencyDerivativesVolume), 'id'));

  const coinCard = (
    <Card className="border-0 mb-0" style={{ boxShadow: 'none' }}>
      <CardBody className="text-center p-0">
        {marketCapLoading && !(marketCapData && marketCapData.length > 0) ?
          <div className="loader-box" style={{ height: '16.9rem' }}>
            <div className="loader-10" />
          </div>
          :
          marketCapData && _.slice(marketCapData, 0, 1).map((d, i) => {
            d.rank = i;
            d.price_change_percentage_24h_in_currency = typeof d.price_change_percentage_24h_in_currency === 'number' ? d.price_change_percentage_24h_in_currency : 0;
            return d;
          }).map((d, i) => (
            <div key={i}>
              <div className="d-flex align-items-center p-4" style={{ minHeight: width > 1200 ? '157px' : '' }}>
                <div className="avatar w-25 text-left">
                  <Link to={`/coin${d.id ? `/${d.id}` : 's'}`}><Media body className="img-80" src={d.image} alt={d.image && !d.image.startsWith('missing_') ? d.name : ''} /></Link>
                </div>
                <div className="w-75 text-right">
                  <h1 className="f-20">
                    <Link to={`/coin${d.id ? `/${d.id}` : 's'}`}>{d.name}</Link>
                    {d.symbol && (<div className="f-16 f-w-300 text-secondary mt-1">{d.symbol.toUpperCase()}</div>)}
                  </h1>
                  <div className={`f-20 ${d.price_change_percentage_24h_in_currency > 0 ? 'font-success' : d.price_change_percentage_24h_in_currency < 0 ? 'font-danger' : ''}`}>
                    {typeof d.price_change_percentage_24h_in_currency === 'number' ?
                      numberOptimizeDecimal(numeral(d.price_change_percentage_24h_in_currency / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(d.price_change_percentage_24h_in_currency / 100).format('+0,0.00%'))
                      :
                      '-'
                    }
                  </div>
                </div>
              </div>
              <div className="text-center pb-3">
                <div className="h2 f-26 mb-0 position-relative" style={{ zIndex: 2 }}>
                  {typeof d.current_price === 'number' && d.current_price >= 0 ?
                    <>
                      {currencyData && currencyData.symbol}
                      {numberOptimizeDecimal(numeral(d.current_price).format(d.current_price > 1 ? '0,0.00' : '0,0.00000000'))}
                      {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                    </>
                    :
                    'N/A'
                  }
                </div>
                <div className="d-flex align-items-top mt-3 px-4 position-relative" style={{ zIndex: 2 }}>
                  <div className="h3 f-16 mt-1 mb-0">
                    {"Market Cap"}
                    <Link to="/coins"><div className="f-12 f-w-300 text-info text-left" style={{ marginTop: '.65rem' }}>{"Coin"}</div></Link>
                  </div>
                  <div className="f-12 text-right ml-auto">
                    {typeof d.market_cap_rank === 'number' && (
                      <div className="f-18 f-w-500 mb-1">
                        {"#"}
                        {numberOptimizeDecimal(numeral(Number(d.market_cap_rank)).format('0,0'))}
                      </div>
                    )}
                    {typeof d.market_cap === 'number' && d.market_cap > 0 ?
                      <>
                        {currencyData && currencyData.symbol}
                        {numberOptimizeDecimal(numeral(Number(d.market_cap)).format(Number(d.market_cap) > 1 ? '0,0' : '0,0.00'))}
                        {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                      </>
                      :
                      'N/A'
                    }
                  </div>
                </div>
                <div className="w-100" style={{ position: 'absolute', marginTop: '-119px' }}>
                  <Chart
                    id="spaline-chart"
                    height={135}
                    type="area"
                    options={{
                      chart: { height: 135, type: 'area', toolbar: { show: false } },
                      dataLabels: { enabled: false },
                      stroke: { curve: 'smooth', width: 0 },
                      xaxis: {
                        show: false,
                        categories: d.sparkline_in_7d && d.sparkline_in_7d.price && d.sparkline_in_7d.price.filter((v, i) => (d.sparkline_in_7d.price.length - i) % (d.sparkline_in_7d.price.length >=8 ? 4 : 1) === 0).map((v, i) => i),
                        labels: { show: false },
                        axisBorder: { show: false },
                        axisTicks: { show: false },
                      },
                      yaxis: { show: false },
                      tooltip: { enabled: false },
                      legend: { show: false },
                      grid: { show: false, padding: { left: 0, right: 0, top: -50, bottom: -40 } },
                      fill: {
                        type: 'gradient',
                        gradient: {
                          shade: 'light',
                          type: 'vertical',
                          shadeIntensity: 0.4,
                          inverseColors: false,
                          opacityFrom: 0.8,
                          opacityTo: 0.2,
                          stops: [0, 100]
                        },
                      },
                      colors:[d.price_change_percentage_24h_in_currency < 0 ? ConfigDB.data.color.secondary_color : '#51bb25'],
                    }}
                    series={[{ name: 'price', data: d.sparkline_in_7d && d.sparkline_in_7d.price ? d.sparkline_in_7d.price.filter((v, i) => (d.sparkline_in_7d.price.length - i) % (d.sparkline_in_7d.price.length >=8 ? 4 : 1) === 0) : [] }]}
                  />
                </div>
              </div>
            </div>
          ))
        }
      </CardBody>
    </Card>
  );

  const defiCard = (
    <Card className="border-0 mb-0" style={{ boxShadow: 'none' }}>
      <CardBody className="text-center p-0">
        {defiLoading && !(defiData && defiData.length > 0) ?
          <div className="loader-box" style={{ height: '16.9rem' }}>
            <div className="loader-10" />
          </div>
          :
          defiData && _.slice(defiData, 0, 1).map((d, i) => {
            d.rank = i;
            d.price_change_percentage_24h_in_currency = typeof d.price_change_percentage_24h_in_currency === 'number' ? d.price_change_percentage_24h_in_currency : 0;
            return d;
          }).map((d, i) => (
            <div key={i}>
              <div className="d-flex align-items-center p-4" style={{ minHeight: width > 1200 ? '157px' : '' }}>
                <div className="avatar w-25 text-left">
                  <Link to={`/coin${d.id ? `/${d.id}` : 's/defi'}`}><Media body className="img-80" src={d.image} alt={d.image && !d.image.startsWith('missing_') ? d.name : ''} /></Link>
                </div>
                <div className="w-75 text-right">
                  <h1 className="f-20">
                    <Link to={`/coin${d.id ? `/${d.id}` : 's/defi'}`}>{d.name}</Link>
                    {d.symbol && (<div className="f-16 f-w-300 text-secondary mt-1">{d.symbol.toUpperCase()}</div>)}
                  </h1>
                  <div className={`f-20 ${d.price_change_percentage_24h_in_currency > 0 ? 'font-success' : d.price_change_percentage_24h_in_currency < 0 ? 'font-danger' : ''}`}>
                    {typeof d.price_change_percentage_24h_in_currency === 'number' ?
                      numberOptimizeDecimal(numeral(d.price_change_percentage_24h_in_currency / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(d.price_change_percentage_24h_in_currency / 100).format('+0,0.00%'))
                      :
                      '-'
                    }
                  </div>
                </div>
              </div>
              <div className="text-center pb-3">
                <div className="h2 f-26 mb-0 position-relative" style={{ zIndex: 2 }}>
                  {typeof d.current_price === 'number' && d.current_price >= 0 ?
                    <>
                      {currencyData && currencyData.symbol}
                      {numberOptimizeDecimal(numeral(d.current_price).format(d.current_price > 1 ? '0,0.00' : '0,0.00000000'))}
                      {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                    </>
                    :
                    'N/A'
                  }
                </div>
                <div className="d-flex align-items-top mt-3 px-4 position-relative" style={{ zIndex: 2 }}>
                  <div className="h3 f-16 mt-1 mb-0">
                    {"Market Cap"}
                    <Link to="/coins/defi"><div className="f-12 f-w-300 text-info text-left" style={{ marginTop: '.65rem' }}>{"DeFi"}</div></Link>
                  </div>
                  <div className="f-12 text-right ml-auto">
                    {typeof d.market_cap_rank === 'number' && (
                      <div className="f-18 f-w-500 mb-1">
                        {"#"}
                        {numberOptimizeDecimal(numeral(Number(d.market_cap_rank)).format('0,0'))}
                      </div>
                    )}
                    {typeof d.market_cap === 'number' && d.market_cap > 0 ?
                      <>
                        {currencyData && currencyData.symbol}
                        {numberOptimizeDecimal(numeral(Number(d.market_cap)).format(Number(d.market_cap) > 1 ? '0,0' : '0,0.00'))}
                        {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                      </>
                      :
                      'N/A'
                    }
                  </div>
                </div>
                <div className="w-100" style={{ position: 'absolute', marginTop: '-119px' }}>
                  <Chart
                    id="spaline-chart"
                    height={135}
                    type="area"
                    options={{
                      chart: { height: 135, type: 'area', toolbar: { show: false } },
                      dataLabels: { enabled: false },
                      stroke: { curve: 'smooth', width: 0 },
                      xaxis: {
                        show: false,
                        categories: d.sparkline_in_7d && d.sparkline_in_7d.price && d.sparkline_in_7d.price.filter((v, i) => (d.sparkline_in_7d.price.length - i) % (d.sparkline_in_7d.price.length >=8 ? 4 : 1) === 0).map((v, i) => i),
                        labels: { show: false },
                        axisBorder: { show: false },
                        axisTicks: { show: false },
                      },
                      yaxis: { show: false },
                      tooltip: { enabled: false },
                      legend: { show: false },
                      grid: { show: false, padding: { left: 0, right: 0, top: -50, bottom: -40 } },
                      fill: {
                        type: 'gradient',
                        gradient: {
                          shade: 'light',
                          type: 'vertical',
                          shadeIntensity: 0.4,
                          inverseColors: false,
                          opacityFrom: 0.8,
                          opacityTo: 0.2,
                          stops: [0, 100]
                        },
                      },
                      colors:[d.price_change_percentage_24h_in_currency < 0 ? ConfigDB.data.color.secondary_color : '#51bb25'],
                    }}
                    series={[{ name: 'price', data: d.sparkline_in_7d && d.sparkline_in_7d.price ? d.sparkline_in_7d.price.filter((v, i) => (d.sparkline_in_7d.price.length - i) % (d.sparkline_in_7d.price.length >=8 ? 4 : 1) === 0) : [] }]}
                  />
                </div>
              </div>
            </div>
          ))
        }
      </CardBody>
    </Card>
  );

  const trendingCard = (
    <Card className="border-0 mb-0" style={{ boxShadow: 'none' }}>
      <CardBody className="text-center p-0">
        {trendingCoinsLoading && !(trendingSearch && trendingSearch.coins && trendingSearch.coins.length > 0) ?
          <div className="loader-box" style={{ height: '16.9rem' }}>
            <div className="loader-10" />
          </div>
          :
          trendingSearch && trendingSearch.coins && _.slice(trendingSearch.coins, 0, 1).map((d, i) => {
            d = { ...d.item };
            d.image = d.large;
            d.rank = i;
            const coinIndex = d.id && trendingCoinsData ? trendingCoinsData.findIndex(c => c.id === d.id) : -1;
            if (coinIndex > -1) {
              d = { ...d, ...trendingCoinsData[coinIndex] };
            }
            return d;
          }).map((d, i) => (
            <div key={i}>
              <div className="d-flex align-items-center p-4" style={{ minHeight: width > 1200 ? '157px' : '' }}>
                <div className="avatar w-25 text-left">
                  <Link to={`/coin${d.id ? `/${d.id}` : 's'}`}><Media body className="img-80" src={d.image} alt={d.image && !d.image.startsWith('missing_') ? d.name : ''} /></Link>
                </div>
                <div className="w-75 text-right">
                  <h1 className="f-20">
                    <Link to={`/coin${d.id ? `/${d.id}` : 's'}`}>{d.name}</Link>
                    {d.symbol && (<div className="f-16 f-w-300 text-secondary mt-1">{d.symbol.toUpperCase()}</div>)}
                  </h1>
                  <div className={`f-20 ${d.price_change_percentage_24h_in_currency > 0 ? 'font-success' : d.price_change_percentage_24h_in_currency < 0 ? 'font-danger' : ''}`}>
                    {typeof d.price_change_percentage_24h_in_currency === 'number' ?
                      numberOptimizeDecimal(numeral(d.price_change_percentage_24h_in_currency / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(d.price_change_percentage_24h_in_currency / 100).format('+0,0.00%'))
                      :
                      '-'
                    }
                  </div>
                </div>
              </div>
              <div className="text-center pb-3">
                <div className="h2 f-26 mb-0 position-relative" style={{ zIndex: 2 }}>
                  {typeof d.current_price === 'number' && d.current_price >= 0 ?
                    <>
                      {currencyData && currencyData.symbol}
                      {numberOptimizeDecimal(numeral(d.current_price).format(d.current_price > 1 ? '0,0.00' : '0,0.00000000'))}
                      {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                    </>
                    :
                    ''//'N/A'
                  }
                </div>
                <div className="d-flex align-items-top mt-3 px-4 position-relative" style={{ zIndex: 2 }}>
                  <div className="h3 f-16 mt-1 mb-0">
                    {"Market Cap"}
                    <a href="https://coingecko.com/discover" target="_blank" rel="noopener noreferrer"><div className="f-12 f-w-300 text-info text-left" style={{ marginTop: '.65rem' }}>{"Trending"}</div></a>
                  </div>
                  <div className="f-12 text-right ml-auto">
                    {typeof d.market_cap_rank === 'number' && (
                      <div className="f-18 f-w-500 mb-1">
                        {"#"}
                        {numberOptimizeDecimal(numeral(Number(d.market_cap_rank)).format('0,0'))}
                      </div>
                    )}
                    {typeof d.market_cap === 'number' && d.market_cap > 0 ?
                      <>
                        {currencyData && currencyData.symbol}
                        {numberOptimizeDecimal(numeral(Number(d.market_cap)).format(Number(d.market_cap) > 1 ? '0,0' : '0,0.00'))}
                        {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                      </>
                      :
                      ''//'N/A'
                    }
                  </div>
                </div>
                <div className="w-100" style={{ position: 'absolute', marginTop: '-119px' }}>
                  <Chart
                    id="spaline-chart"
                    height={135}
                    type="area"
                    options={{
                      chart: { height: 135, type: 'area', toolbar: { show: false } },
                      dataLabels: { enabled: false },
                      stroke: { curve: 'smooth', width: 0 },
                      xaxis: {
                        show: false,
                        categories: d.sparkline_in_7d && d.sparkline_in_7d.price && d.sparkline_in_7d.price.filter((v, i) => (d.sparkline_in_7d.price.length - i) % (d.sparkline_in_7d.price.length >=8 ? 4 : 1) === 0).map((v, i) => i),
                        labels: { show: false },
                        axisBorder: { show: false },
                        axisTicks: { show: false },
                      },
                      yaxis: { show: false },
                      tooltip: { enabled: false },
                      legend: { show: false },
                      grid: { show: false, padding: { left: 0, right: 0, top: -50, bottom: -40 } },
                      fill: {
                        type: 'gradient',
                        gradient: {
                          shade: 'light',
                          type: 'vertical',
                          shadeIntensity: 0.4,
                          inverseColors: false,
                          opacityFrom: 0.8,
                          opacityTo: 0.2,
                          stops: [0, 100]
                        },
                      },
                      colors:[d.price_change_percentage_24h_in_currency < 0 ? ConfigDB.data.color.secondary_color : '#51bb25'],
                    }}
                    series={[{ name: 'price', data: d.sparkline_in_7d && d.sparkline_in_7d.price ? d.sparkline_in_7d.price.filter((v, i) => (d.sparkline_in_7d.price.length - i) % (d.sparkline_in_7d.price.length >=8 ? 4 : 1) === 0) : [] }]}
                  />
                </div>
              </div>
            </div>
          ))
        }
      </CardBody>
    </Card>
  );

  const fearAndGreedCard = (
    <Card className="border-0 mb-0" style={{ boxShadow: 'none' }}>
      <CardBody className="text-center p-0">
        {fearAndGreedLoading && !(fearAndGreed && fearAndGreed.length > 0) ?
          <div className="loader-box" style={{ height: '16.9rem' }}>
            <div className="loader-10" />
          </div>
          :
          <>
            <ButtonGroup className="justify-content-center mt-3 mx-4" style={{ zIndex: 1, paddingTop: '.125rem' }}>
              {timesSelection.map((time, key) => (
                <Button key={key} size="xs" outline={fearAndGreedTime !== time.day} color="primary" onClick={() => setFearAndGreedTime(time.day)}>{time.title}</Button>
              ))}
            </ButtonGroup>
            <Chart
              id="riskfactorchart"
              height={width <= 1200 ? 220 : 240}
              type="radialBar"
              options={{
                chart: { height: width <= 1200 ? 220 : 240, type: 'radialBar', offsetY: 0 },
                plotOptions: {
                  radialBar: {
                    startAngle: -135,
                    endAngle: 135,
                    inverseOrder: true,
                    hollow: {
                      margin: 5,
                      size: '60%',
                      imageWidth: 140,
                      imageHeight: 140,
                      imageClipped: false
                    },
                    track: {
                      opacity: 0.4,
                      colors: ConfigDB.data.color.primary_color
                    },
                    dataLabels: {
                      enabled: false,
                      enabledOnSeries: undefined,
                      formatter: v => `${v}%`,
                      textAnchor: 'middle'
                    }
                  }
                },
                fill: {
                  type: 'gradient',
                  gradient: {
                    shade: 'light',
                    shadeIntensity: 0.15,
                    inverseColors: false,
                    opacityFrom: 1,
                    opacityTo: 1,
                    stops: [0, 100],
                    gradientToColors: ['#a927f9'],
                    type: 'horizontal'
                  }
                },
                stroke: {
                  dashArray: 15,
                  strokecolor: ['#ffffff']
                },
                labels: [fearAndGreed[fearAndGreedTime] ? fearAndGreed[fearAndGreedTime].value_classification : '-'],
                colors: [ConfigDB.data.color.secondary_color],
              }}
              series={[fearAndGreed[fearAndGreedTime] ? Number(fearAndGreed[fearAndGreedTime].value) : 0]}
              style={{ marginTop: '-1rem' }}
            />
            <div className="text-center">
              <h1 className="f-16 font-primary mb-1">{"Fear & Greed Index"}</h1>
              {fearAndGreed[fearAndGreedTime] && (
                <span className="f-14 f-w-400 text-secondary">{moment(Number(fearAndGreed[fearAndGreedTime].timestamp) * 1000).format('D MMM YYYY')}</span>
              )}
              <div className="f-10 text-right mb-1 pt-0 pb-1 px-4">
                <a href="https://alternative.me/crypto" target="_blank" rel="noopener noreferrer">{"alternative.me"}</a>
              </div>
            </div>
          </>
        }
      </CardBody>
    </Card>
  );

  const nftsCard = (
    <Card className="border-0 mb-0" style={{ boxShadow: 'none' }}>
      <CardBody className="text-center p-0">
        {nftsLoading && !(nftsData && nftsData.length > 0) ?
          <div className="loader-box" style={{ height: '16.9rem' }}>
            <div className="loader-10" />
          </div>
          :
          nftsData && _.slice(_.orderBy(nftsData.map(d => { return { ...d, market_cap: typeof d.market_cap === 'number' ? d.market_cap : 0 } }), ['market_cap'], ['desc']), 0, 1).map((d, i) => {
            d.rank = i;
            d.price_change_percentage_24h_in_currency = typeof d.price_change_percentage_24h_in_currency === 'number' ? d.price_change_percentage_24h_in_currency : 0;
            return d;
          }).map((d, i) => (
            <div key={i}>
              <div className="d-flex align-items-center p-4" style={{ minHeight: width > 1200 ? '157px' : '' }}>
                <div className="avatar w-25 text-left">
                  <Link to={`/coin${d.id ? `/${d.id}` : 's/nfts'}`}><Media body className="img-80" src={d.image} alt={d.image && !d.image.startsWith('missing_') ? d.name : ''} /></Link>
                </div>
                <div className="w-75 text-right">
                  <h1 className="f-20">
                    <Link to={`/coin${d.id ? `/${d.id}` : 's/nfts'}`}>{d.name}</Link>
                    {d.symbol && (<div className="f-16 f-w-300 text-secondary mt-1">{d.symbol.toUpperCase()}</div>)}
                  </h1>
                  <div className={`f-20 ${d.price_change_percentage_24h_in_currency > 0 ? 'font-success' : d.price_change_percentage_24h_in_currency < 0 ? 'font-danger' : ''}`}>
                    {typeof d.price_change_percentage_24h_in_currency === 'number' ?
                      numberOptimizeDecimal(numeral(d.price_change_percentage_24h_in_currency / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(d.price_change_percentage_24h_in_currency / 100).format('+0,0.00%'))
                      :
                      '-'
                    }
                  </div>
                </div>
              </div>
              <div className="text-center pb-3">
                <div className="h2 f-26 mb-0 position-relative" style={{ zIndex: 2 }}>
                  {typeof d.current_price === 'number' && d.current_price >= 0 ?
                    <>
                      {currencyData && currencyData.symbol}
                      {numberOptimizeDecimal(numeral(d.current_price).format(d.current_price > 1 ? '0,0.00' : '0,0.00000000'))}
                      {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                    </>
                    :
                    'N/A'
                  }
                </div>
                <div className="d-flex align-items-top mt-3 px-4 position-relative" style={{ zIndex: 2 }}>
                  <div className="h3 f-16 mt-1 mb-0">
                    {"Market Cap"}
                    <Link to="/coins/nfts"><div className="f-12 f-w-300 text-info text-left" style={{ marginTop: '.65rem' }}>{"NFTs"}</div></Link>
                  </div>
                  <div className="f-12 text-right ml-auto">
                    {typeof d.market_cap_rank === 'number' && (
                      <div className="f-18 f-w-500 mb-1">
                        {"#"}
                        {numberOptimizeDecimal(numeral(Number(d.market_cap_rank)).format('0,0'))}
                      </div>
                    )}
                    {typeof d.market_cap === 'number' && d.market_cap > 0 ?
                      <>
                        {currencyData && currencyData.symbol}
                        {numberOptimizeDecimal(numeral(Number(d.market_cap)).format(Number(d.market_cap) > 1 ? '0,0' : '0,0.00'))}
                        {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                      </>
                      :
                      'N/A'
                    }
                  </div>
                </div>
                <div className="w-100" style={{ position: 'absolute', marginTop: '-119px' }}>
                  <Chart
                    id="spaline-chart"
                    height={135}
                    type="area"
                    options={{
                      chart: { height: 135, type: 'area', toolbar: { show: false } },
                      dataLabels: { enabled: false },
                      stroke: { curve: 'smooth', width: 0 },
                      xaxis: {
                        show: false,
                        categories: d.sparkline_in_7d && d.sparkline_in_7d.price && d.sparkline_in_7d.price.filter((v, i) => (d.sparkline_in_7d.price.length - i) % (d.sparkline_in_7d.price.length >=8 ? 4 : 1) === 0).map((v, i) => i),
                        labels: { show: false },
                        axisBorder: { show: false },
                        axisTicks: { show: false },
                      },
                      yaxis: { show: false },
                      tooltip: { enabled: false },
                      legend: { show: false },
                      grid: { show: false, padding: { left: 0, right: 0, top: -50, bottom: -40 } },
                      fill: {
                        type: 'gradient',
                        gradient: {
                          shade: 'light',
                          type: 'vertical',
                          shadeIntensity: 0.4,
                          inverseColors: false,
                          opacityFrom: 0.8,
                          opacityTo: 0.2,
                          stops: [0, 100]
                        },
                      },
                      colors:[d.price_change_percentage_24h_in_currency < 0 ? ConfigDB.data.color.secondary_color : '#51bb25'],
                    }}
                    series={[{ name: 'price', data: d.sparkline_in_7d && d.sparkline_in_7d.price ? d.sparkline_in_7d.price.filter((v, i) => (d.sparkline_in_7d.price.length - i) % (d.sparkline_in_7d.price.length >=8 ? 4 : 1) === 0) : [] }]}
                  />
                </div>
              </div>
            </div>
          ))
        }
      </CardBody>
    </Card>
  );

  const bscCard = (
    <Card className="border-0 mb-0" style={{ boxShadow: 'none' }}>
      <CardBody className="text-center p-0">
        {bscLoading && !(bscData && bscData.length > 0) ?
          <div className="loader-box" style={{ height: '16.9rem' }}>
            <div className="loader-10" />
          </div>
          :
          bscData && _.slice(_.orderBy(bscData.map(d => { return { ...d, market_cap: typeof d.market_cap === 'number' ? d.market_cap : 0 } }), ['market_cap'], ['desc']), 0, 1).map((d, i) => {
            d.rank = i;
            d.price_change_percentage_24h_in_currency = typeof d.price_change_percentage_24h_in_currency === 'number' ? d.price_change_percentage_24h_in_currency : 0;
            return d;
          }).map((d, i) => (
            <div key={i}>
              <div className="d-flex align-items-center p-4" style={{ minHeight: width > 1200 ? '157px' : '' }}>
                <div className="avatar w-25 text-left">
                  <Link to={`/coin${d.id ? `/${d.id}` : 's/bsc'}`}><Media body className="img-80" src={d.image} alt={d.image && !d.image.startsWith('missing_') ? d.name : ''} /></Link>
                </div>
                <div className="w-75 text-right">
                  <h1 className="f-20">
                    <Link to={`/coin${d.id ? `/${d.id}` : 's/bsc'}`}>{d.name}</Link>
                    {d.symbol && (<div className="f-16 f-w-300 text-secondary mt-1">{d.symbol.toUpperCase()}</div>)}
                  </h1>
                  <div className={`f-20 ${d.price_change_percentage_24h_in_currency > 0 ? 'font-success' : d.price_change_percentage_24h_in_currency < 0 ? 'font-danger' : ''}`}>
                    {typeof d.price_change_percentage_24h_in_currency === 'number' ?
                      numberOptimizeDecimal(numeral(d.price_change_percentage_24h_in_currency / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(d.price_change_percentage_24h_in_currency / 100).format('+0,0.00%'))
                      :
                      '-'
                    }
                  </div>
                </div>
              </div>
              <div className="text-center pb-3">
                <div className="h2 f-26 mb-0 position-relative" style={{ zIndex: 2 }}>
                  {typeof d.current_price === 'number' && d.current_price >= 0 ?
                    <>
                      {currencyData && currencyData.symbol}
                      {numberOptimizeDecimal(numeral(d.current_price).format(d.current_price > 1 ? '0,0.00' : '0,0.00000000'))}
                      {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                    </>
                    :
                    'N/A'
                  }
                </div>
                <div className="d-flex align-items-top mt-3 px-4 position-relative" style={{ zIndex: 2 }}>
                  <div className="h3 f-16 mt-1 mb-0">
                    {"Market Cap"}
                    <Link to="/coins/bsc"><div className="f-12 f-w-300 text-info text-left" style={{ marginTop: '.65rem' }}>{"BSC Eco"}</div></Link>
                  </div>
                  <div className="f-12 text-right ml-auto">
                    {typeof d.market_cap_rank === 'number' && (
                      <div className="f-18 f-w-500 mb-1">
                        {"#"}
                        {numberOptimizeDecimal(numeral(Number(d.market_cap_rank)).format('0,0'))}
                      </div>
                    )}
                    {typeof d.market_cap === 'number' && d.market_cap > 0 ?
                      <>
                        {currencyData && currencyData.symbol}
                        {numberOptimizeDecimal(numeral(Number(d.market_cap)).format(Number(d.market_cap) > 1 ? '0,0' : '0,0.00'))}
                        {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                      </>
                      :
                      'N/A'
                    }
                  </div>
                </div>
                <div className="w-100" style={{ position: 'absolute', marginTop: '-119px' }}>
                  <Chart
                    id="spaline-chart"
                    height={135}
                    type="area"
                    options={{
                      chart: { height: 135, type: 'area', toolbar: { show: false } },
                      dataLabels: { enabled: false },
                      stroke: { curve: 'smooth', width: 0 },
                      xaxis: {
                        show: false,
                        categories: d.sparkline_in_7d && d.sparkline_in_7d.price && d.sparkline_in_7d.price.filter((v, i) => (d.sparkline_in_7d.price.length - i) % (d.sparkline_in_7d.price.length >=8 ? 4 : 1) === 0).map((v, i) => i),
                        labels: { show: false },
                        axisBorder: { show: false },
                        axisTicks: { show: false },
                      },
                      yaxis: { show: false },
                      tooltip: { enabled: false },
                      legend: { show: false },
                      grid: { show: false, padding: { left: 0, right: 0, top: -50, bottom: -40 } },
                      fill: {
                        type: 'gradient',
                        gradient: {
                          shade: 'light',
                          type: 'vertical',
                          shadeIntensity: 0.4,
                          inverseColors: false,
                          opacityFrom: 0.8,
                          opacityTo: 0.2,
                          stops: [0, 100]
                        },
                      },
                      colors:[d.price_change_percentage_24h_in_currency < 0 ? ConfigDB.data.color.secondary_color : '#51bb25'],
                    }}
                    series={[{ name: 'price', data: d.sparkline_in_7d && d.sparkline_in_7d.price ? d.sparkline_in_7d.price.filter((v, i) => (d.sparkline_in_7d.price.length - i) % (d.sparkline_in_7d.price.length >=8 ? 4 : 1) === 0) : [] }]}
                  />
                </div>
              </div>
            </div>
          ))
        }
      </CardBody>
    </Card>
  );

  const polkadotCard = (
    <Card className="border-0 mb-0" style={{ boxShadow: 'none' }}>
      <CardBody className="text-center p-0">
        {polkadotLoading && !(polkadotData && polkadotData.length > 0) ?
          <div className="loader-box" style={{ height: '16.9rem' }}>
            <div className="loader-10" />
          </div>
          :
          polkadotData && _.slice(_.orderBy(polkadotData.map(d => { return { ...d, market_cap: typeof d.market_cap === 'number' ? d.market_cap : 0 } }), ['market_cap'], ['desc']), 0, 1).map((d, i) => {
            d.rank = i;
            d.price_change_percentage_24h_in_currency = typeof d.price_change_percentage_24h_in_currency === 'number' ? d.price_change_percentage_24h_in_currency : 0;
            return d;
          }).map((d, i) => (
            <div key={i}>
              <div className="d-flex align-items-center p-4" style={{ minHeight: width > 1200 ? '157px' : '' }}>
                <div className="avatar w-25 text-left">
                  <Link to={`/coin${d.id ? `/${d.id}` : 's/polkadot'}`}><Media body className="img-80" src={d.image} alt={d.image && !d.image.startsWith('missing_') ? d.name : ''} /></Link>
                </div>
                <div className="w-75 text-right">
                  <h1 className="f-20">
                    <Link to={`/coin${d.id ? `/${d.id}` : 's/polkadot'}`}>{d.name}</Link>
                    {d.symbol && (<div className="f-16 f-w-300 text-secondary mt-1">{d.symbol.toUpperCase()}</div>)}
                  </h1>
                  <div className={`f-20 ${d.price_change_percentage_24h_in_currency > 0 ? 'font-success' : d.price_change_percentage_24h_in_currency < 0 ? 'font-danger' : ''}`}>
                    {typeof d.price_change_percentage_24h_in_currency === 'number' ?
                      numberOptimizeDecimal(numeral(d.price_change_percentage_24h_in_currency / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(d.price_change_percentage_24h_in_currency / 100).format('+0,0.00%'))
                      :
                      '-'
                    }
                  </div>
                </div>
              </div>
              <div className="text-center pb-3">
                <div className="h2 f-26 mb-0 position-relative" style={{ zIndex: 2 }}>
                  {typeof d.current_price === 'number' && d.current_price >= 0 ?
                    <>
                      {currencyData && currencyData.symbol}
                      {numberOptimizeDecimal(numeral(d.current_price).format(d.current_price > 1 ? '0,0.00' : '0,0.00000000'))}
                      {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                    </>
                    :
                    'N/A'
                  }
                </div>
                <div className="d-flex align-items-top mt-3 px-4 position-relative" style={{ zIndex: 2 }}>
                  <div className="h3 f-16 mt-1 mb-0">
                    {"Market Cap"}
                    <Link to="/coins/polkadot"><div className="f-12 f-w-300 text-info text-left" style={{ marginTop: '.65rem' }}>{"Polkadot Eco"}</div></Link>
                  </div>
                  <div className="f-12 text-right ml-auto">
                    {typeof d.market_cap_rank === 'number' && (
                      <div className="f-18 f-w-500 mb-1">
                        {"#"}
                        {numberOptimizeDecimal(numeral(Number(d.market_cap_rank)).format('0,0'))}
                      </div>
                    )}
                    {typeof d.market_cap === 'number' && d.market_cap > 0 ?
                      <>
                        {currencyData && currencyData.symbol}
                        {numberOptimizeDecimal(numeral(Number(d.market_cap)).format(Number(d.market_cap) > 1 ? '0,0' : '0,0.00'))}
                        {!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)}
                      </>
                      :
                      'N/A'
                    }
                  </div>
                </div>
                <div className="w-100" style={{ position: 'absolute', marginTop: '-119px' }}>
                  <Chart
                    id="spaline-chart"
                    height={135}
                    type="area"
                    options={{
                      chart: { height: 135, type: 'area', toolbar: { show: false } },
                      dataLabels: { enabled: false },
                      stroke: { curve: 'smooth', width: 0 },
                      xaxis: {
                        show: false,
                        categories: d.sparkline_in_7d && d.sparkline_in_7d.price && d.sparkline_in_7d.price.filter((v, i) => (d.sparkline_in_7d.price.length - i) % (d.sparkline_in_7d.price.length >=8 ? 4 : 1) === 0).map((v, i) => i),
                        labels: { show: false },
                        axisBorder: { show: false },
                        axisTicks: { show: false },
                      },
                      yaxis: { show: false },
                      tooltip: { enabled: false },
                      legend: { show: false },
                      grid: { show: false, padding: { left: 0, right: 0, top: -50, bottom: -40 } },
                      fill: {
                        type: 'gradient',
                        gradient: {
                          shade: 'light',
                          type: 'vertical',
                          shadeIntensity: 0.4,
                          inverseColors: false,
                          opacityFrom: 0.8,
                          opacityTo: 0.2,
                          stops: [0, 100]
                        },
                      },
                      colors:[d.price_change_percentage_24h_in_currency < 0 ? ConfigDB.data.color.secondary_color : '#51bb25'],
                    }}
                    series={[{ name: 'price', data: d.sparkline_in_7d && d.sparkline_in_7d.price ? d.sparkline_in_7d.price.filter((v, i) => (d.sparkline_in_7d.price.length - i) % (d.sparkline_in_7d.price.length >=8 ? 4 : 1) === 0) : [] }]}
                  />
                </div>
              </div>
            </div>
          ))
        }
      </CardBody>
    </Card>
  );

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

  return (
    <Fragment>
      <Container fluid={true}>
        <Row>
          <Col xs="12">
            <Card className="bg-transparent border-0" style={{ boxShadow: 'none' }}>
              {fearAndGreedLoading !== null && trendingCoinsLoading !== null && marketCapLoading !== null && highVolumeLoading !== null && defiLoading !== null && perpetualsLoading !== null && futuresLoading !== null && exchangesLoading !== null && dexLoading !== null && derivativesLoading !== null ?
                <>
                  <Row>
                    {width <= 575 ?
                      <Col xl="3" lg="4" md="6" xs="12">
                        <Slider {...settings}>
                          <div className="carousel-item">
                            {coinCard}
                          </div>
                          <div className="carousel-item">
                            {defiCard}
                          </div>
                          <div className="carousel-item">
                            {nftsCard}
                          </div>
                          <div className="carousel-item">
                            {bscCard}
                          </div>
                          <div className="carousel-item">
                            {polkadotCard}
                          </div>
                          <div className="carousel-item">
                            {fearAndGreedCard}
                          </div>
                        </Slider>
                      </Col>
                      :
                      width <= 1200 ?
                        <>
                          <Col xl="3" lg="4" md="6" xs="12" className="mt-0 mt-md-0 order-1">
                            {coinCard}
                          </Col>
                          <Col xl="3" lg="4" md="6" xs="12" className="mt-3 mt-md-4 mt-lg-4 mt-xl-0 order-2 order-md-3 order-lg-4 order-xl-2">
                            {defiCard}
                          </Col>
                          <Col xl="3" lg="4" md="6" xs="12" className="mt-3 mt-md-4 mt-lg-0 order-3 order-md-7 order-lg-2 order-xl-3">
                            {trendingCard}
                          </Col>
                          <Col xl="3" lg="4" md="6" xs="12" className="mt-3 mt-md-0 mt-lg-0 order-4 order-md-2 order-lg-3 order-xl-4">
                            {fearAndGreedCard}
                          </Col>
                          <Col xl="3" lg="4" md="6" xs="12" className="mt-3 mt-md-4 order-5 order-md-4 order-lg-7 order-xl-5">
                            {nftsCard}
                          </Col>
                          <Col xl="3" lg="4" md="6" xs="12" className="mt-3 mt-md-4 order-6 order-md-5 order-lg-5 order-xl-6">
                            {bscCard}
                          </Col>
                          <Col xl="3" lg="4" md="6" xs="12" className="mt-3 mt-md-4 order-7 order-md-6 order-lg-6 order-xl-7">
                            {polkadotCard}
                          </Col>
                        </>
                        :
                        <>
                          <Col xl="3" lg="4" md="6" xs="12">
                            {coinCard}
                          </Col>
                          <Col xl="3" lg="4" md="6" xs="12">
                            <Slider {...settings}>
                              <div className="carousel-item">
                                {defiCard}
                              </div>
                              <div className="carousel-item">
                                {nftsCard}
                              </div>
                              <div className="carousel-item">
                                {bscCard}
                              </div>
                              <div className="carousel-item">
                                {polkadotCard}
                              </div>
                            </Slider>
                          </Col>
                          <Col xl="3" lg="4" md="6" xs="12">
                            {trendingCard}
                          </Col>
                          <Col xl="3" lg="4" md="6" xs="12">
                            {fearAndGreedCard}
                          </Col>
                        </>
                    }
                  </Row>
                  <Row className="mt-3 mt-md-4">
                    <Col xl="4" lg="6" md="12" xs="12" className="mt-3 mt-md-4 mt-lg-0 order-2 order-lg-1">
                      <Card className="h-100 border-0 mb-0" style={{ boxShadow: 'none' }}>
                        <CardHeader className="top-10-card-header d-flex align-items-center pt-4 pb-3 px-3">
                          <h2 className="f-16">
                            <Link to={`/coins${marketCapBy === 'volume' ? '/high-volume' : ''}`} style={{ color: 'unset', letterSpacing: 0 }}>{"Top 10 Coins by"}</Link>
                            <ButtonGroup className="ml-2">
                              <Button size="xs" outline={marketCapBy !== 'market_cap'} color="primary" onClick={() => setMarketCapBy('market_cap')}>{"Market Cap"}</Button>
                              <Button size="xs" outline={marketCapBy !== 'volume'} color="primary" onClick={() => setMarketCapBy('volume')}>{"Volume"}</Button>
                            </ButtonGroup>
                          </h2>
                          <Link to={`/coins${marketCapBy === 'volume' ? '/high-volume' : ''}`} className="ml-auto"><Tooltip title="See more"><MoreHorizontal /></Tooltip></Link>
                        </CardHeader>
                        <CardBody className="pt-0 pb-2 px-0">
                          <div className="top-10-table table-align-top responsive-tbl">
                            <div className="table-responsive">
                              {marketCapLoading && (marketCapBy === 'volume' ? !(highVolumeData && highVolumeData.length > 0) : !(marketCapData && marketCapData.length > 0)) ?
                                <div className="loader-box" style={{ height: '25rem' }}>
                                  <div className="loader-10" />
                                </div>
                                :
                                <Table borderless>
                                  <thead>
                                    <tr>
                                      <th className="pl-3">{"#"}</th>
                                      <th>{"Coin"}</th>
                                      <th className="text-right" style={{ minWidth: '10rem' }}>{getName(marketCapBy, true)}</th>
                                      <th className="pr-3">
                                        <div className="d-flex align-items-center justify-content-end">
                                          {"Price"}
                                          <Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">24h</Badge>
                                        </div>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(marketCapBy === 'volume' ? (highVolumeData || []) : (marketCapData || [])).map((d, i) => {
                                      d.rank = i;
                                      d.price_change_percentage_24h_in_currency = typeof d.price_change_percentage_24h_in_currency === 'number' ? d.price_change_percentage_24h_in_currency : 0;
                                      return d;
                                    }).map((d, i) => (
                                      <tr key={i}>
                                        <td className="pl-3">{d.rank + 1}</td>
                                        <td>
                                          <Link to={`/coin${d.id ? `/${d.id}` : 's'}`}>
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
                                        <td className="text-right">
                                          {marketCapBy === 'volume' ?
                                            <>
                                              {typeof d.total_volume === 'number' && d.total_volume >= 0 ?
                                                <>
                                                  {currencyData && currencyData.symbol}
                                                  {numberOptimizeDecimal(numeral(Number(d.total_volume)).format(Number(d.total_volume) > 1 ? '0,0' : '0,0.00'))}
                                                  {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                                </>
                                                :
                                                'N/A'
                                              }
                                              {typeof d.market_cap === 'number' && d.market_cap >= 0 && (
                                                <div className="f-10 text-info">
                                                  {"Market Cap: "}
                                                  {currencyData && currencyData.symbol}
                                                  {numberOptimizeDecimal(numeral(Number(d.market_cap)).format(Number(d.market_cap) > 1 ? '0,0' : '0,0.00'))}
                                                  {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                                </div>
                                              )}
                                            </>
                                            :
                                            <>
                                              {typeof d.market_cap === 'number' && d.market_cap > 0 ?
                                                <>
                                                  {currencyData && currencyData.symbol}
                                                  {numberOptimizeDecimal(numeral(Number(d.market_cap)).format(Number(d.market_cap) > 1 ? '0,0' : '0,0.00'))}
                                                  {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                                </>
                                                :
                                                'N/A'
                                              }
                                              {typeof d.total_volume === 'number' && d.total_volume >= 0 && (
                                                <div className="f-10 text-info">
                                                  {"Volume:"}&nbsp;
                                                  {currencyData && currencyData.symbol}
                                                  {numberOptimizeDecimal(numeral(Number(d.total_volume)).format(Number(d.total_volume) > 1 ? '0,0' : '0,0.00'))}
                                                  {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                                </div>
                                              )}
                                            </>
                                          }
                                        </td>
                                        <td className="text-right pr-3">
                                          {typeof d.current_price === 'number' && d.current_price >= 0 ?
                                            <>
                                              {currencyData && currencyData.symbol}
                                              {numberOptimizeDecimal(numeral(d.current_price).format(d.current_price > 1 ? '0,0.00' : '0,0.0000000000'))}
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
                    <Col xl="4" lg="6" md="12" xs="12" className="mt-3 mt-md-4 mt-xl-0 order-3 order-lg-3 order-xl-2">
                      <Card className="h-100 border-0 mb-0" style={{ boxShadow: 'none' }}>
                        <CardHeader className="top-10-card-header d-flex align-items-center pt-4 pb-3 px-3">
                          <h2 className="f-16"><Link to="/exchanges" style={{ color: 'unset', letterSpacing: 0 }}>{"Top 10 Exchanges by Confidence"}</Link></h2>
                          <Link to="/exchanges" className="ml-auto"><Tooltip title="See more"><MoreHorizontal /></Tooltip></Link>
                        </CardHeader>
                        <CardBody className="pt-0 pb-2 px-0">
                          <div className="top-10-table table-align-top responsive-tbl">
                            <div className="table-responsive">
                              {exchangesLoading && !(exchangesData && exchangesData.length > 0) ?
                                <div className="loader-box" style={{ height: '25rem' }}>
                                  <div className="loader-10" />
                                </div>
                                :
                                <Table borderless>
                                  <thead>
                                    <tr>
                                      <th className="pl-3">{"#"}</th>
                                      <th>{"Exchange"}</th>
                                      <th className="text-right">{"Volume"}</th>
                                      <th className="pr-3">
                                        <div className="d-flex align-items-center justify-content-end">
                                          {"Confidence"}
                                          <span onClick={() => SweetAlert.fire(affiliateData)} className="text-info ml-1" style={{ height: '1rem', cursor: 'pointer', marginTop: '-1px' }}><Info style={{ width: '1rem', height: '1rem' }} /></span>
                                        </div>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {exchangesData && exchangesData.map((d, i) => {
                                      d.rank = i;
                                      d.trade_volume_24h_btc = !isNaN(d.trade_volume_24h_btc) && typeof d.trade_volume_24h_btc === 'string' ? Number(d.trade_volume_24h_btc) : d.trade_volume_24h_btc;
                                      return d;
                                    }).map((d, i) => (
                                      <tr key={i} style={{ height: '52px' }}>
                                        <td className="pl-3">{d.rank + 1}</td>
                                        <td>
                                          <Link to={`/exchange${d.id ? `/${d.id}` : 's'}`}>
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
                                          </Link>
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
                                            <Progress color={d.trust_score >=5 ? 'success' : 'danger'} value={typeof d.trust_score === 'number' ? 100 * d.trust_score / 10 : 0} className="progress-confidence w-50 mr-2" />
                                            {typeof d.trust_score === 'number' ? numeral(d.trust_score).format('0,0') : 'N/A'}
                                            {d.url && (
                                              <a href={d.url} target="_blank" rel="noopener noreferrer" className="ml-2"><Tooltip title="Start Trading"><ExternalLink className="mt-1" style={{ width: '1rem' }} /></Tooltip></a>
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
                    <Col xl="4" lg="6" md="12" xs="12" className="mt-0 mt-md-0 mt-xl-0 order-1 order-lg-2 order-xl-3">
                      <Card className="h-100 border-0 mb-0" style={{ boxShadow: 'none' }}>
                        <CardHeader className="top-10-card-header d-flex align-items-center pt-4 pb-3 px-3">
                          <h2 className="f-16"><a href="https://coingecko.com/discover" target="_blank" rel="noopener noreferrer" className="mb-2 ml-auto" style={{ color: 'unset', letterSpacing: 0 }}><span className="f-20">{"🔥"}</span>{" Trending Search"}</a></h2>
                          <a href="https://coingecko.com/discover" target="_blank" rel="noopener noreferrer" className="mb-2 ml-auto"><img src={coingecko} alt="CoinGecko" className="img-fluid mx-1" style={{ height: '22px' }} /></a>
                        </CardHeader>
                        <CardBody className="pt-0 pb-2 px-0">
                          <div className="top-10-table table-align-top responsive-tbl">
                            <div className="table-responsive">
                              {trendingCoinsLoading && !(trendingSearch && trendingSearch.coins && trendingSearch.coins.length > 0) ?
                                <div className="loader-box" style={{ height: '25rem' }}>
                                  <div className="loader-10" />
                                </div>
                                :
                                <Table borderless>
                                  <thead>
                                    <tr>
                                      <th className="pl-3">{"#"}</th>
                                      <th>{"Coin"}</th>
                                      <th className="text-right" style={{ minWidth: '10rem' }}>{"Market Cap"}</th>
                                      <th className="pr-3">
                                        <div className="d-flex align-items-center justify-content-end">
                                          {"Price"}
                                          <Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">24h</Badge>
                                        </div>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {trendingSearch && trendingSearch.coins && trendingSearch.coins.map((d, i) => {
                                      d = { ...d.item };
                                      d.image = d.thumb;
                                      d.rank = i;
                                      const coinIndex = d.id && trendingCoinsData ? trendingCoinsData.findIndex(c => c.id === d.id) : -1;
                                      if (coinIndex > -1) {
                                        d = { ...d, ...trendingCoinsData[coinIndex] };
                                      }
                                      return d;
                                    }).map((d, i) => (
                                      <tr key={i}>
                                        <td className="pl-3">{d.rank + 1}</td>
                                        <td>
                                          <Link to={`/coin${d.id ? `/${d.id}` : 's'}`}>
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
                                        <td className="text-right">
                                          {typeof d.market_cap === 'number' && d.market_cap > 0 ?
                                            <>
                                              <div className="f-w-500">{"Rank #"}{numeral(d.market_cap_rank).format('0,0')}</div>
                                              {currencyData && currencyData.symbol}
                                              {numberOptimizeDecimal(numeral(Number(d.market_cap)).format(Number(d.market_cap) > 1 ? '0,0' : '0,0.00'))}
                                              {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                            </>
                                            :
                                            ''//'N/A'
                                          }
                                          {typeof d.total_volume === 'number' && d.total_volume >= 0 && (
                                            <div className="f-10 text-info">
                                              {"Volume:"}&nbsp;
                                              {currencyData && currencyData.symbol}
                                              {numberOptimizeDecimal(numeral(Number(d.total_volume)).format(Number(d.total_volume) > 1 ? '0,0' : '0,0.00'))}
                                              {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                            </div>
                                          )}
                                        </td>
                                        <td className="text-right pr-3">
                                          {typeof d.current_price === 'number' && d.current_price >= 0 ?
                                            <>
                                              {currencyData && currencyData.symbol}
                                              {numberOptimizeDecimal(numeral(d.current_price).format(d.current_price > 1 ? '0,0.00' : '0,0.0000000000'))}
                                              {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                            </>
                                            :
                                            ''//'N/A'
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
                    <Col xl="4" lg="6" md="12" xs="12" className="mt-3 mt-md-4 order-4 order-lg-5 order-xl-4">
                      <Card className="h-100 border-0 mb-0" style={{ boxShadow: 'none' }}>
                        <CardHeader className="top-10-card-header d-flex align-items-center pt-4 pb-3 px-3">
                          <h2 className="f-16"><Link to="/coins/defi" style={{ color: 'unset', letterSpacing: 0 }}>{"Top 10 DeFi by Market Cap"}</Link></h2>
                          <Link to="/coins/defi" className="ml-auto"><Tooltip title="See more"><MoreHorizontal /></Tooltip></Link>
                        </CardHeader>
                        <CardBody className="pt-0 pb-2 px-0">
                          <div className="top-10-table table-align-top responsive-tbl">
                            <div className="table-responsive">
                              {defiLoading && !(defiData && defiData.length > 0) ?
                                <div className="loader-box" style={{ height: '25rem' }}>
                                  <div className="loader-10" />
                                </div>
                                :
                                <Table borderless>
                                  <thead>
                                    <tr>
                                      <th className="pl-3">{"#"}</th>
                                      <th>{"Coin"}</th>
                                      <th className="text-right">{"Market Cap"}</th>
                                      <th className="pr-3">
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
                                          <Link to={`/coin${d.id ? `/${d.id}` : 's'}`}>
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
                                        <td className="text-right">
                                          {typeof d.market_cap === 'number' && d.market_cap > 0 ?
                                            <>
                                              {currencyData && currencyData.symbol}
                                              {numberOptimizeDecimal(numeral(Number(d.market_cap)).format(Number(d.market_cap) > 1 ? '0,0' : '0,0.00'))}
                                              {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                            </>
                                            :
                                            'N/A'
                                          }
                                          {typeof d.total_volume === 'number' && d.total_volume >= 0 && (
                                            <div className="f-10 text-info">
                                              {"Volume:"}&nbsp;
                                              {currencyData && currencyData.symbol}
                                              {numberOptimizeDecimal(numeral(Number(d.total_volume)).format(Number(d.total_volume) > 1 ? '0,0' : '0,0.00'))}
                                              {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                            </div>
                                          )}
                                        </td>
                                        <td className="text-right pr-3">
                                          {typeof d.current_price === 'number' && d.current_price >= 0 ?
                                            <>
                                              {currencyData && currencyData.symbol}
                                              {numberOptimizeDecimal(numeral(d.current_price).format(d.current_price > 1 ? '0,0.00' : '0,0.0000000000'))}
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
                    <Col xl="4" lg="6" md="12" xs="12" className="mt-3 mt-md-4 order-6 order-lg-4 order-xl-5">
                      <Card className="h-100 border-0 mb-0" style={{ boxShadow: 'none' }}>
                        <CardHeader className="top-10-card-header d-flex align-items-center pt-4 pb-3 px-3">
                          <h2 className="f-16"><Link to="/coins/bsc" className="d-flex align-items-center" style={{ color: 'unset', letterSpacing: 0 }}>{"Top 10 "}<img src="https://bin.bnbstatic.com/static/images/common/favicon.ico" alt="BSC" className="mx-2" style={{ width: '1.5rem' }} />{" BSC by Market Cap"}</Link></h2>
                          <Link to="/coins/bsc" className="ml-auto"><Tooltip title="See more"><MoreHorizontal /></Tooltip></Link>
                        </CardHeader>
                        <CardBody className="pt-0 pb-2 px-0">
                          <div className="top-10-table table-align-top responsive-tbl">
                            <div className="table-responsive">
                              {bscLoading && !(bscData && bscData.length > 0) ?
                                <div className="loader-box" style={{ height: '25rem' }}>
                                  <div className="loader-10" />
                                </div>
                                :
                                <Table borderless>
                                  <thead>
                                    <tr>
                                      <th className="pl-3">{"#"}</th>
                                      <th>{"Coin"}</th>
                                      <th className="text-right">{"Market Cap"}</th>
                                      <th className="pr-3">
                                        <div className="d-flex align-items-center justify-content-end">
                                          {"Price"}
                                          <Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">24h</Badge>
                                        </div>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {bscData && _.slice(_.orderBy(bscData.map(d => { return { ...d, market_cap: typeof d.market_cap === 'number' ? d.market_cap : 0 } }), ['market_cap'], ['desc']), 0, 10).map((d, i) => {
                                      d.rank = i;
                                      d.price_change_percentage_24h_in_currency = typeof d.price_change_percentage_24h_in_currency === 'number' ? d.price_change_percentage_24h_in_currency : 0;
                                      return d;
                                    }).map((d, i) => (
                                      <tr key={i}>
                                        <td className="pl-3">{d.rank + 1}</td>
                                        <td>
                                          <Link to={`/coin${d.id ? `/${d.id}` : 's'}`}>
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
                                        <td className="text-right">
                                          {typeof d.market_cap === 'number' && d.market_cap > 0 ?
                                            <>
                                              {currencyData && currencyData.symbol}
                                              {numberOptimizeDecimal(numeral(Number(d.market_cap)).format(Number(d.market_cap) > 1 ? '0,0' : '0,0.00'))}
                                              {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                            </>
                                            :
                                            'N/A'
                                          }
                                          {typeof d.total_volume === 'number' && d.total_volume >= 0 && (
                                            <div className="f-10 text-info">
                                              {"Volume:"}&nbsp;
                                              {currencyData && currencyData.symbol}
                                              {numberOptimizeDecimal(numeral(Number(d.total_volume)).format(Number(d.total_volume) > 1 ? '0,0' : '0,0.00'))}
                                              {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                            </div>
                                          )}
                                        </td>
                                        <td className="text-right pr-3">
                                          {typeof d.current_price === 'number' && d.current_price >= 0 ?
                                            <>
                                              {currencyData && currencyData.symbol}
                                              {numberOptimizeDecimal(numeral(d.current_price).format(d.current_price > 1 ? '0,0.00' : '0,0.0000000000'))}
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
                    <Col xl="4" lg="6" md="12" xs="12" className="mt-3 mt-md-4 order-7 order-lg-6">
                      <Card className="h-100 border-0 mb-0" style={{ boxShadow: 'none' }}>
                        <CardHeader className="top-10-card-header d-flex align-items-center pt-4 pb-3 px-3">
                          <h2 className="f-16"><Link to="/coins/polkadot" className="d-flex align-items-center" style={{ color: 'unset', letterSpacing: 0 }}>{"Top 10 "}<img src="https://polkadot.network/content/images/2019/05/Polkadot_symbol_color.png" alt="Polkadot" className="mx-1" style={{ width: '1.5rem' }} />{" Polkadot by Market Cap"}</Link></h2>
                          <Link to="/coins/polkadot" className="ml-auto"><Tooltip title="See more"><MoreHorizontal /></Tooltip></Link>
                        </CardHeader>
                        <CardBody className="pt-0 pb-2 px-0">
                          <div className="top-10-table table-align-top responsive-tbl">
                            <div className="table-responsive">
                              {polkadotLoading && !(polkadotData && polkadotData.length > 0) ?
                                <div className="loader-box" style={{ height: '25rem' }}>
                                  <div className="loader-10" />
                                </div>
                                :
                                <Table borderless>
                                  <thead>
                                    <tr>
                                      <th className="pl-3">{"#"}</th>
                                      <th>{"Coin"}</th>
                                      <th className="text-right">{"Market Cap"}</th>
                                      <th className="pr-3">
                                        <div className="d-flex align-items-center justify-content-end">
                                          {"Price"}
                                          <Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">24h</Badge>
                                        </div>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {polkadotData && _.slice(_.orderBy(polkadotData.map(d => { return { ...d, market_cap: typeof d.market_cap === 'number' ? d.market_cap : 0 } }), ['market_cap'], ['desc']), 0, 10).map((d, i) => {
                                      d.rank = i;
                                      d.price_change_percentage_24h_in_currency = typeof d.price_change_percentage_24h_in_currency === 'number' ? d.price_change_percentage_24h_in_currency : 0;
                                      return d;
                                    }).map((d, i) => (
                                      <tr key={i}>
                                        <td className="pl-3">{d.rank + 1}</td>
                                        <td>
                                          <Link to={`/coin${d.id ? `/${d.id}` : 's'}`}>
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
                                        <td className="text-right">
                                          {typeof d.market_cap === 'number' && d.market_cap > 0 ?
                                            <>
                                              {currencyData && currencyData.symbol}
                                              {numberOptimizeDecimal(numeral(Number(d.market_cap)).format(Number(d.market_cap) > 1 ? '0,0' : '0,0.00'))}
                                              {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                            </>
                                            :
                                            'N/A'
                                          }
                                          {typeof d.total_volume === 'number' && d.total_volume >= 0 && (
                                            <div className="f-10 text-info">
                                              {"Volume:"}&nbsp;
                                              {currencyData && currencyData.symbol}
                                              {numberOptimizeDecimal(numeral(Number(d.total_volume)).format(Number(d.total_volume) > 1 ? '0,0' : '0,0.00'))}
                                              {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                            </div>
                                          )}
                                        </td>
                                        <td className="text-right pr-3">
                                          {typeof d.current_price === 'number' && d.current_price >= 0 ?
                                            <>
                                              {currencyData && currencyData.symbol}
                                              {numberOptimizeDecimal(numeral(d.current_price).format(d.current_price > 1 ? '0,0.00' : '0,0.0000000000'))}
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
                    <Col xl="4" lg="6" md="12" xs="12" className="mt-3 mt-md-4 order-5 order-lg-7">
                      <Card className="h-100 border-0 mb-0" style={{ boxShadow: 'none' }}>
                        <CardHeader className="top-10-card-header d-flex align-items-center pt-4 pb-3 px-3">
                          <h2 className="f-16"><Link to="/coins/nfts" style={{ color: 'unset', letterSpacing: 0 }}>{"Top 10 NFTs by Market Cap"}</Link></h2>
                          <Link to="/coins/nfts" className="ml-auto"><Tooltip title="See more"><MoreHorizontal /></Tooltip></Link>
                        </CardHeader>
                        <CardBody className="pt-0 pb-2 px-0">
                          <div className="top-10-table table-align-top responsive-tbl">
                            <div className="table-responsive">
                              {nftsLoading && !(nftsData && nftsData.length > 0) ?
                                <div className="loader-box" style={{ height: '25rem' }}>
                                  <div className="loader-10" />
                                </div>
                                :
                                <Table borderless>
                                  <thead>
                                    <tr>
                                      <th className="pl-3">{"#"}</th>
                                      <th>{"Coin"}</th>
                                      <th className="text-right">{"Market Cap"}</th>
                                      <th className="pr-3">
                                        <div className="d-flex align-items-center justify-content-end">
                                          {"Price"}
                                          <Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">24h</Badge>
                                        </div>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {nftsData && _.slice(_.orderBy(nftsData.map(d => { return { ...d, market_cap: typeof d.market_cap === 'number' ? d.market_cap : 0 } }), ['market_cap'], ['desc']), 0, 10).map((d, i) => {
                                      d.rank = i;
                                      d.price_change_percentage_24h_in_currency = typeof d.price_change_percentage_24h_in_currency === 'number' ? d.price_change_percentage_24h_in_currency : 0;
                                      return d;
                                    }).map((d, i) => (
                                      <tr key={i}>
                                        <td className="pl-3">{d.rank + 1}</td>
                                        <td>
                                          <Link to={`/coin${d.id ? `/${d.id}` : 's'}`}>
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
                                        <td className="text-right">
                                          {typeof d.market_cap === 'number' && d.market_cap > 0 ?
                                            <>
                                              {currencyData && currencyData.symbol}
                                              {numberOptimizeDecimal(numeral(Number(d.market_cap)).format(Number(d.market_cap) > 1 ? '0,0' : '0,0.00'))}
                                              {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                            </>
                                            :
                                            'N/A'
                                          }
                                          {typeof d.total_volume === 'number' && d.total_volume >= 0 && (
                                            <div className="f-10 text-info">
                                              {"Volume:"}&nbsp;
                                              {currencyData && currencyData.symbol}
                                              {numberOptimizeDecimal(numeral(Number(d.total_volume)).format(Number(d.total_volume) > 1 ? '0,0' : '0,0.00'))}
                                              {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                            </div>
                                          )}
                                        </td>
                                        <td className="text-right pr-3">
                                          {typeof d.current_price === 'number' && d.current_price >= 0 ?
                                            <>
                                              {currencyData && currencyData.symbol}
                                              {numberOptimizeDecimal(numeral(d.current_price).format(d.current_price > 1 ? '0,0.00' : '0,0.0000000000'))}
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
                    <Col xl="4" lg="6" md="12" xs="12" className="mt-3 mt-md-4 order-8 order-lg-8">
                      <Card className="h-100 border-0 mb-0" style={{ boxShadow: 'none' }}>
                        <CardHeader className="top-10-card-header d-flex align-items-center pt-4 pb-3 px-3">
                          <h2 className="f-16"><Link to="/exchanges/dex" style={{ color: 'unset', letterSpacing: 0 }}>{"Top 10 DEX by Volume"}</Link></h2>
                          <Link to="/exchanges/dex" className="ml-auto"><Tooltip title="See more"><MoreHorizontal /></Tooltip></Link>
                        </CardHeader>
                        <CardBody className="pt-0 pb-2 px-0">
                          <div className="top-10-table table-align-top responsive-tbl">
                            <div className="table-responsive">
                              {dexLoading && !(dexData && dexData.length > 0) ?
                                <div className="loader-box" style={{ height: '25rem' }}>
                                  <div className="loader-10" />
                                </div>
                                :
                                <Table borderless>
                                  <thead>
                                    <tr>
                                      <th className="pl-3">{"#"}</th>
                                      <th>{"Exchange"}</th>
                                      <th className="text-right">{"Volume"}</th>
                                      <th className="pr-3">
                                        <div className="d-flex align-items-center justify-content-end">
                                          {<>{"Market"}&nbsp;{"Share"}&nbsp;%</>/*"Confidence"*/}
                                          <span onClick={() => SweetAlert.fire(affiliateData)} className="text-info ml-1" style={{ height: '1rem', cursor: 'pointer', marginTop: '-1px' }}><Info style={{ width: '1rem', height: '1rem' }} /></span>
                                        </div>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {dexData && dexData.map((d, i) => {
                                      d.rank = i;
                                      d.trade_volume_24h_btc = !isNaN(d.trade_volume_24h_btc) && typeof d.trade_volume_24h_btc === 'string' ? Number(d.trade_volume_24h_btc) : d.trade_volume_24h_btc;
                                      d.market_share_percentage = typeof d.trade_volume_24h_btc === 'number' ? d.trade_volume_24h_btc / _.sum(dexData.map(d => Number(d.trade_volume_24h_btc))) : null;
                                      return d;
                                    }).map((d, i) => (
                                      <tr key={i} style={{ height: '52px' }}>
                                        <td className="pl-3">{d.rank + 1}</td>
                                        <td>
                                          <Link to={`/exchange${d.id ? `/${d.id}` : 's'}`}>
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
                                          </Link>
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
                                            {/*<Progress color={d.trust_score >=5 ? 'success' : 'danger'} value={typeof d.trust_score === 'number' ? 100 * d.trust_score / 10 : 0} className="progress-confidence w-50 mr-2" />*/}
                                            {/*typeof d.trust_score === 'number' ? numeral(d.trust_score).format('0,0') : 'N/A'*/}
                                            <Progress color="primary" value={typeof d.market_share_percentage === 'number' ? 100 * d.market_share_percentage : 0} className="progress-confidence w-50 mr-2" />
                                            {typeof d.market_share_percentage === 'number' ? numeral(d.market_share_percentage).format('0,0.00%').startsWith('NaN') ? '0.00%' : numeral(d.market_share_percentage).format('0,0.00%') : '-'}
                                            {d.url ?
                                              <a href={d.url} target="_blank" rel="noopener noreferrer" className="ml-2"><Tooltip title="Start Trading"><ExternalLink className="mt-1" style={{ width: '1rem' }} /></Tooltip></a>
                                              :
                                              <Link to={`/exchange/${d.id}`} target="_blank" className="ml-2"><Tooltip title="See more"><ExternalLink className="mt-1" style={{ width: '1rem' }} /></Tooltip></Link>
                                            }
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
                    <Col xl="4" lg="6" md="12" xs="12" className="mt-3 mt-md-4 order-9 order-lg-9">
                      <Card className="h-100 border-0 mb-0" style={{ boxShadow: 'none' }}>
                        <CardHeader className="top-10-card-header d-flex align-items-center pt-4 pb-3 px-3">
                          <h2 className="f-16"><Link to="/exchanges/derivatives" style={{ color: 'unset', letterSpacing: 0 }}>{"Top 10 Derivatives Exchanges"}</Link></h2>
                          <Link to="/exchanges/derivatives" className="ml-auto"><Tooltip title="See more"><MoreHorizontal /></Tooltip></Link>
                        </CardHeader>
                        <CardBody className="pt-0 pb-2 px-0">
                          <div className="top-10-table table-align-top responsive-tbl">
                            <div className="table-responsive">
                              {derivativesLoading && !(derivativesData && derivativesData.length > 0) ?
                                <div className="loader-box" style={{ height: '25rem' }}>
                                  <div className="loader-10" />
                                </div>
                                :
                                <Table borderless>
                                  <thead>
                                    <tr>
                                      <th className="pl-3">{"#"}</th>
                                      <th>{"Exchange"}</th>
                                      <th className="text-right" style={{ minWidth: '7rem' }}>{"Open Interest"}</th>
                                      <th className="text-right">{"Volume"}</th>
                                      <th className="pr-3">
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
                                          <Link to={`/exchange${d.id ? `/${d.id}` : 's'}`}>
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
                                          </Link>
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
                                              <a href={d.url} target="_blank" rel="noopener noreferrer" className="ml-2"><Tooltip title="Start Trading"><ExternalLink className="mt-1" style={{ width: '1rem' }} /></Tooltip></a>
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
                    <Col xl="6" lg="6" md="12" xs="12" className="mt-3 mt-md-4 order-10">
                      <LazyLoad>
                        <Card className="h-100 border-0 mb-0" style={{ boxShadow: 'none' }}>
                          <CardHeader className="top-10-card-header d-flex align-items-center pt-4 pb-3 px-3">
                            <h2 className="f-16"><Link to="/derivatives" style={{ color: 'unset', letterSpacing: 0 }}>{"Top 10 Perpetual Derivatives"}</Link></h2>
                            <Link to="/derivatives" className="ml-auto"><Tooltip title="See more"><MoreHorizontal /></Tooltip></Link>
                          </CardHeader>
                          <CardBody className="pt-0 pb-2 px-0">
                            <div className="top-10-table table-align-top responsive-tbl">
                              <div className="table-responsive">
                                {perpetualsLoading && !(perpetualsData && perpetualsData.length > 0) ?
                                  <div className="loader-box" style={{ height: '25rem' }}>
                                    <div className="loader-10" />
                                  </div>
                                  :
                                  <Table borderless>
                                    <thead>
                                      <tr>
                                        <th className="pl-3">{"#"}</th>
                                        <th>{"Exchange"}</th>
                                        <th>{"Pairs"}</th>
                                        <th className="text-right">{"Volume"}</th>
                                        <th className="pr-3">
                                          <div className="d-flex align-items-center justify-content-end">
                                            {"Price"}
                                            <Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">24h</Badge>
                                          </div>
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {perpetualsData && perpetualsData.map((d, i) => {
                                        d.rank = i;
                                        d.price = !isNaN(d.price) && typeof d.price === 'string' ? Number(d.price) : d.price;
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
                                        if (d.coin_data && d.coin_data.thumb) {
                                          d.coin_data.image = d.coin_data.thumb;
                                        }
                                        const exchangeIndex = d.market && allCryptoData && allCryptoData.exchanges ? allCryptoData.exchanges.findIndex(e => e.name.toLowerCase() === d.market.toLowerCase()) : -1;
                                        d.exchange_data = exchangeIndex > -1 ? allCryptoData.exchanges[exchangeIndex] : null;
                                        if (d.exchange_data && d.exchange_data.thumb) {
                                          d.exchange_data.image = d.exchange_data.thumb;
                                        }
                                        return d;
                                      }).map((d, i) => (
                                        <tr key={i}>
                                          <td className="pl-3">{d.rank + 1}</td>
                                          <td>
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
                                          <td>
                                            {d.coin_data && d.coin_data.image && (
                                              <span className="avatar mr-2">
                                                <Media body className="img-20" src={d.coin_data.image} alt={!d.coin_data.image.startsWith('missing_') ? d.coin_data.name : ''} />
                                              </span>
                                            )}
                                            {d.symbol}
                                          </td>
                                          <td className="text-right">
                                            {typeof d.volume_24h === 'number' || typeof d.volume_24h === 'string' ?
                                              <>
                                                {currencyDerivativesVolumeData && currencyDerivativesVolumeData.symbol}
                                                {numberOptimizeDecimal(numeral(Number(d.volume_24h)).format(Number(d.volume_24h) > 1 ? '0,0' : '0,0.00'))}
                                                {!(currencyDerivativesVolumeData && currencyDerivativesVolumeData.symbol) && (<> {currencyDerivativesVolume.toUpperCase()}</>)}
                                              </>
                                              :
                                              'N/A'
                                            }
                                            {currencyDerivativesVolume !== currency && (typeof d.volume_24h === 'number' || typeof d.volume_24h === 'string') && exchangeRatesData[currencyDerivativesVolume] && typeof exchangeRatesData[currencyDerivativesVolume].value === 'number' && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' && (
                                              <div className="f-10 text-info">
                                                {currencyData && currencyData.symbol}
                                                {numberOptimizeDecimal(numeral(Number(d.volume_24h * exchangeRatesData[currency].value / exchangeRatesData[currencyDerivativesVolume].value)).format(Number(d.volume_24h) > 1 ? '0,0.00' : '0,0.000000'))}
                                                {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                              </div>
                                            )}
                                            {(typeof d.open_interest === 'number' || typeof d.open_interest === 'string') && d.open_interest >= 0 && (
                                              <div className="f-10 text-info">
                                                {"Open Interest: "}
                                                {(typeof d.open_interest === 'number' || typeof d.open_interest === 'string') && d.open_interest >= 0 ?
                                                  <>
                                                    {currencyDerivativesVolumeData && currencyDerivativesVolumeData.symbol}
                                                    {numberOptimizeDecimal(numeral(Number(d.open_interest)).format(Number(d.open_interest) > 1 ? '0,0' : '0,0.00'))}
                                                    {!(currencyDerivativesVolumeData && currencyDerivativesVolumeData.symbol) && (<> {currencyDerivativesVolume.toUpperCase()}</>)}
                                                  </>
                                                  :
                                                  'N/A'
                                                }
                                                {currencyDerivativesVolume !== currency && (typeof d.open_interest === 'number' || typeof d.open_interest === 'string') && d.open_interest >= 0 && exchangeRatesData[currencyDerivativesVolume] && typeof exchangeRatesData[currencyDerivativesVolume].value === 'number' && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' && (
                                                  <div className="f-10 text-info">
                                                    {currencyData && currencyData.symbol}
                                                    {numberOptimizeDecimal(numeral(Number(d.open_interest * exchangeRatesData[currency].value / exchangeRatesData[currencyDerivativesVolume].value)).format(Number(d.open_interest) > 1 ? '0,0.00' : '0,0.000000'))}
                                                    {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </td>
                                          <td className="text-right pr-3">
                                            {typeof d.price === 'number' || typeof d.price === 'string' ?
                                              <>
                                                {currencyDerivativesVolumeData && currencyDerivativesVolumeData.symbol}
                                                {numberOptimizeDecimal(numeral(Number(d.price)).format(Number(d.price) > 1 ? '0,0.00' : '0,0.0000000000'))}
                                                {!(currencyDerivativesVolumeData && currencyDerivativesVolumeData.symbol) && (<> {currencyDerivativesVolume.toUpperCase()}</>)}
                                              </>
                                              :
                                              'N/A'
                                            }
                                            {currencyDerivativesVolume !== currency && (typeof d.price === 'number' || typeof d.price === 'string') && exchangeRatesData[currencyDerivativesVolume] && typeof exchangeRatesData[currencyDerivativesVolume].value === 'number' && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' && (
                                              <div className="f-10 text-info">
                                                {currencyData && currencyData.symbol}
                                                {numberOptimizeDecimal(numeral(Number(d.price * exchangeRatesData[currency].value / exchangeRatesData[currencyDerivativesVolume].value)).format(Number(d.price) > 1 ? '0,0.00' : '0,0.000000'))}
                                                {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                              </div>
                                            )}
                                            {typeof d.price_percentage_change_24h === 'number' && d.price_percentage_change_24h !== 0 && (<div className={`${d.price_percentage_change_24h > 0 ? 'font-success' : d.price_percentage_change_24h < 0 ? 'font-danger' : ''}`}>{numberOptimizeDecimal(numeral(d.price_percentage_change_24h / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(d.price_percentage_change_24h / 100).format('+0,0.00%'))}</div>)}
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
                      </LazyLoad>
                    </Col>
                    <Col xl="6" lg="6" md="12" xs="12" className="mt-3 mt-md-4 order-11">
                      <LazyLoad>
                        <Card className="h-100 border-0 mb-0" style={{ boxShadow: 'none' }}>
                          <CardHeader className="top-10-card-header d-flex align-items-center pt-4 pb-3 px-3">
                            <h2 className="f-16"><Link to="/derivatives/futures" style={{ color: 'unset', letterSpacing: 0 }}>{"Top 10 Futures Derivatives"}</Link></h2>
                            <Link to="/derivatives/futures" className="ml-auto"><Tooltip title="See more"><MoreHorizontal /></Tooltip></Link>
                          </CardHeader>
                          <CardBody className="pt-0 pb-2 px-0">
                            <div className="top-10-table table-align-top responsive-tbl">
                              <div className="table-responsive">
                                {futuresLoading && !(futuresData && futuresData.length > 0) ?
                                  <div className="loader-box" style={{ height: '25rem' }}>
                                    <div className="loader-10" />
                                  </div>
                                  :
                                  <Table borderless>
                                    <thead>
                                      <tr>
                                        <th className="pl-3">{"#"}</th>
                                        <th>{"Exchange"}</th>
                                        <th>{"Pairs"}</th>
                                        <th className="text-right">{"Volume"}</th>
                                        <th className="pr-3">
                                          <div className="d-flex align-items-center justify-content-end">
                                            {"Price"}
                                            <Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">24h</Badge>
                                          </div>
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {futuresData && futuresData.map((d, i) => {
                                        d.rank = i;
                                        d.price = !isNaN(d.price) && typeof d.price === 'string' ? Number(d.price) : d.price;
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
                                        if (d.coin_data && d.coin_data.thumb) {
                                          d.coin_data.image = d.coin_data.thumb;
                                        }
                                        const exchangeIndex = d.market && allCryptoData && allCryptoData.exchanges ? allCryptoData.exchanges.findIndex(e => e.name.toLowerCase() === d.market.toLowerCase()) : -1;
                                        d.exchange_data = exchangeIndex > -1 ? allCryptoData.exchanges[exchangeIndex] : null;
                                        if (d.exchange_data && d.exchange_data.thumb) {
                                          d.exchange_data.image = d.exchange_data.thumb;
                                        }
                                        return d;
                                      }).map((d, i) => (
                                        <tr key={i}>
                                          <td className="pl-3">{d.rank + 1}</td>
                                          <td>
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
                                          <td>
                                            {d.coin_data && d.coin_data.image && (
                                              <span className="avatar mr-2">
                                                <Media body className="img-20" src={d.coin_data.image} alt={!d.coin_data.image.startsWith('missing_') ? d.coin_data.name : ''} />
                                              </span>
                                            )}
                                            {d.symbol}
                                          </td>
                                          <td className="text-right">
                                            {typeof d.volume_24h === 'number' || typeof d.volume_24h === 'string' ?
                                              <>
                                                {currencyDerivativesVolumeData && currencyDerivativesVolumeData.symbol}
                                                {numberOptimizeDecimal(numeral(Number(d.volume_24h)).format(Number(d.volume_24h) > 1 ? '0,0' : '0,0.00'))}
                                                {!(currencyDerivativesVolumeData && currencyDerivativesVolumeData.symbol) && (<> {currencyDerivativesVolume.toUpperCase()}</>)}
                                              </>
                                              :
                                              'N/A'
                                            }
                                            {currencyDerivativesVolume !== currency && (typeof d.volume_24h === 'number' || typeof d.volume_24h === 'string') && exchangeRatesData[currencyDerivativesVolume] && typeof exchangeRatesData[currencyDerivativesVolume].value === 'number' && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' && (
                                              <div className="f-10 text-info">
                                                {currencyData && currencyData.symbol}
                                                {numberOptimizeDecimal(numeral(Number(d.volume_24h * exchangeRatesData[currency].value / exchangeRatesData[currencyDerivativesVolume].value)).format(Number(d.volume_24h) > 1 ? '0,0.00' : '0,0.000000'))}
                                                {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                              </div>
                                            )}
                                            {(typeof d.open_interest === 'number' || typeof d.open_interest === 'string') && d.open_interest >= 0 && (
                                              <div className="f-10 text-info">
                                                {"Open Interest: "}
                                                {(typeof d.open_interest === 'number' || typeof d.open_interest === 'string') && d.open_interest >= 0 ?
                                                  <>
                                                    {currencyDerivativesVolumeData && currencyDerivativesVolumeData.symbol}
                                                    {numberOptimizeDecimal(numeral(Number(d.open_interest)).format(Number(d.open_interest) > 1 ? '0,0' : '0,0.00'))}
                                                    {!(currencyDerivativesVolumeData && currencyDerivativesVolumeData.symbol) && (<> {currencyDerivativesVolume.toUpperCase()}</>)}
                                                  </>
                                                  :
                                                  'N/A'
                                                }
                                                {currencyDerivativesVolume !== currency && (typeof d.open_interest === 'number' || typeof d.open_interest === 'string') && d.open_interest >= 0 && exchangeRatesData[currencyDerivativesVolume] && typeof exchangeRatesData[currencyDerivativesVolume].value === 'number' && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' && (
                                                  <div className="f-10 text-info">
                                                    {currencyData && currencyData.symbol}
                                                    {numberOptimizeDecimal(numeral(Number(d.open_interest * exchangeRatesData[currency].value / exchangeRatesData[currencyDerivativesVolume].value)).format(Number(d.open_interest) > 1 ? '0,0.00' : '0,0.000000'))}
                                                    {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </td>
                                          <td className="text-right pr-3">
                                            {typeof d.price === 'number' || typeof d.price === 'string' ?
                                              <>
                                                {currencyDerivativesVolumeData && currencyDerivativesVolumeData.symbol}
                                                {numberOptimizeDecimal(numeral(Number(d.price)).format(Number(d.price) > 1 ? '0,0.00' : '0,0.0000000000'))}
                                                {!(currencyDerivativesVolumeData && currencyDerivativesVolumeData.symbol) && (<> {currencyDerivativesVolume.toUpperCase()}</>)}
                                              </>
                                              :
                                              'N/A'
                                            }
                                            {currencyDerivativesVolume !== currency && (typeof d.price === 'number' || typeof d.price === 'string') && exchangeRatesData[currencyDerivativesVolume] && typeof exchangeRatesData[currencyDerivativesVolume].value === 'number' && exchangeRatesData[currency] && typeof exchangeRatesData[currency].value === 'number' && (
                                              <div className="f-10 text-info">
                                                {currencyData && currencyData.symbol}
                                                {numberOptimizeDecimal(numeral(Number(d.price * exchangeRatesData[currency].value / exchangeRatesData[currencyDerivativesVolume].value)).format(Number(d.price) > 1 ? '0,0.00' : '0,0.000000'))}
                                                {!(currencyData && currencyData.symbol) && (<> {currency.toUpperCase()}</>)}
                                              </div>
                                            )}
                                            {typeof d.price_percentage_change_24h === 'number' && d.price_percentage_change_24h !== 0 && (<div className={`${d.price_percentage_change_24h > 0 ? 'font-success' : d.price_percentage_change_24h < 0 ? 'font-danger' : ''}`}>{numberOptimizeDecimal(numeral(d.price_percentage_change_24h / 100).format('+0,0.00%')).startsWith('NaN') ? '0.00%' : numberOptimizeDecimal(numeral(d.price_percentage_change_24h / 100).format('+0,0.00%'))}</div>)}
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
                      </LazyLoad>
                    </Col>
                  </Row>
                </>
                :
                <div className="loader-box">
                  <Spinner />
                </div>
              }
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
}

export default Landing;
