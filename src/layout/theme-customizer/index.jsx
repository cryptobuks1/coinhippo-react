import React, { Fragment, useState, useEffect, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ADD_LAYOUT, ADD_SIDEBAR_TYPES, ADD_SIDEBAR_SETTINGS, ADD_COLOR, ADD_COSTOMIZER, ADD_MIX_BACKGROUND_LAYOUT, ROUTER_ANIMATION } from '../../redux/types';
import { Container, Row, Nav, NavLink, TabContent, TabPane, Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';
import { toast } from 'react-toastify';
import { Configuration, ModalTitle, CopyText, Cancel, LayoutType, LTR, RTL, Box, SidebarType, SidebarSettings, Default, Border, IconColor, RouterAnimation, ZoomFade, SildeFade, Fade, ZoomOut, None, MixLayout, FadeBottom, UnlimitedColor, QuickOption, Apply } from '../../constant';
import ConfigDB from '../../data/customizer/config';
import { useIsMountedRef } from '../../utils';

const Themecustomizer = props => {
  const dispatch = useDispatch();
  const isMountedRef = useIsMountedRef();

  const default_color = localStorage.getItem('default_color') || ConfigDB.data.color.primary_color;
  const secondary_color = localStorage.getItem('secondary_color') || ConfigDB.data.color.secondary_color;
  const layout_animation = localStorage.getItem('animation') || ConfigDB.data.router_animation || 'fade';
  const configDB = useSelector(content => content.Customizer.customizer);
  const [layout_type, setLayout_type] = useState(configDB.settings.layout_type);
  const [sidebar_type, setSidebar_type] = useState(configDB.settings.sidebar.type);
  const body_sidebar_type = configDB.settings.sidebar.body_type;
  const sidebar_setting = configDB.settings.sidebar_setting;
  const mix_background_layout = configDB.color.mix_background_layout;
  const config_primary = configDB.color.primary_color;
  const config_secondary = configDB.color.secondary_color;
  const [colorBackground1, setColorBackground1] = useState(default_color || config_primary);
  const [colorBackground2, setColorBackground2] = useState(secondary_color || config_secondary);
  const [rightSidebar, setRightSidebar] = useState(true);
  const [showHorizontal, setShowHorizontal] = useState(true);
  const [showBoxLayout, setshowBoxLayout] = useState(true);
  const [activeTab1] = useState('1');
  const [modal, setModal] = useState();

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
    if (isMountedRef.current) {
      dispatch({ type: ADD_COSTOMIZER });
      dispatch({
        type: ADD_COLOR,
        payload: {
          default_color,
          secondary_color,
        }
      });
      dispatch({ type: ROUTER_ANIMATION, payload: layout_animation });
  
      if (default_color == null || secondary_color == null) {
        document.documentElement.style.setProperty('--theme-default', config_primary);
        document.documentElement.style.setProperty('--theme-secondary', config_secondary);
        dispatch({
          type: ADD_COLOR,
          payload: {
            primary_color: config_primary,
            secondary_color: config_secondary,
          }
        });
      }
      else {
        document.documentElement.style.setProperty('--theme-default',default_color);
        document.documentElement.style.setProperty('--theme-secondary', secondary_color);
        dispatch({
          type: ADD_COLOR,
          payload: {
            primary_color: default_color,
            secondary_color: secondary_color,
          }
        });
      }

      //set layout_type
      document.body.className = `${mix_background_layout} ${layout_type}`;
      document.documentElement.dir = layout_type;

      //set sidebar_type
      if (width <= 991) {
        document.querySelector('.page-wrapper').className = 'page-wrapper compact-wrapper';
        document.querySelector('.page-body-wrapper').className = 'page-body-wrapper sidebar-icon';
        if (document.querySelector('.page-header')) {
          document.querySelector('.page-header').className = 'page-header close_icon';
        }
      } else if (width <= 991 && sidebar_type === 'horizontal-wrapper') {
        document.querySelector('.page-wrapper').className = 'page-wrapper compact-wrapper';
        document.querySelector('.page-body-wrapper').className = 'page-body-wrapper sidebar-icon';
        if (document.querySelector('.page-header')) {
          document.querySelector('.page-header').className = 'page-header close_icon';
        }
      } else {
        document.querySelector('.page-wrapper').className = 'page-wrapper ' + sidebar_type;
        document.querySelector('.page-body-wrapper').className = 'page-body-wrapper ' + body_sidebar_type;
        if (document.querySelector('.page-header')) {
          document.querySelector('.page-header').className = 'page-header ';
        }
      }

      //set sidebar setting
      document.querySelector('.sidebar-wrapper').setAttribute('sidebar-layout', sidebar_setting);
    }
  }, [isMountedRef, width, body_sidebar_type, config_primary, config_secondary, default_color, dispatch, layout_animation, layout_type, mix_background_layout, secondary_color, sidebar_setting, sidebar_type]);

  const toggle = () => setModal(!modal);

  const openCustomizer = () => {
    if (rightSidebar) {
      setRightSidebar(!rightSidebar);
      document.querySelector('.customizer-contain').classList.add('open');
      document.querySelector('.customizer-links').classList.add('open');
    }
  };

  const closeCustomizer = () => {
    setRightSidebar(!rightSidebar);
    document.querySelector('.customizer-contain').classList.remove('open');
    document.querySelector('.customizer-links').classList.remove('open');
  };

  const handleLayout = layout => {
    setLayout_type(layout);
    setShowHorizontal(true);
    document.querySelectorAll('.main-layout li').forEach(item => item.classList.remove('active'));
    document.body.className = `${mix_background_layout} ${layout}`;
    document.documentElement.dir = layout;
    if (layout === 'box-layout') {
      setShowHorizontal(false);
    }
    if (sidebar_type === 'horizontal-wrapper' && layout === 'box-layout') {
      document.querySelector('.page-wrapper').className = 'page-wrapper compact-wrapper';
      document.querySelector('.page-body-wrapper').className = 'page-body-wrapper sidebar-icon';
    }
    if (width <= 991 && sidebar_type === 'horizontal-wrapper' && layout === 'box-layout') {
      document.querySelector('.page-wrapper').className = 'page-wrapper compact-wrapper';
      document.querySelector('.page-body-wrapper').className = 'page-body-wrapper sidebar-icon';
      document.querySelector('.page-header').className = 'page-header';
    }
    dispatch({ type: ADD_LAYOUT, payload: layout });
  };

  const handleSidebarType = (e, type, body_type) => {
    e.preventDefault();
    setSidebar_type(type);
    document.querySelectorAll('.sidebar-type li').forEach(item => item.classList.remove('active'));
    document.querySelector('.page-wrapper').className = 'page-wrapper ' + type;
    document.querySelector('.page-body-wrapper').className = 'page-body-wrapper ' + body_type;
    e.currentTarget.classList.add('active');

    if (type === 'horizontal-wrapper') {
      setshowBoxLayout(false);
    } else {
      setshowBoxLayout(true);
    }

    if (width <= 991 && type === 'horizontal-wrapper') {
      document.querySelector('.page-wrapper').className = 'page-wrapper compact-wrapper';
      document.querySelector('.page-body-wrapper').className = 'page-body-wrapper sidebar-icon';
      document.querySelector('.page-header').className = 'page-header close_icon';
    }
    dispatch({ type: ADD_SIDEBAR_TYPES, payload: { type, body_type } });
  };

  const handleSidebarSetting = (e, sidebar_setting) => {
    e.preventDefault();
    document.querySelectorAll('.sidebar-setting li').forEach(item => item.classList.remove('active'));
    document.querySelector('.sidebar-wrapper').setAttribute('sidebar-layout', sidebar_setting);
    e.currentTarget.classList.add('active');
    dispatch({ type: ADD_SIDEBAR_SETTINGS, payload: sidebar_setting });
  };

  const handleCustomizerMix_Background = e => {
    e.preventDefault();
    document.querySelectorAll('.customizer-mix li').forEach(item => item.classList.remove('active'));
    document.body.className = `${e.currentTarget.getAttribute('data-attr')} ${layout_type}`;
    e.currentTarget.classList.add('active');
    dispatch({ type: ADD_MIX_BACKGROUND_LAYOUT, payload: e.currentTarget.getAttribute('data-attr') });
  };

  const selectAnimation = e => {
    localStorage.setItem('animation', e.target.value);
    dispatch({ type: ROUTER_ANIMATION, payload: e.target.value });
    window.location.reload();
  };

  const handleUnlimatedColor1Change = e => {
    const { value } = e.target;
    setColorBackground1(value);
  };

  const handleUnlimatedColor2Change = e => {
    const {value} = e.target;
    setColorBackground2(value);
  };

  const OnUnlimatedColorClick = () => {
    localStorage.setItem('default_color', colorBackground1);
    localStorage.setItem('secondary_color', colorBackground2);
    window.location.reload();
  };

  return (
    <Fragment>
      <div className="customizer-links d-none">
        <Nav className="flex-column nac-pills">
          <NavLink onClick={openCustomizer}>
            <div className="settings">
              {/*<i className="icon-settings"></i>*/}
            </div>
            <span>{QuickOption}</span>
          </NavLink>
        </Nav>
      </div>
      <div className="customizer-contain">
        <div id="c-pills-tabContent" className="tab-content">
          <div className="customizer-header">
            {/*<i className="icon-close" onClick={closeCustomizer}></i>*/}
            <span onClick={closeCustomizer}>x</span>
            <h5>{"PREVIEW SETTINGS"}</h5>
            <p className="mb-0">{"Try It Real Time"}{/* <i className="fa fa-thumbs-o-up txt-primary"></i>*/}</p>
            <Button color="primary" className="plus-popup mt-2" onClick={() => setModal(!modal)}>{Configuration}</Button>
            <Modal isOpen={modal} toggle={toggle} centered={true} className="modal-body">
              <ModalHeader toggle={toggle}>{ModalTitle}</ModalHeader>
              <ModalBody>
                <Container fluid={true} className="bd-example-row">
                  <Row>
                    <p>{"To replace our design with your desired theme. Please do configuration as mention"}</p>
                    <p><b>{"Path : data > customizer > config.jsx"}</b></p>
                  </Row>
                  <pre>
                    <code>
                        <div>{"export class ConfigDB "}&#123;</div>
                        <div>{"static data"} = &#123;</div>
                        <div>  {"settings"}&#58; &#123;</div>
                        <div>    {"layout_type"}&#58; '{configDB.settings.layout_type}',</div>
                        <div>  {"sidebar"}&#58; &#123;</div>
                        <div>    {"type"}&#58; '{configDB.settings.sidebar.type}',</div>
                        <div>    {"body_type"}&#58; '{configDB.settings.sidebar.body_type}'</div>
                        <div>  &#125;,</div>
                        <div>  {"sidebar_setting"}&#58; '{configDB.settings.sidebar_setting}',</div>
                        <div>  &#125;,</div>
                        <div>  {"color"}&#58; &#123;</div>
                        <div>    {"primary_color"}&#58; '{configDB.color.primary_color}',</div>
                        <div>    {"secondary_color"}&#58; '{configDB.color.secondary_color}',</div>
                        <div>    {"mix_background_layout"}&#58; '{configDB.color.mix_background_layout}',</div>
                        <div>  &#125;,</div>
                        <div>    {"router_animation"}&#58; {"'fadeIn'"}</div>
                        <div>  &#125;</div>
                        <div>&#125;</div>
                    </code>
                  </pre>
                </Container>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  className="notification"
                  onClick={() => toast.success("Code Copied to clipboard !", { position: toast.POSITION.BOTTOM_RIGHT })}
                >
                  {CopyText}
                </Button>
                <Button color="secondary" onClick={toggle}>{Cancel}</Button>
              </ModalFooter>
            </Modal>
          </div>
          <div className="customizer-body custom-scrollbar">
            <TabContent activeTab={activeTab1}>
              <TabPane tabId="1">
                <h6>{LayoutType}</h6>
                <ul className="main-layout layout-grid">
                  <li className={`${layout_type === 'ltr' ? 'active' : ''}`} onClick={() => handleLayout('ltr')}>
                    <div className="header bg-light">
                      <ul>
                        <li></li><li></li><li></li>
                      </ul>
                    </div>
                    <div className="body">
                      <ul>
                        <li className="bg-light sidebar"></li>
                        <li className="bg-light body">
                          <span className="badge badge-primary">{LTR}</span>
                        </li>
                      </ul>
                    </div>
                  </li>
                  <li className={`${layout_type === 'rtl' ? 'active' : ''}`} onClick={() => handleLayout('rtl')}>
                    <div className="header bg-light">
                      <ul>
                        <li></li><li></li><li></li>
                      </ul>
                    </div>
                    <div className="body">
                      <ul>
                        <li className="bg-light sidebar"></li>
                        <li className="bg-light body">
                          <span className="badge badge-primary">{RTL}</span>
                        </li>
                      </ul>
                    </div>
                  </li>
                  {showBoxLayout ?
                    <li className={`${layout_type === 'box-layout' ? 'active' : ''}`} onClick={() => handleLayout('box-layout')}>
                      <div className="header bg-light">
                        <ul>
                          <li></li><li></li><li></li>
                        </ul>
                      </div>
                      <div className="body">
                        <ul>
                          <li className="bg-light sidebar"></li>
                          <li className="bg-light body">
                            <span className="badge badge-primary">{Box}</span>
                          </li>
                        </ul>
                      </div>
                    </li>
                    :
                    ''
                  }
                </ul>
                <h6 className="">{SidebarType}</h6>
                <ul className="sidebar-type layout-grid">
                  {showHorizontal ?
                    <li data-attr="normal-sidebar" className="normal-sidebar" onClick={e => handleSidebarType(e, 'horizontal-wrapper', 'horizontal-menu')}>
                      <div className="header bg-light">
                        <ul><li></li><li></li><li></li></ul>
                      </div>
                      <div className="body">
                        <ul>
                          <li className="bg-dark sidebar"></li>
                          <li className="bg-light body"> </li>
                        </ul>
                      </div>
                    </li>
                    :
                    ''
                  }
                  <li className="active" data-attr="compact-sidebar" onClick={e => handleSidebarType(e, 'compact-wrapper', 'sidebar-icon')}>
                    <div className="header bg-light">
                      <ul><li></li><li></li><li></li></ul>
                    </div>
                    <div className="body">
                      <ul>
                        <li className="bg-dark sidebar compact"></li>
                        <li className="bg-light body"></li>
                      </ul>
                    </div>
                  </li>
                </ul>
                <h6 className="">{SidebarSettings}</h6>
                <ul className="sidebar-setting layout-grid">
                  <li className="active" data-attr="default-sidebar" onClick={e => handleSidebarSetting(e, "default-sidebar")}>
                    <div className="header bg-light">
                      <ul>
                        <li></li><li></li><li></li>
                      </ul>
                    </div>
                    <div className="body bg-light">
                      <span className="badge badge-primary">{Default}</span>
                    </div>
                  </li>
                  <li data-attr="border-sidebar" onClick={e => handleSidebarSetting(e, "border-sidebar")}>
                    <div className="header bg-light">
                      <ul>
                        <li></li><li></li><li></li>
                      </ul>
                    </div>
                    <div className="body bg-light">
                      <span className="badge badge-primary">{Border}</span>
                    </div>
                  </li>
                  <li data-attr="iconcolor-sidebar" onClick={e => handleSidebarSetting(e, "iconcolor-sidebar")} >
                    <div className="header bg-light">
                      <ul>
                        <li></li>
                        <li></li>
                        <li></li>
                      </ul>
                    </div>
                    <div className="body bg-light">
                      <span className="badge badge-primary">{IconColor}</span>
                    </div>
                  </li>
                </ul>
                <h6>{RouterAnimation} {layout_animation}</h6>
                <Input type="select" defaultValue={layout_animation} name="selectMulti" onChange={selectAnimation}>
                  <option value="zoomfade">{ZoomFade}</option>
                  <option value="slidefade">{SildeFade}</option>
                  <option value="fadebottom">{FadeBottom}</option>
                  <option value="fade">{Fade}</option>
                  <option value="zoomout">{ZoomOut}</option>
                  <option value="none">{None}</option>
                </Input>
                <h6>{UnlimitedColor}</h6>
                <ul className="layout-grid unlimited-color-layout">
                  <input type="color" name="Color-Background1" value={colorBackground1} onChange={e => handleUnlimatedColor1Change(e)} />
                  <input type="color" name="Color-Background2" value={colorBackground2} onChange={e => handleUnlimatedColor2Change(e)} />
                  <Button color="primary" className="color-apply-btn color-apply-btn" disabled={!(colorBackground1 && colorBackground2)} onClick={() => OnUnlimatedColorClick()}>{Apply}</Button>
                </ul>
                <h6 className="">{MixLayout}</h6>
                <ul className="layout-grid customizer-mix">
                  <li className="color-layout active" data-attr="light-only" onClick={handleCustomizerMix_Background}>
                    <div className="header bg-light">
                      <ul>
                        <li></li>
                        <li></li>
                        <li></li>
                      </ul>
                    </div>
                    <div className="body">
                      <ul>
                        <li className="bg-light sidebar"></li>
                        <li className="bg-light body"></li>
                      </ul>
                    </div>
                  </li>
                  <li className="color-layout" data-attr="dark-sidebar" onClick={handleCustomizerMix_Background}>
                    <div className="header bg-light">
                      <ul>
                        <li></li>
                        <li></li>
                        <li></li>
                      </ul>
                    </div>
                    <div className="body">
                      <ul>
                        <li className="bg-dark sidebar"></li>
                        <li className="bg-light body"></li>
                      </ul>
                    </div>
                  </li>
                  <li className="color-layout" data-attr="dark-only" onClick={handleCustomizerMix_Background}>
                    <div className="header bg-dark">
                      <ul>
                        <li></li>
                        <li></li>
                        <li></li>
                      </ul>
                    </div>
                    <div className="body">
                      <ul>
                        <li className="bg-dark sidebar"></li>
                        <li className="bg-dark body"></li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </TabPane>
            </TabContent>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Themecustomizer;
