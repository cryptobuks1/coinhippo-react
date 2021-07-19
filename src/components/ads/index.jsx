import React, { Fragment, useState, useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { VS_CURRENCY } from '../../redux/types';
import { Card, CardBody, Media, Badge, Button } from 'reactstrap';
import AdSense from 'react-adsense';
import Slider from 'react-slick';
import _ from 'lodash';
import numeral from 'numeral';
import { getExchanges } from '../../api';
import { useIsMountedRef, cex, dex, numberOptimizeDecimal, exchangeReferrals } from '../../utils';

const Ads = props => {
  const pageSize = 20;
  const isMountedRef = useIsMountedRef();
  const [path, setPath] = useState(null);
  const [adsList] = useState(_.slice(Object.keys(exchangeReferrals).filter(e => exchangeReferrals[e].id && exchangeReferrals[e].code).map(e => exchangeReferrals[e]), 0, 7));
  const [exchangesData, setExchangesData] = useState([]);
  const currency = useSelector(content => content.Preferences[VS_CURRENCY]);
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
      }
    };
    getData();
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, currency, exchangesData]);

  const settings = {
    className: 'center m-0',
    centerMode: true,
    dots: false,
    arrows: false,
    infinite: true,
    speed: 1500,
    centerPadding: 0,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6500,
  };

  if (window.location && path !== window.location.pathname) {
    if (isMountedRef.current) {
      setPath(window.location.pathname);
    }
  }

  return (
    <Fragment>
      {props.square ?
        <AdSense.Google client={process.env.REACT_APP_ADSENSE_CLIENT} slot={process.env.REACT_APP_ADSENSE_SQUARE_SLOT} layout="display" format="auto" responsive="true" />
        :
        props.horizontal ?
          <AdSense.Google client={process.env.REACT_APP_ADSENSE_CLIENT} slot={process.env.REACT_APP_ADSENSE_HORIZONTAL_SLOT} layout="display" format={width > 768 ? 'horizontal' : 'auto'} responsive={width > 768 ? 'false' : 'true'} className="d-inline-block" style={{ width: 728, height: 90 }} />
          :
          <Card className="offer-box border-0 m-0" style={{ boxShadow: 'none' }}>
            <CardBody className="p-0">
              <div>
                <div className="carousel slide" data-ride="carousel">
                  <div className="carousel-inner">
                  <Slider {...settings}>
                    {adsList.filter(ads => !props.noExchanges).map((ads, i) => {
                      const e = exchangesData && exchangesData.findIndex(e => e.id === ads.id) > -1 && exchangesData[exchangesData.findIndex(e => e.id === ads.id)];
                      if (!e) {
                        return exchangesData.length === 0 && (<div key={i} className="carousel-item p-4" />);
                      }
                      else {
                        e.trade_volume_24h_btc = !isNaN(e.trade_volume_24h_btc) && typeof e.trade_volume_24h_btc === 'string' ? Number(e.trade_volume_24h_btc) : e.trade_volume_24h_btc;
                      }
                      return (
                        <div key={i} className={`carousel-item card box-shadow-0 border-0 m-0 p-${width <= 575 ? 2 : width <= 1200 ? 3 : 4}`}>
                          <div className="d-flex align-items-center">
                            <div className={`w-100 f-${width <= 1200 ? e.name.length > 20 || e.name.indexOf(' ') > -1 ? 12 : e.name.length > 10 ? 14 : 18 : e.name.length > 20 ? 18 : e.name.length > 10 ? 20 : 24} f-w-500 d-flex align-items-center`}>
                              <Link to={`/exchange/${e.id}`} className="d-flex align-items-center pr-1" style={{ maxWidth: '50%' }}>
                                {e.image && (<div className="avatar mr-2"><Media body className="img-50" src={e.image.replace('small', 'large')} alt={!e.image.startsWith('missing_') ? e.name : ''} /></div>)}
                                <div className={`ml-${width <= 575 ? 1 : width <= 1200 ? 2 : 3}`}>
                                  {e.name}
                                  {dex.indexOf(e.id) > -1 ?
                                    <div className="f-10 text-info">{"Decentralized"}</div>
                                    :
                                    cex.indexOf(e.id) > -1 ?
                                      <div className="f-10 text-info">{"Centralized"}</div>
                                      :
                                      null
                                  }
                                </div>
                              </Link>
                              <div className={`f-${width <= 1200 ? 14 : 16} mx-auto`}>
                                <div className="d-flex align-items-center">{"Volume"}<Badge color="light" pill className="f-10 text-secondary f-w-300 ml-1">24h</Badge></div>
                                {(typeof e.trade_volume_24h_btc === 'number' || typeof e.trade_volume_24h_btc === 'string') && (<div className={`f-${width <= 1200 ? 12 : 14} text-info mt-1`}>{numberOptimizeDecimal(numeral(Number(e.trade_volume_24h_btc)).format(Number(e.trade_volume_24h_btc) > 1 ? '0,0' : '0,0.00'))}&nbsp;{"BTC"}</div>)}
                              </div>
                              <div className="ml-auto pl-2" style={{ display: 'grid' }}>
                                {e.url && (<a href={e.url} target="_blank" rel="noopener noreferrer"><Button color="primary" className={`px-${width <= 1200 ? 2 : 3}`}>{width <= 1200 ? <>{"Trade"}&nbsp;{"Now"}</> : 'Start Trading Now'}</Button></a>)}
                                {ads.discount_commission_percent > 0 && (<Badge color="warning" pill className="f-12 f-w-300 mt-1 ml-auto">{width <= 575 ? 'Fee -' : 'Discount Fee '}{numeral(ads.discount_commission_percent / 100).format('0,0%')}</Badge>)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }).filter(ads => ads)}
                  </Slider>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
      }
    </Fragment>
  );
};

export default Ads;
