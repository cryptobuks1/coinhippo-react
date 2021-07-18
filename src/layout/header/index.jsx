import React, { Fragment, useState, useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row } from 'reactstrap';
import { ArrowUp, ArrowDown } from 'react-feather';
import _ from 'lodash';
import numeral from 'numeral';
import LeftHeader from './leftbar';
import RightHeader from './rightbar';
import { currenciesGroups } from './menus';
import { getGlobal, getAllCrypto, getAllCategories, getExchangeRates, getAllPaprikaCoins, getAllPaprikaExchanges } from '../../api';
import { GLOBAL_DATA, ALL_CRYPTO_DATA, EXCHANGE_RATES_DATA, ALL_PAPRIKA_COINS_DATA, ALL_PAPRIKA_EXCHANGES_DATA } from '../../redux/actionTypes';
import { useIsMountedRef } from '../../utils';

const Header = props => {
  const isMountedRef = useIsMountedRef();
  const currency = useSelector(content => content.Preferences.vs_currency);
  const data = useSelector(content => content.Data.global_data);
  const allCryptoData = useSelector(content => content.Data.all_crypto_data);
  const dispatch = useDispatch();
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
      try {
        let globalData = await getGlobal();
        globalData = globalData && globalData.data ? globalData.data : null;
        if (isMountedRef.current) {
          if (globalData) {
            dispatch({ type: GLOBAL_DATA, payload: globalData });
          }
        }
      } catch (err) {}
    };
    getData();
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, currency, dispatch]);

  useEffect(() => {
    const getData = async () => {
      try {
        let allCryptoData = await getAllCrypto();
        allCryptoData = allCryptoData ? allCryptoData : null;
        if (isMountedRef.current) {
          if (allCryptoData) {
            if (allCryptoData.categories && allCryptoData.categories.length > 0) {
              let allCategories = await getAllCategories();
              allCategories = allCategories ? allCategories : null;
              if (allCategories && allCategories.length > 0) {
                allCryptoData.categories.forEach((c, i) => {
                  const categoryIndex = allCategories.findIndex(cc => cc.name === c.name);
                  if (categoryIndex > -1) {
                    c.category_id = allCategories[categoryIndex].category_id;
                  }
                  allCryptoData.categories[i] = c;
                });
              }
              allCryptoData.categories = allCryptoData.categories.filter(c => c.category_id);
            }
            dispatch({ type: ALL_CRYPTO_DATA, payload: allCryptoData });
          }
        }
      } catch (err) {}
    };
    getData();
    const interval = setInterval(() => getData(), 120 * Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, currency, dispatch]);

  useEffect(() => {
    const getData = async () => {
      try {
        const exchangeRatesData = await getExchangeRates();
        if (isMountedRef.current) {
          if (exchangeRatesData && exchangeRatesData.rates) {
            dispatch({ type: EXCHANGE_RATES_DATA, payload: exchangeRatesData.rates });
          }
        }
      } catch (err) {}
    };
    getData();
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, currency, dispatch]);

  useEffect(() => {
    const getData = async () => {
      try {
        const allPaprikaCoinsData = await getAllPaprikaCoins();
        if (isMountedRef.current) {
          dispatch({ type: ALL_PAPRIKA_COINS_DATA, payload: allPaprikaCoinsData && allPaprikaCoinsData.length > 0 ? allPaprikaCoinsData : [] });
        }
      } catch (err) {}
    };
    getData();
    const interval = setInterval(() => getData(), 120 * Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, currency, dispatch]);

  useEffect(() => {
    const getData = async () => {
      try {
        const allPaprikaExchangesData = await getAllPaprikaExchanges();
        if (isMountedRef.current) {
          dispatch({ type: ALL_PAPRIKA_EXCHANGES_DATA, payload: allPaprikaExchangesData && allPaprikaExchangesData.length > 0 ? allPaprikaExchangesData : [] });
        }
      } catch (err) {}
    };
    getData();
    const interval = setInterval(() => getData(), 120 * Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, currency, dispatch]);

  const currencyData = _.head(_.uniq(currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === currency), 'id'));
  const fontMustSmall = width > 1200 && (width <= 1366 || (/*!(currencyData && currencyData.symbol) && */data && data.total_market_cap && data.total_market_cap[currency] && numeral(data.total_market_cap[currency]).format('0,0').length >= (!(currencyData && currencyData.symbol && currencyData.symbol.length < 2) ? 15 : 18)));
  const globalComponent = data && (
    <div className="d-flex align-items-center" style={{ overflowX: 'auto' }}>
      <p className="mb-0"><span className="f-12 f-w-400 mr-1">{"Coins:"}</span><Link to="/coins">{data.active_cryptocurrencies ? numeral(data.active_cryptocurrencies).format('0,0') : 'N/A'}</Link></p>
      <p className="mb-0 ml-3" style={{ whiteSpace: 'pre' }}><span className="f-12 f-w-400 mr-1">{"Market"}&nbsp;{"Cap:"}</span>
        <span className={`f-w-400 text-info d-inline-flex align-items-center${fontMustSmall ? ' small' : ''}`}>
          <Link to="/coins">
            {data.total_market_cap && data.total_market_cap[currency] ?
              <>
                {currencyData && currencyData.symbol}
                {numeral(data.total_market_cap[currency]).format('0,0')}
                {!(currencyData && currencyData.symbol) && <>&nbsp;{currency.toUpperCase()}</>}
              </>
              :
              'N/A'
            }
          </Link>
          {typeof data.market_cap_change_percentage_24h_usd === 'number' && data.market_cap_change_percentage_24h_usd !== 0 && (<span className={`font-${data.market_cap_change_percentage_24h_usd < 0 ? 'danger' : 'success'} d-inline-flex align-items-center`}>{data.market_cap_change_percentage_24h_usd < 0 ? <ArrowDown style={{ width: '.85rem', marginTop: '-2px' }} /> : <ArrowUp style={{ width: '.85rem', marginTop: '-2px' }} />}{numeral(data.market_cap_change_percentage_24h_usd / 100).format('0,0.00%')}</span>)}
        </span>
      </p>
      <p className="mb-0 ml-3"><span className="f-12 f-w-400 mr-1">{"24h"}&nbsp;{"Vol:"}</span>
        <span className={`f-w-400 text-info${fontMustSmall ? ' small' : ''}`}>
          <Link to="/exchanges">
            {data.total_volume && data.total_volume[currency] ?
              <>
                {currencyData && currencyData.symbol}
                {numeral(data.total_volume[currency]).format('0,0')}
                {!(currencyData && currencyData.symbol) && <>&nbsp;{currency.toUpperCase()}</>}
              </>
              :
              'N/A'
            }
          </Link>
        </span>
      </p>
      <p className="mb-0 ml-3">
        <span className="f-12 f-w-400 mr-1">{"Dominance:"}</span><span className={`f-w-400 text-info${fontMustSmall ? ' small' : ''}`}>
          {data.market_cap_percentage && Object.keys(data.market_cap_percentage).length > 0 ?
            _.slice(_.orderBy(Object.keys(data.market_cap_percentage).map(key => {
              const coinIndex = allCryptoData && allCryptoData.coins ? allCryptoData.coins.findIndex(c => c.symbol && c.symbol.toLowerCase() === key) : -1;
              const url = coinIndex > -1 ? `/coin/${allCryptoData.coins[coinIndex].id}` : null;
              return { id: key, value: data.market_cap_percentage[key], url };
            }).filter(x => typeof x.value === 'number'), ['value'], ['desc']), 0, width <= 575 ? 2 : 2).map((x, i) => (
              <span key={i} className={`${i > 0 ? 'ml-1' : ''}`}>
                {x.url ?
                  <><Link to={x.url}>{x.id.toUpperCase()}</Link>&nbsp;{numeral(x.value / 100).format(`0,0.0${fontMustSmall ? '' : '0'}%`)}</>
                  :
                  <>{x.id.toUpperCase()}&nbsp;{numeral(x.value / 100).format(`0,0.0${fontMustSmall ? '' : '0'}%`)}</>
                }
              </span>
            ))
            :
            'N/A'
          }
        </span>
      </p>
    </div>
  );
  return (
    <Fragment>
      <div className="page-header">
        <Row className="header-wrapper m-0">
          <LeftHeader globalComponent={width > 1200 && globalComponent} />
          <RightHeader />
        </Row>
        {width <= 1200 && (<div className="sub-header-wrapper pb-3 px-3" style={{ marginTop: '-1px' }}>{globalComponent}</div>)}
      </div>
    </Fragment>
  );
};

export default Header;
