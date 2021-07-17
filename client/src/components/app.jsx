import React, { Fragment, useState, useLayoutEffect } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import ReactGA from 'react-ga';
import { ToastContainer } from 'react-toastify';
import CookieConsent from 'react-cookie-consent-notification';
import Loader from '../layout/loader';
import Taptop from '../layout/tap-top';
import Header from '../layout/header';
import Sidebar from '../layout/sidebar';
import SubHeader from '../layout/sub-header';
import Footer from '../layout/footer';
import ThemeCustomize from '../layout/theme-customizer';
import { getCoin, getExchange, getBlog } from '../api';
import { routes } from '../route';
import { /*sleep, */dynamicPaths, getPathHeaderMeta } from '../utils';

const App = ({ children, location, match }) => {
  const animation = useSelector(content => content.Customizer.animation);
  const [locationKey, setLocationKey] = useState(null);
  const [path, setPath] = useState(null);
  const [data, setData] = useState(false);
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
  const getData = async (dataClass, id, sub_id) => {
    switch (dataClass) {
      case 'coin':
        if (id) {
          try {
            const coinData = await getCoin(id, { localization: false, tickers: false, market_data: false, community_data: false, developer_data: false });
            if (coinData || typeof data === 'boolean') {
              setData(coinData);
            }
          } catch (err) {}
        }
        break;
      case 'exchange':
        if (id) {
          try {
            const exchangeData = await getExchange(id);
            if (exchangeData || typeof data === 'boolean') {
              setData(exchangeData);
            }
          } catch (err) {}
        }
        break;
      case 'blog':
        if (id) {
          try {
            const blogData = await getBlog(id, sub_id);
            if (blogData || typeof data === 'boolean') {
              setData(blogData);
            }
          } catch (err) {}
        }
        break;
      default:
        setData(null);
        break;
    }
    //manual get cex & dex
    /*try {
      const exchanges = await getExchange('list');
      if (exchanges && exchanges.length > 0) {
        const cex = [];
        const dex = [];
        for (let i = 0; i < exchanges.length; i++) {
          try {
            const exchange = await getExchange(exchanges[i].id);
            await sleep(1000);
            if (exchange && typeof exchange.centralized === 'boolean') {
              if (exchange.centralized) {
                cex.push(exchanges[i].id);
              }
              else {
                dex.push(exchanges[i].id);
              }
            }
          } catch (err) {}
        }
        if (cex.length > 0) {
          console.log(`cex = ['${cex.join(`','`)}']`);
        }
        if (dex.length > 0) {
          console.log(`dex = ['${dex.join(`','`)}']`);
        }
      }
    } catch (err) {}*/
  };
  if (animation) {
    const pathSplitted = location.pathname.toLowerCase().split('/').filter(x => x && x !== 'widget');
    if (locationKey !== null && !data && typeof data === 'boolean') {
      getData(pathSplitted[0], pathSplitted[1], pathSplitted[2]);
    }
    else if (locationKey !== location.key) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      setLocationKey(location.key);
      setData(false);
    }
    if (window.location && path !== window.location.pathname) {
      if (process.env.REACT_APP_GA_TRACKING_ID) {
        ReactGA.initialize(process.env.REACT_APP_GA_TRACKING_ID);
        ReactGA.pageview(`${location.pathname}${location.search ? location.search : ''}`);
      }
      setPath(window.location.pathname);
    }
  }
  const headerMeta = getPathHeaderMeta(location.pathname, data);
  if (match) {
    if (!match.isExact && routes.filter(route => route.path).findIndex(route => {
      const routeSplited = route.path.split('/').filter(x => x);
      const pathSplited = location.pathname.split('/').filter(x => x);
      if (routeSplited.length !== pathSplited.length) {
        return false;
      }
      return routeSplited.findIndex((x, i) => !(x === pathSplited[i] || x.startsWith(':'))) > -1 ? false : true;
    }) < 0) {
      headerMeta.breadcrumb = null;
    }
  }
  return (
    <Fragment>
      {headerMeta && (
        <Helmet>
          <title>{headerMeta.browser_title}</title>
          <meta name="description" content={headerMeta.description} />
          <meta name="og:site_name" property="og:site_name" content={headerMeta.title} />
          <meta name="og:title" property="og:title" content={headerMeta.title} />
          <meta name="og:description" property="og:description" content={headerMeta.description} />
          <meta name="og:image" property="og:image" content={headerMeta.image} />
          <meta name="og:url" property="og:url" content={headerMeta.url} />
          <meta itemprop="name" content={headerMeta.title} />
          <meta itemprop="description" content={headerMeta.description} />
          <meta itemprop="thumbnailUrl" content={headerMeta.image} />
          <meta itemprop="image" content={headerMeta.image} />
          <meta itemprop="url" content={headerMeta.url} />
          <meta itemprop="headline" content={headerMeta.title} />
          <meta itemprop="publisher" content={headerMeta.title} />
          <meta name="twitter:title" content={headerMeta.title} />
          <meta name="twitter:description" content={headerMeta.description} />
          <meta name="twitter:image" content={headerMeta.image} />
          <meta name="twitter:url" content={headerMeta.url} />
          <link rel="image_src" href={headerMeta.image} />
          <link rel="canonical" href={headerMeta.url} />
        </Helmet>
      )}
      <Loader />
      <Taptop />
      <div id="pageWrapper" className="page-wrapper compact-wrapper">
        {!location.pathname.startsWith('/widget/') && (<Header />)}
        {!location.pathname.startsWith('/widget/') ?
          <div className="page-body-wrapper sidebar-icon" style={{ background: location.pathname.startsWith('/blog/') ? 'unset' : '' }}>
            <Sidebar />
            <div className="page-body mt-0" style={{ minHeight: '100vh', paddingTop: width <= 345 ? '138px' : width <= 575 ? '116px' : width <= 907 ? '121px' : width <= 991 ? '99px' : width <= 1200 ? '119px' : '81px' }}>
              <SubHeader breadcrumb={headerMeta.breadcrumb} visible={headerMeta.breadcrumb && !location.pathname.startsWith('/blog')} static={routes.findIndex(r => r.path === location.pathname && r.static) > -1 || routes.findIndex(r => r.path === location.pathname || dynamicPaths.findIndex(p => r.path.startsWith(`/${p}/`)) > -1) < 0} />
              {children}
            </div>
            <Footer />
          </div>
          :
          <div className="page-body-wrapper sidebar-icon" style={{ background: 'unset' }}>
            <Sidebar />
            <div className="page-body d-flex align-items-center justify-content-center mt-0" style={{ minHeight: '100vh' }}>
              {children}
            </div>
          </div>
        }
        {!location.pathname.startsWith('/widget/') && (
          <CookieConsent
            background="rgba(0,0,0,.8)"
            color="#fff"
            bottomPosition={true}
            buttonBackground="#fff"
            buttonColor="rgba(0,0,0,.8)"
            buttonText="Accept"
          >
            <span className="f-12 f-w-300">We use cookies to enhance your experience, analyze site traffic, personalize content, and serve targeted advertisements. Read more in our <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="f-12 f-w-500 text-white">Privacy Policy</Link>. By accepting, you consent to our use of cookies.</span>
          </CookieConsent>
        )}
      </div>
      <ThemeCustomize />
      <ToastContainer />
    </Fragment>
  );
}

export default withRouter(App);
