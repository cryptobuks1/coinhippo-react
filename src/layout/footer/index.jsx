import React, { Fragment, useState, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Row, Col } from 'reactstrap';
import LazyLoad from 'react-lazyload';
import { menus } from './menus';
import { getLocationData } from '../../utils';
import logo from '../../assets/images/logo/logo_rectangle.png';
import logo_dark from '../../assets/images/logo/logo_rectangle_white.png';
import coingecko from '../../assets/images/logo/api/CoinGecko Logo.png';

const Footer = props => {
  const locationData = getLocationData(window);

  const theme = useSelector(content => content.Preferences.theme);

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

  return (
    <Fragment>
      <footer className="footer">
        <Container fluid={true} className="py-3">
          <Row>
            <Col lg={menus.length % 4 === 0 ? 4 : menus.length % 3 === 0 ? 5 : 6} sm={menus.length % 4 === 0 ? 6 : menus.length % 3 === 0 ? 4 : 6} xs="12">
              <img className="img-fluid for-light mb-2 pb-1" src={logo} alt={process.env.REACT_APP_APP_NAME} style={{ maxHeight: '3rem' }} />
              <img className="img-fluid for-dark mb-2 pb-1" src={logo_dark} alt={process.env.REACT_APP_APP_NAME} style={{ maxHeight: '3rem' }} />
              <p className="mb-0 pr-0 pr-lg-3">{process.env.REACT_APP_FOOTER_DESCRIPTION}</p>
            </Col>
            <Col lg={menus.length % 4 === 0 ? 8 : menus.length % 3 === 0 ? 7 : 6} sm={menus.length % 4 === 0 ? 6 : menus.length % 3 === 0 ? 8 : 6} xs="12" className="mt-3 mt-sm-0">
              <Row>
                {menus.map((menu, key) => (
                  <Col key={key} lg={menus.length % 4 === 0 ? 3 : menus.length % 3 === 0 ? 4 : 6} sm={menus.length % 4 === 0 ? 6 : menus.length % 3 === 0 ? 4 : 6} xs="12" className={`mt-3 mt-${key > 1 ? 'lg' : 'sm'}-0`}>
                    <p className="f-16 font-weight-bold mb-2">{menu.title}</p>
                    <ul className="layout-grid" style={{ display: 'grid' }}>
                      {menu.subMenu.map((subMenu, sub_key) => (
                        <li key={`${key}_${sub_key}`}>
                          {subMenu.outer ?
                            <a href={subMenu.path} target={subMenu.target ? subMenu.target : undefined} rel={subMenu.target === '_blank' ? 'noopener noreferrer' : undefined}>
                              {subMenu.image && (<img src={subMenu.image} alt={subMenu.title} className="mr-2" style={{ width: '1.2rem' }} />)}
                              {subMenu.title}
                            </a>
                            :
                            <Link to={subMenu.path} target={subMenu.target ? subMenu.target : undefined} rel={subMenu.target === '_blank' ? 'noopener noreferrer' : undefined}>
                              {subMenu.image && (<img src={subMenu.image} alt={subMenu.title} className="mr-2" style={{ width: '1.2rem' }} />)}
                              {subMenu.title}
                            </Link>
                          }
                        </li>
                      ))}
                    </ul>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Container>
      </footer>
      <footer className="footer">
        <Container fluid={true}>
          <LazyLoad>
            <Row>
              <Col lg="6" sm="8" xs="12">
                <p className="mb-0">© Copyright {new Date().getFullYear()} Everon Co., Ltd.{width <= 575 ? <br /> : <>&nbsp;</>}All rights reserved.</p>
              </Col>
              <Col lg="6" sm="4" xs="12">
                <p className={`f-${width <= 575 ? 'left' : 'right'} d-inline-flex align-items-center mb-0`}>
                  {"Data from"}
                  {locationData && locationData.pathname && locationData.pathname.startsWith('/explorer') ?
                    <>
                      <a href="https://covalenthq.com/" target="_blank" rel="noopener noreferrer" className="footer-bar-link d-flex align-items-center">
                        {theme === 'dark-only' ?
                          <img src="https://www.covalenthq.com/static/images/covalent-logo-tri.svg" alt="" className="for-dark img-fluid ml-1" style={{ height: '20px' }} />
                          :
                          <>
                            <img src="https://www.covalenthq.com/static/images/covalent-logomark.png" alt="" className="for-light img-fluid mx-1" style={{ height: '22px' }} />
                            {width > 991 && (<>{"Covalent"}</>)}
                          </>
                        }
                      </a>
                      &nbsp;&nbsp;{"&"}&nbsp;
                      <a href="https://coingecko.com" target="_blank" rel="noopener noreferrer" className="footer-bar-link">
                        <img src={coingecko} alt="" className="img-fluid mx-1" style={{ height: '22px' }} />
                        {width > 991 && (<>{"CoinGecko"}</>)}
                      </a>
                    </>
                    :
                    <>
                      <a href="https://coingecko.com" target="_blank" rel="noopener noreferrer" className="footer-bar-link">
                        <img src={coingecko} alt="" className="img-fluid mx-1" style={{ height: '22px' }} />
                        {width > 991 && (<>{"CoinGecko"}</>)}
                      </a>
                      &nbsp;&nbsp;{"&"}&nbsp;
                      <a href="https://coinpaprika.com" target="_blank" rel="noopener noreferrer" className="footer-bar-link">
                        <img src="https://coinpaprika.com/assets/img/cp-logo-small.svg" alt="" className="img-fluid mx-1" style={{ height: '1rem' }} />
                        {width > 991 && (<>{"coinpaprika"}</>)}
                      </a>
                    </>
                  }
                </p>
              </Col>
            </Row>
          </LazyLoad>
        </Container>
      </footer>
    </Fragment>
  );
}

export default Footer;
