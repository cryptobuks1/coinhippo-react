import React, { Fragment, useState, useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Row, Col, Card, CardHeader, CardBody, Media, Badge, Nav, NavItem, NavLink, Button } from 'reactstrap';
import { Tooltip } from 'antd';
import { Grid, List } from 'react-feather';
import _ from 'lodash';
import moment from 'moment';
import Spinner from '../../spinner';
import Error404 from '../../../pages/errors/error404';
import { menus } from '../menus';
import { getNews } from '../../../api';
import { useIsMountedRef, sleep, getName } from '../../../utils';

const News = props => {
  const pageSize = 20;
  const isMountedRef = useIsMountedRef();
  const [data, setData] = useState([]);
  const [displayTypeSelected, setDisplayTypeSelected] = useState('list');
  const [dataPage, setDataPage] = useState(0);
  const [dataPageEnd, setDataPageEnd] = useState(false);
  const [loading, setLoading] = useState(false);
  const allCryptoData = useSelector(content => content.Data.all_crypto_data);
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
    const getData = async lastPageOnly => {
      if (isMountedRef.current) {
        setLoading(true);
      }
      const newData = data ? data : [];
      let size = 0;
      for (let i = 0; i <= dataPage; i++) {
        try {
          if (!lastPageOnly || i === dataPage) {
            await sleep(i === 0 ? 0 : 500);
            let newsData = await getNews({ public: true, page: i + 1 });
            const count = newsData && typeof newsData.count === 'number' ? newsData.count : null;
            const next = newsData && newsData.next;
            newsData = newsData && newsData.results ? newsData.results : null;
            if (newsData) {
              for (let j = 0; j < newsData.length; j++) {
                newData[size] = newsData[j];
                size++;
              }
              if (newsData.length < pageSize || newsData.length >= count || !next) {
                if (isMountedRef.current) {
                  setDataPageEnd(true);
                }
                break;
              }
            }
          }
          else {
            size += pageSize;
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
    getData(true);
    const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
    return () => clearInterval(interval);
  }, [isMountedRef, data, dataPage]);

  const filteredData = data && data.map((d, i) => {
    d.created_at_time = moment(d.created_at ? d.created_at : undefined).valueOf();
    d.currencies = d.currencies && d.currencies.filter(c => allCryptoData && allCryptoData.coins && allCryptoData.coins.findIndex(cc => (cc.symbol && c.code && cc.symbol.toLowerCase() === c.code.toLowerCase()) || (cc.id && c.slug && cc.id.toLowerCase() === c.slug.toLowerCase()) || (cc.name && c.title && cc.name.toLowerCase() === c.title.toLowerCase())) > -1).map(c => { return { ...c, project: allCryptoData.coins[allCryptoData.coins.findIndex(cc => (cc.symbol && c.code && cc.symbol.toLowerCase() === c.code.toLowerCase()) || (cc.id && c.slug && cc.id.toLowerCase() === c.slug.toLowerCase()) || (cc.name && c.title && cc.name.toLowerCase() === c.title.toLowerCase()))] }; });
    return d;
  }).filter((d, i) => (i < (dataPage + (dataPage < 0 ? 2 : 1)) * (dataPage < 0 ? 10 : pageSize)));
  const sortedData = _.orderBy(filteredData, ['created_at_time'], ['desc']);
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
                          <div className={`nav-link${m.path === '/news' ? ' active' : ''}${width <= 991 ? ' f-12 p-2' : ''}`}>
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
                      <div className={`${width <= 575 ? 'f-14' : width <= 991 ? 'f-18' : 'f-24'} text-${width <= 575 ? 'left' : 'center'} mb-2`} style={{ lineHeight: 'initial' }}>{"The Latest Cryptocurrency News"}</div>
                      <div className={`f-w-300 text-info f-${width <= 575 ? 10 : 14} text-${width <= 575 ? 'left mt-2' : 'center'}`} style={{ lineHeight: 1.5 }}>{"Keep up with breaking news on cryptocurrencies that influence the market."}</div>
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
                                    {d.currencies && d.currencies.length > 0 ?
                                      d.currencies.length === 1 ?
                                        d.currencies.map((c, i) => (
                                          <div key={i} className="h-100 d-flex align-items-center mb-2">
                                            <h2 className={`w-100 f-${c.project.name.length > 20 ? 14 : c.project.name.length > 10 ? 20 : 28} f-w-500 d-flex align-items-center mb-0`}>
                                              <a href={`/coin/${c.project.id}`} target="_blank" rel="noopener noreferrer">
                                                {c.project.large && (<div className="avatar mr-2"><Media body className="img-100" src={c.project.large} alt={c.project.symbol && c.project.symbol.toUpperCase()} /></div>)}
                                              </a>
                                              <a href={`/coin/${c.project.id}`} target="_blank" rel="noopener noreferrer" className="text-right ml-auto" style={{ display: 'grid' }}>
                                                {c.project.name}
                                                {c.project.symbol && (<Badge color="light" pill className="f-12 f-w-300 ml-auto">{c.project.symbol.toUpperCase()}</Badge>)}
                                              </a>
                                            </h2>
                                          </div>
                                        ))
                                        :
                                        <div className="d-flex align-items-center mb-2" style={{ flexWrap: 'wrap' }}>
                                          {d.currencies.map((c, i) => (
                                            <div key={i} className={`d-flex align-items-center mb-1 mb-md-2 mr-${i === d.currencies.length - 1 ? 0 : '2 mr-md-3'}`} style={{ width: 'fit-content' }}>
                                              <h2 className={`w-auto f-${width <= 1200 ? 16 : 22} f-w-500 d-flex align-items-center mb-0`}>
                                                <a href={`/coin/${c.project.id}`} target="_blank" rel="noopener noreferrer">
                                                  {c.project.large && (<div className="avatar mr-2"><Media body className="img-50" src={c.project.large} alt={c.project.symbol && c.project.symbol.toUpperCase()} /></div>)}
                                                </a>
                                                <a href={`/coin/${c.project.id}`} target="_blank" rel="noopener noreferrer" className="text-right ml-auto">
                                                  {c.project.symbol ? c.project.symbol.toUpperCase() : c.project.name}
                                                </a>
                                              </h2>
                                            </div>
                                          ))}
                                        </div>
                                      :
                                      <div className="h-100 f-56 d-flex align-items-center justify-content-center">
                                        <a href={d.url ? d.url.replace(d.slug, 'click/') : '/news'} target="_blank" rel="noopener noreferrer" style={{ color: 'unset' }}>
                                          {d.kind === 'media' ?
                                            d.domain && d.domain.indexOf('youtube') > -1 ?
                                              <i className="icofont icofont-social-youtube-play font-secondary" />
                                              :
                                              '🎙'
                                            :
                                            '📰'
                                          }
                                        </a>
                                      </div>
                                    }
                                    {d.kind && (<Badge color="light" pill className="f-12 f-w-300">{getName(d.kind, true)}</Badge>)}
                                    <h2 className="f-16 f-w-400 d-flex align-items-center mt-2 mb-0" style={{ lineHeight: 'unset' }}>
                                      <a href={d.url ? d.url.replace(d.slug, 'click/') : '/news'} target="_blank" rel="noopener noreferrer">{d.title}</a>
                                    </h2>
                                    {d.votes && Object.keys(d.votes).findIndex(v => v !== 'saved' && d.votes[v] > 0) > -1 && (
                                      <div className="d-flex align-items-center mt-2">
                                        {Object.keys(d.votes).filter(v => v !== 'saved' && d.votes[v] > 0).map((v, i) => (
                                          <span key={i} className={`f-12 text-info d-flex align-items-center mr-${i === Object.keys(d.votes).filter(v => v !== 'saved' && d.votes[v] > 0).length - 1 ? 0 : 2}`}><Tooltip title={getName(v, true)}><span className="f-16">{v === 'negative' ? '🙁' : v === 'positive' ? '🙂' : v === 'important' ? '⭐' : v === 'liked' ? '👍' : v === 'disliked' ? '👎' : v === 'lol' ? '🤣' : v === 'toxic' ? '😰' : v === 'saved' ? '🧐' : v === 'comments' ? '💬' : getName(v, true)}</span></Tooltip>&nbsp;{d.votes[v]}</span>
                                        ))}
                                      </div>
                                    )}
                                    <div className="d-flex align-items-center mt-2">
                                      <a href={d.url ? d.url.replace(d.slug, 'click/') : '/news'} target="_blank" rel="noopener noreferrer" style={{ color: 'unset' }}>
                                        {d.source && d.source.title && (<div className="f-14 f-w-500">{d.source.title}</div>)}
                                        {d.source && d.source.domain && (<div className="f-12 f-w-400 text-secondary">{d.source.domain}</div>)}
                                      </a>
                                      <div className="f-12 text-secondary d-flex align-items-center ml-auto">{moment(d.created_at_time).fromNow()}</div>
                                    </div>
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
                              <Card className="mb-0 mx-auto p-3" style={{ maxWidth: '65rem', boxShadow: 'none' }}>
                                <div className="media">
                                  <div className="media-body" style={{ maxWidth: '100%' }}>
                                    <Row>
                                      <Col lg="4" md="12" xs="12" className="mt-1 mt-lg-0">
                                        {d.currencies && d.currencies.length > 0 ?
                                          d.currencies.length === 1 ?
                                            d.currencies.map((c, i) => (
                                              <div key={i} className="h-100 d-flex align-items-center">
                                                <h2 className={`w-100 f-${c.project.name.length > 20 ? width <= 1200 ? 14 : 18 : c.project.name.length > 10 ? width <= 1200 ? 16 : 18 : width <= 1200 ? 24 : 28} f-w-500 d-flex align-items-center mb-0`}>
                                                  <a href={`/coin/${c.project.id}`} target="_blank" rel="noopener noreferrer">
                                                    {c.project.large && (<div className="avatar mr-2"><Media body className="img-100" src={c.project.large} alt={c.project.symbol && c.project.symbol.toUpperCase()} /></div>)}
                                                  </a>
                                                  <a href={`/coin/${c.project.id}`} target="_blank" rel="noopener noreferrer" className="text-right ml-auto ml-md-3 ml-xl-5" style={{ display: 'grid' }}>
                                                    {c.project.name}
                                                    {c.project.symbol && (<Badge color="light" pill className="f-12 f-w-300 ml-auto">{c.project.symbol.toUpperCase()}</Badge>)}
                                                  </a>
                                                </h2>
                                              </div>
                                            ))
                                            :
                                            <div className="d-flex align-items-center" style={{ flexWrap: 'wrap' }}>
                                              {d.currencies.map((c, i) => (
                                                <div key={i} className={`d-flex align-items-center mb-1 mb-md-2 mr-${i === d.currencies.length - 1 ? 0 : '2 mr-md-3'}`} style={{ width: 'fit-content' }}>
                                                  <h2 className={`w-auto f-${width <= 1200 ? 16 : 24} f-w-500 d-flex align-items-center mb-0`}>
                                                    <a href={`/coin/${c.project.id}`} target="_blank" rel="noopener noreferrer">
                                                      {c.project.large && (<div className="avatar mr-2"><Media body className="img-50" src={c.project.large} alt={c.project.symbol && c.project.symbol.toUpperCase()} /></div>)}
                                                    </a>
                                                    <a href={`/coin/${c.project.id}`} target="_blank" rel="noopener noreferrer" className="text-right ml-auto ml-md-1">
                                                      {c.project.symbol ? c.project.symbol.toUpperCase() : c.project.name}
                                                    </a>
                                                  </h2>
                                                </div>
                                              ))}
                                            </div>
                                          :
                                          <div className={`h-100 f-56 d-flex align-items-center justify-content-${width > 575 && width <= 991 ? 'start' : 'center'}`}>
                                            <a href={d.url ? d.url.replace(d.slug, 'click/') : '/news'} target="_blank" rel="noopener noreferrer" style={{ color: 'unset' }}>
                                              {d.kind === 'media' ?
                                                d.domain && d.domain.indexOf('youtube') > -1 ?
                                                  <i className="icofont icofont-social-youtube-play font-secondary" />
                                                  :
                                                  '🎙'
                                                :
                                                '📰'
                                              }
                                            </a>
                                          </div>
                                        }
                                      </Col>
                                      <Col lg="8" md="12" xs="12" className="mt-3 mt-lg-0">
                                        {d.kind && (<Badge color="light" pill className="f-12 f-w-300">{getName(d.kind, true)}</Badge>)}
                                        <h2 className="f-16 f-w-400 d-flex align-items-center mt-2 mb-0" style={{ maxWidth: '35rem', lineHeight: 'unset' }}>
                                          <a href={d.url ? d.url.replace(d.slug, 'click/') : '/news'} target="_blank" rel="noopener noreferrer">{d.title}</a>
                                        </h2>
                                        {d.votes && Object.keys(d.votes).findIndex(v => v !== 'saved' && d.votes[v] > 0) > -1 && (
                                          <div className="d-flex align-items-center mt-2">
                                            {Object.keys(d.votes).filter(v => v !== 'saved' && d.votes[v] > 0).map((v, i) => (
                                              <span key={i} className={`f-${width <= 575 ? 12 : 14} text-info d-flex align-items-center mr-${i === Object.keys(d.votes).filter(v => v !== 'saved' && d.votes[v] > 0).length - 1 ? 0 : 2}`}><Tooltip title={getName(v, true)}><span className={`f-${width <= 575 ? 16 : 18}`}>{v === 'negative' ? '🙁' : v === 'positive' ? '🙂' : v === 'important' ? '⭐' : v === 'liked' ? '👍' : v === 'disliked' ? '👎' : v === 'lol' ? '🤣' : v === 'toxic' ? '😰' : v === 'saved' ? '🧐' : v === 'comments' ? '💬' : getName(v, true)}</span></Tooltip>&nbsp;{d.votes[v]}</span>
                                            ))}
                                          </div>
                                        )}
                                        <div className="d-flex align-items-center mt-2">
                                          <a href={d.url ? d.url.replace(d.slug, 'click/') : '/news'} target="_blank" rel="noopener noreferrer" style={{ color: 'unset' }}>
                                            {d.source && d.source.title && (<div className={`f-${width <=575 ? 14 : 16} f-w-500`}>{d.source.title}</div>)}
                                            {d.source && d.source.domain && (<div className="f-12 f-w-400 text-secondary">{d.source.domain}</div>)}
                                          </a>
                                          <div className={`f-${width <=575 ? 12 : 14} text-secondary d-flex align-items-center ml-auto`}>{moment(d.created_at_time).fromNow()}</div>
                                        </div>
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

export default News;
