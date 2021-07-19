import React, { Fragment, useState, useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, CardHeader, CardBody, Media, Nav, NavItem, NavLink, Button } from 'reactstrap';
import { Grid, List, ExternalLink, Clock, User, Mail, MapPin } from 'react-feather';
import parse from 'html-react-parser';
import Linkify from 'react-linkify';
import _ from 'lodash';
import moment from 'moment';
import Spinner from '../../spinner';
import Error404 from '../../../pages/errors/error404';
import { menus } from '../menus';
import { getEvents } from '../../../api';
import { useIsMountedRef, sleep } from '../../../utils';

const Events = props => {
  const pageSize = 100;
  const isMountedRef = useIsMountedRef();

  const [data, setData] = useState([]);
  const [displayTypeSelected, setDisplayTypeSelected] = useState('list');
  const [dataPage, setDataPage] = useState(1);
  const [dataPageEnd, setDataPageEnd] = useState(false);
  const [dataShowMore, setDataShowMore] = useState([]);
  const [loading, setLoading] = useState(false);

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
        setLoading(true);
      }
      const newData = data ? data : [];
      let size = 0;
      for (let i = 0; i <= dataPage; i++) {
        try {
          await sleep(i === 0 ? 0 : 500);
          let eventsData = await getEvents({ page: 1, upcoming_events_only: false, from_date: moment().startOf('year').add(-(i + 1), 'years').format('YYYY-MM-DD'), to_date: moment().startOf('year').add(-(i), 'years').endOf('day').format('YYYY-MM-DD') });
          eventsData = eventsData && eventsData.data ? eventsData.data : null;
          if (eventsData) {
            for (let j = 0; j < eventsData.length; j++) {
              newData[size] = eventsData[j];
              size++;
            }
            if (i === dataPage/*eventsData.length < pageSize*/) {
              if (isMountedRef.current) {
                setDataPageEnd(true);
              }
              break;
            }
          }
        } catch (err) {}
      }
      newData.length = size;
      if (isMountedRef.current) {
        if (size !== 0) {
          setData(newData.length > 0 ? newData : null);
        }
        setLoading(false);
      }
    };
    getData();
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, data, dataPage]);

  const filteredData = data && data.map((d, i) => {
    d.start_date_time = moment(d.start_date ? d.start_date : undefined).valueOf();
    d.end_date_time = moment(d.end_date ? d.end_date : undefined).valueOf();
    d.address = `${d.address ? d.address : ''}${d.city && !(d.address && d.address.indexOf(d.city) > -1) ? `${d.address ? '&nbsp;' : ''}${d.city}` : ''}`;
    return d;
  }).filter((d, i) => (i < (dataPage + (dataPage < 0 ? 2 : 1)) * (dataPage < 0 ? 10 : pageSize)));
  const sortedData = _.orderBy(filteredData, ['start_date_time'], ['desc']);

  return (
    <Fragment>
      <Container fluid={true}>
        <Row>
          <Col xs="12">
            <Card className="bg-transparent border-0" style={{ boxShadow: 'none' }}>
              <CardHeader className="bg-transparent pt-2 pb-4 px-0">
                <Row className="px-0 px-lg-3 mx-0 mx-lg-1">
                  <Col xl="4" lg="5" md="5" xs="12">
                    <Nav className="nav-pills nav-primary d-flex align-items-center">
                      {menus[0].subMenu.map((m, key) => (
                        <NavItem key={key} style={{ maxWidth: width <= 575 ? 'fit-content' : '' }}>
                          <div className={`nav-link${m.path === '/events' ? ' active' : ''}${width <= 991 ? ' f-12 p-2' : ''}`}>
                            <Link to={m.path} style={{ color: 'unset' }}>
                              {m.title}
                            </Link>
                          </div>
                        </NavItem>
                      ))}
                    </Nav>
                  </Col>
                  <Col xl="5" lg="5" md="5" xs={width > 575 ? 8 : 12} className={`mt-3 mt-md-0 d-flex align-items-center ${width <= 575 ? '' : 'justify-content-center'}`}>
                    <h1 className="mb-0">
                      <div className={`${width <= 575 ? 'f-14' : width <= 991 ? 'f-18' : 'f-24'} text-${width <= 575 ? 'left' : 'center'} mb-2`} style={{ lineHeight: 'initial' }}>{"Events"}</div>
                      <div className={`f-w-300 text-info f-${width <= 575 ? 10 : 14} text-${width <= 575 ? 'left mt-2' : 'center'}`} style={{ lineHeight: 1.5 }}>{"Check updated events, conferences, meetups information of cryptocurrency projects."}</div>
                    </h1>
                  </Col>
                  {width > 575 && (
                    <Col xl="3" lg="2" md="2" xs="4" className="mt-3 mt-md-0">
                      <Nav className="nav-pills nav-primary d-flex align-items-center justify-content-end">
                        {['list', 'card'].map(t => (
                          <NavItem key={t} style={{ maxWidth: width <= 575 ? 'fit-content' : '' }}>
                            <NavLink onClick={() => setDisplayTypeSelected(t)} className={`${displayTypeSelected === t ? 'active' : ''}${width <= 991 ? ' f-12' : ''} py-1 px-2`}>
                              {t === 'card' ? <Grid className="mt-1" style={{ width: '1.25rem', height: '1rem' }} /> : <List className="mt-1" style={{ width: '1.25rem', height: '1rem' }} />}
                            </NavLink>
                          </NavItem>
                        ))}
                      </Nav>
                    </Col>
                  )}
                </Row>
              </CardHeader>
              <CardBody className="pt-3 pb-2 px-0 px-lg-4">
                {!data ?
                  <Error404 />
                  :
                  data.length > 0 || dataPageEnd ?
                    <>
                      {displayTypeSelected === 'card' ?
                        <Row className="mt-3 px-2">
                          {sortedData.map((d, i) => (
                            <Col key={i} xl="3" lg="4" md="6" xs="12" className={`mt-${i < 4 ? width <= 767 ? i < 1 ? 2 : 4 : width <= 991 ? i < 2 ? 2 : 4 : width <= 1200 ? i < 3 ? 2 : 4 : i < 4 ? 2 : 4 : 4}`}>
                              <Card className="mb-0 p-3" style={{ boxShadow: 'none' }}>
                                <div className="media">
                                  <div className="media-body" style={{ maxWidth: '100%' }}>
                                    {d.screenshot && (<Media body className="w-100" src={d.screenshot} alt={d.title} />)}
                                    <h2 className="f-16 d-flex align-items-center mt-2 mb-0">
                                      <a href={d.website ? d.website : '/events'} target="_blank" rel="noopener noreferrer" style={{ color: 'unset' }}>{d.title}</a>
                                      {d.website && (<a href={d.website} target="_blank" rel="noopener noreferrer" className="ml-auto"><ExternalLink className="mt-1" style={{ width: '1rem', height: 'auto' }} /></a>)}
                                    </h2>
                                    {d.type && (<div className="f-12 text-info" style={{ marginTop: '.125rem' }}>{d.type}</div>)}
                                    {d.description && (
                                      <div className="f-10 f-w-300 text-secondary mt-2">
                                        <span title={d.description} style={dataShowMore.findIndex(t => t === d.description) > -1 ? { whiteSpace: 'pre-wrap' } : { display: '-webkit-box', WebkitLineClamp: '5', WebkitBoxOrient: 'vertical', whiteSpace: 'pre-wrap', overflow: 'hidden' }}>
                                          <Linkify>{d.description}</Linkify>
                                        </span>
                                        {dataShowMore.findIndex(t => t === d.description) < 0 && (d.description.length > 240 || d.description.split('\\n').length > 5) && (
                                          <div onClick={() => setDataShowMore(dataShowMore.concat(d.description))} className="font-primary mt-2" style={{ cursor: 'pointer' }}>SHOW MORE</div>
                                        )}
                                        {dataShowMore.findIndex(t => t === d.description) > -1 && (
                                          <div onClick={() => setDataShowMore(dataShowMore.filter(t => t !== d.description))} className="font-secondary mt-2" style={{ cursor: 'pointer' }}>SHOW LESS</div>
                                        )}
                                      </div>
                                    )}
                                    {d.start_date && d.end_date && (<div className="f-14 f-w-500 d-flex align-items-center mt-2"><Clock className="mr-2" style={{ width: '1rem', height: 'auto' }} />{moment(d.start_date_time).format('MMM D, YYYY')} - {moment(d.end_date_time).format('MMM D, YYYY')}</div>)}
                                    {d.organizer && (<div className="f-14 f-w-500 d-flex align-items-center mt-2"><User className="mr-2" style={{ width: '1rem', height: 'auto' }} />{d.organizer}</div>)}
                                    {d.email && (<div className="f-14 f-w-500 d-flex align-items-center mt-2"><Mail className="mr-2" style={{ width: '1rem', height: 'auto' }} /><a href={`mailto:${d.email}`} target="_blank" rel="noopener noreferrer">{d.email}</a></div>)}
                                    {d.venue && (<div className="f-14 f-w-500 d-flex align-items-center mt-2"><MapPin className="mr-2" style={{ width: '1rem', height: 'auto' }} />{d.venue}</div>)}
                                    {d.venue && d.address && (<div className="f-12 f-w-400 text-secondary d-flex align-items-center mt-1 ml-4"><Linkify>{parse(d.address)}</Linkify></div>)}
                                  </div>
                                </div>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                        :
                        <Row className="mt-3 px-2">
                          {sortedData.map((d, i) => (
                            <Col key={i} xl="12" lg="12" md="12" xs="12" className={`mt-${i < 1 ? 0 : 4}`}>
                              <Card className="mb-0 p-3" style={{ boxShadow: 'none' }}>
                                <div className="media">
                                  <div className="media-body" style={{ maxWidth: '100%' }}>
                                    <Row>
                                      <Col lg="6" md="12" xs="12">
                                        {d.screenshot && (<Media body className="w-100" src={d.screenshot} alt={d.title} />)}
                                      </Col>
                                      <Col lg="6" md="12" xs="12" className="mt-2 mt-lg-0">
                                        <h2 className={`f-${width <= 575 ? 16 : 22} d-flex align-items-center mb-0`}>
                                          <a href={d.website ? d.website : '/events'} target="_blank" rel="noopener noreferrer" style={{ color: 'unset' }}>{d.title}</a>
                                          {d.website && (<a href={d.website} target="_blank" rel="noopener noreferrer" className="ml-auto"><ExternalLink className="mt-1" style={{ width: '1rem', height: 'auto' }} /></a>)}
                                        </h2>
                                        {d.type && (<div className="f-12 text-info" style={{ marginTop: '.125rem' }}>{d.type}</div>)}
                                        {d.description && (
                                          <div className="f-10 f-w-300 text-secondary mt-2">
                                            <span title={d.description} style={dataShowMore.findIndex(t => t === d.description) > -1 ? { whiteSpace: 'pre-wrap' } : { display: '-webkit-box', WebkitLineClamp: '5', WebkitBoxOrient: 'vertical', whiteSpace: 'pre-wrap', overflow: 'hidden' }}>
                                              <Linkify>{d.description}</Linkify>
                                            </span>
                                            {dataShowMore.findIndex(t => t === d.description) < 0 && (d.description.length > (width <= 575 ? 240 : 600) || d.description.split('\\n').length > 5) && (
                                              <div onClick={() => setDataShowMore(dataShowMore.concat(d.description))} className="font-primary mt-2" style={{ cursor: 'pointer' }}>SHOW MORE</div>
                                            )}
                                            {dataShowMore.findIndex(t => t === d.description) > -1 && (
                                              <div onClick={() => setDataShowMore(dataShowMore.filter(t => t !== d.description))} className="font-secondary mt-2" style={{ cursor: 'pointer' }}>SHOW LESS</div>
                                            )}
                                          </div>
                                        )}
                                        {d.start_date && d.end_date && (<div className="f-14 f-w-500 d-flex align-items-center mt-2"><Clock className="mr-2" style={{ width: '1rem', height: 'auto' }} />{moment(d.start_date_time).format('MMM D, YYYY')} - {moment(d.end_date_time).format('MMM D, YYYY')}</div>)}
                                        {d.organizer && (<div className="f-14 f-w-500 d-flex align-items-center mt-2"><User className="mr-2" style={{ width: '1rem', height: 'auto' }} />{d.organizer}</div>)}
                                        {d.email && (<div className="f-14 f-w-500 d-flex align-items-center mt-2"><Mail className="mr-2" style={{ width: '1rem', height: 'auto' }} /><a href={`mailto:${d.email}`} target="_blank" rel="noopener noreferrer">{d.email}</a></div>)}
                                        {d.venue && (<div className="f-14 f-w-500 d-flex align-items-center mt-2"><MapPin className="mr-2" style={{ width: '1rem', height: 'auto' }} />{d.venue}</div>)}
                                        {d.venue && d.address && (<div className="f-12 f-w-400 text-secondary d-flex align-items-center mt-1 ml-4"><Linkify>{parse(d.address)}</Linkify></div>)}
                                      </Col>
                                    </Row>
                                  </div>
                                </div>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      }
                      {data.length % pageSize === 0 && !dataPageEnd && (<div className="text-center mt-3"><Button color="primary-2x" outline disabled={loading} onClick={() => setDataPage(dataPage + 1)}>{loading ? 'Loading...' : 'See more'}</Button></div>)}
                    </>
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

export default Events;
