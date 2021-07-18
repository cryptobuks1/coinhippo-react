import React, { Fragment, useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Select } from 'antd';
import { ChevronDown, Sun, Moon, Minimize, Maximize } from 'react-feather';
import { currenciesGroups } from './menus';
import ConfigDB from '../../data/customizer/config';
import { VS_CURRENCY, THEME } from '../../redux/actionTypes';
import { useIsMountedRef } from '../../utils';

const Rightbar = props => {
  const isMountedRef = useIsMountedRef();
  const [currencyDropdown, setCurrencyDropdown] = useState(false);
  const [currencyOptionSelected, setCurrencyOptionSelected] = useState(false);
  const currencySelected = useSelector(content => content.Preferences.vs_currency);
  const dispatch = useDispatch();
  const [moonlight, setMoonlight] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const layoutVersion = localStorage.getItem('layout_version') || ConfigDB.data.color.layout_version || 'light';

  const escFunction = useCallback(e => {
    if(e.keyCode === 27) {
      setFullscreen(false);
      if (document.querySelector('.sub-header-wrapper')) {
        document.querySelector('.sub-header-wrapper').className = 'sub-header-wrapper container-fluid';
      }
    }
  }, []);

  useEffect(() => {
    if (isMountedRef.current) {
      setMoonlight(layoutVersion === 'dark-only');
    }
    document.addEventListener('keydown', escFunction, false);
    return () => document.removeEventListener('keydown', escFunction, false);
  }, [isMountedRef, layoutVersion, escFunction]);
  document.body.className = layoutVersion === 'dark-only' ? layoutVersion : 'light';

  const currencyToggle = () => setCurrencyDropdown(!currencyDropdown);

  const handleSelectCurrency = currency => {
    currency = currency.indexOf('_') > -1 ? currency.substring(currency.indexOf('_') + 1) : currency;
    dispatch({ type: VS_CURRENCY, payload: currency });
    localStorage.setItem(VS_CURRENCY, currency);
    currencyToggle();
  };

  const moonlightToggle = light => {
    setMoonlight(!light);
    dispatch({ type: THEME, payload: light ? 'light' : 'dark-only' });
    document.body.className = light ? 'light' : 'dark-only';
    localStorage.setItem('layout_version', light ? 'light' : 'dark-only');
  };

  const goFull = () => {
    if ((document.fullScreenElement && document.fullScreenElement !== null) || (!document.mozFullScreen && !document.webkitIsFullScreen)) {
      setFullscreen(true);
      if (document.documentElement.requestFullScreen) {
        document.documentElement.requestFullScreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullScreen) {
        document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
      }
      if (document.querySelector('.sub-header-wrapper')) {
        document.querySelector('.sub-header-wrapper').className = 'sub-header-wrapper container-fluid';//'sub-header-wrapper d-none container-fluid';
      }
    } else {
      setFullscreen(false);
      if (document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
      if (document.querySelector('.sub-header-wrapper')) {
        document.querySelector('.sub-header-wrapper').className = 'sub-header-wrapper container-fluid';
      }
    }
  };

  return (
    <Fragment>
      <div className="nav-right col-3 pull-right right-header p-0" style={{ maxWidth: 'fit-content' }}>
        <ul className="nav-menus" style={{ marginRight: 0 }}>
          <li>
            {currencyDropdown ?
              <Select
                showSearch
                defaultOpen
                autoFocus
                placeholder="Search"
                optionFilterProp="children"
                filterOption={(input, option) => option.data ? option.data.id.toLowerCase().indexOf(input.toLowerCase()) > -1 || option.data.title.toLowerCase().indexOf(input.toLowerCase()) > -1 : false}
                value={currencyOptionSelected}
                onSelect={value => { setCurrencyOptionSelected(value); handleSelectCurrency(value); }}
                onDropdownVisibleChange={() => currencyToggle()}
                dropdownClassName="vs-currency-select-dropdown"
                style={{ width: '10rem' }}
              >
                {currenciesGroups.map((currenciesGroup, key) => (
                  <Select.OptGroup key={key} label={currenciesGroup.title}>
                    {currenciesGroup.currencies.map((currency, sub_key) => (
                      <Select.Option key={`${key}_${sub_key}`} value={`${currenciesGroup.id}_${currency.id}`} data={currency} className="small">
                        {currency.flag ?
                          <i className={`flag-icon flag-icon-${currency.flag} mr-2`} />
                          :
                          currency.image ?
                            <img src={currency.image} alt={currency.id.toUpperCase()} className="mr-2" style={currency.imgStyle ? currency.imgStyle : { width: '1rem' }} />
                            :
                            null
                        }
                        {currency.title}
                        <span className="font-info ml-1">{currency.id.toUpperCase()}</span>
                      </Select.Option>
                    ))}
                  </Select.OptGroup>
                ))}
              </Select>
              :
              <span onClick={() => currencyToggle()} className="d-flex align-items-center" style={{ cursor: 'pointer' }}>
                {currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(currency => currency.id === currencySelected).slice(0, 1).map((currency, key) => (
                  currency.flag ?
                    <i key={key} className={`flag-icon flag-icon-${currency.flag} mr-2`} />
                    :
                    currency.image ?
                      <img key={key} src={currency.image} alt={currency.id.toUpperCase()} className="mr-2" style={{ width: '1.2rem' }} />
                      :
                      null
                ))}
                {currencySelected.toUpperCase()}
                <ChevronDown className="ml-1" />
              </span>
            }
          </li>
          <li><span onClick={() => moonlightToggle(moonlight)} className="mode">{moonlight ? <Sun /> : <Moon />}</span></li>
          <li className="maximize"><span onClick={goFull} style={{ cursor: 'pointer' }}>{fullscreen ? <Minimize /> : <Maximize />}</span></li>
        </ul>
      </div>
    </Fragment>
  );
};

export default Rightbar;
