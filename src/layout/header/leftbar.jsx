import React, { Fragment, useState, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';
import { X } from 'react-feather';
import { menus } from './menus';
import logo from '../../assets/images/logo/logo_rectangle.png';
import logo_dark from '../../assets/images/logo/logo_rectangle_white.png';
import logo_min from '../../assets/images/logo/logo_square.png';
import logo_dark_min from '../../assets/images/logo/logo_square_white.png';

const Leftbar = props => {
  const [coinsSelected, setCoinsSelected] = useState(false);
  const [exchangesSelected, setExchangesSelected] = useState(false);
  const [resourcesSelected, setResourcesSelected] = useState(false);

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

  const onCoinsSelected = selected => {
    setExchangesSelected(false);
    setResourcesSelected(false);
    setCoinsSelected(selected);
  };

  const onExchangesSelected = selected => {
    setCoinsSelected(false);
    setResourcesSelected(false);
    setExchangesSelected(selected);
  };

  const onResourcesSelected = selected => {
    setCoinsSelected(false);
    setExchangesSelected(false);
    setResourcesSelected(selected);
  };

  const onAllSelected = selected => {
    onCoinsSelected(selected);
    onExchangesSelected(selected);
    onResourcesSelected(selected);
  };

  return (
    <Fragment>
      <div className="header-logo-wrapper" style={{ width: 'fit-content' }}>
        <div className="logo-wrapper">
          <Link to="/">
            {width <= 575 || (width >= 1440 && width < 1530) ?
              <>
                <img className="img-fluid for-light" src={logo_min} alt={process.env.REACT_APP_APP_NAME} style={{ maxHeight: '2rem' }} />
                <img className="img-fluid for-dark" src={logo_dark_min} alt={process.env.REACT_APP_APP_NAME} style={{ maxHeight: '2rem' }} />
              </>
              :
              <>
                <img className="img-fluid for-light" src={logo} alt={process.env.REACT_APP_APP_NAME} style={{ maxHeight: '2rem', marginTop: '-.5rem' }} />
                <img className="img-fluid for-dark" src={logo_dark} alt={process.env.REACT_APP_APP_NAME} style={{ maxHeight: '2rem', marginTop: '-.5rem' }} />
              </>
            }
          </Link>
        </div>
      </div>
      <Col className={`left-header horizontal-wrapper pl-${width > 575 && width <= 991 ? 3 : 2} pr-0`}>
        <ul onMouseLeave={() => onAllSelected(false)} className="horizontal-menu" style={{ maxWidth: 'fit-content', padding: `${width <= 991 ? '0' : '22px'} 0` }}>
          <li className="mega-menu">
            <span
              onMouseEnter={() => { if (width > 991) { onCoinsSelected(true); } }}
              onClick={() => { if (width <= 991) { onCoinsSelected(true); } }}
              className={`nav-link${coinsSelected ? ' active' : ''} f-w-500 px-${width <= 575 ? 1 : 2}`}
              style={{ cursor: 'pointer', letterSpacing: 1 }}
            >
              {menus[menus.findIndex(menu => menu.id === 0)].title}
            </span>
            <div onMouseLeave={() => onCoinsSelected(false)} className={`mega-menu-container nav-submenu menu-to-be-close${width <= 991 && coinsSelected ? ' h-100 d-block' : ''}`} style={{ top: width > 991 ? '70px' : '0', display: coinsSelected ? '' : 'none' }}>
              <Container fluid={true}>
                <Row>
                  {menus.filter(menu => menu.id === 0).map(menu => (
                    menu.subMenu.map((subMenu, key) => (
                      <Col key={key} className="mega-box">
                        {width <= 991 && key === 0 && (
                          <div className="mobile-title d-none px-3">
                            <h5>{menu.title}</h5><X onClick={() => onCoinsSelected(false)} />
                          </div>
                        )}
                        {(Array.isArray(subMenu) ? subMenu : [subMenu]).map((subMenu, sub_key) => (
                          <div key={sub_key} className="link-section dashed-links">
                            <div><h6>{subMenu.title}</h6></div>
                            <ul>
                              {subMenu.subMenu.filter(subSubMenu => !subSubMenu.isHideFromMenu).map((subSubMenu, sub_sub_key) => (
                                <li key={`${key}_${sub_key}_${sub_sub_key}`}>
                                  {subMenu.isReload ?
                                    <a href={subSubMenu.altPath || subSubMenu.path} target={subSubMenu.target} rel={subSubMenu.rel} onClick={() => onCoinsSelected(false)} style={{ width: 'inherit' }}>{subSubMenu.altTitle || subSubMenu.title}</a>
                                    :
                                    <Link to={subSubMenu.path} target={subSubMenu.target} rel={subSubMenu.rel} onClick={() => onCoinsSelected(false)} style={{ width: 'inherit' }}>{subSubMenu.altTitle || subSubMenu.title}</Link>
                                  }
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </Col>
                    ))
                  ))}
                </Row>
              </Container>
            </div>
          </li>
          <li className="level-menu">
            <span
              onMouseEnter={() => onExchangesSelected(true)}
              className={`nav-link${exchangesSelected ? ' active' : ''} f-w-500 px-${width <= 575 ? 1 : 2}`}
              style={{ cursor: 'pointer', letterSpacing: 1 }}
            >
              {menus[menus.findIndex(menu => menu.id === 1)].title}
            </span>
            <ul onMouseLeave={() => onExchangesSelected(false)} className="header-level-menu menu-to-be-close" style={{ top: width > 991 ? '70px' : '', display: exchangesSelected ? '' : 'none' }}>
              {menus.filter(menu => menu.id === 1).map(menu => (
                menu.subMenu.map((subMenu, key) => (
                  <li key={key}><Link to={subMenu.path} onClick={() => onExchangesSelected(false)} className="d-block"><span>{subMenu.title}</span></Link></li>
                ))
              ))}
            </ul>
          </li>
          <li className="level-menu">
            <span
              onMouseEnter={() => onResourcesSelected(true)}
              className={`nav-link${resourcesSelected ? ' active' : ''} f-w-500 ml-${width <= 575 ? 1 : 0} pl-2 pr-${width <= 575 ? 1 : 2}`}
              style={{ cursor: 'pointer', letterSpacing: 1 }}
            >
              {menus[menus.findIndex(menu => menu.id === 2)].title}
            </span>
            <ul onMouseLeave={() => onResourcesSelected(false)} className="header-level-menu menu-to-be-close" style={{ top: width > 991 ? '70px' : '', display: resourcesSelected ? '' : 'none' }}>
              {menus.filter(menu => menu.id === 2).map(menu => (
                menu.subMenu.map((subMenu, key) => (
                  <li key={key}><Link to={subMenu.path} onClick={() => onResourcesSelected(false)} className="d-block"><span>{subMenu.title}</span></Link></li>
                ))
              ))}
            </ul>
          </li>
          {props.globalComponent && (<li onMouseEnter={() => onAllSelected(false)} className="mx-2 px-2" style={{ borderLeft: '1px solid #cecece', borderRight: '1px solid #cecece' }}>{props.globalComponent}</li>)}
        </ul>
      </Col>
    </Fragment>
  );
}

export default Leftbar;
