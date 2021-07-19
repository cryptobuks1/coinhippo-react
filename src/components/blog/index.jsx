import React, { Fragment, useState, useEffect, useLayoutEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Row, Col, Card, CardHeader, CardBody, Badge } from 'reactstrap';
import parse from 'html-react-parser';
import Linkify from 'react-linkify';
import _ from 'lodash';
import Spinner from '../spinner';
import Error404 from '../../pages/errors/error404';
import { getAllBlogs, getBlog } from '../../api';
import { useIsMountedRef, getName } from '../../utils';

const Blog = props => {
  const categoryId = props.match ? props.match.params.category_id : null;
  const postId = props.match ? props.match.params.post_id : null;
  const isMountedRef = useIsMountedRef();

  const [allBlogs, setAllBlogs] = useState([]);
  const [data, setData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

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
        const allBlogData = await getAllBlogs();
        if (isMountedRef.current) {
          if (allBlogData) {
            setAllBlogs(allBlogData);
          }
        }
      } catch (err) {}
    };
    getData();
  }, [isMountedRef]);

  useEffect(() => {
    const getData = async () => {
      if (isMountedRef.current) {
        setDataLoading(true);
      }
      try {
        const blogData = await getBlog(categoryId, postId, null, true);
        if (isMountedRef.current) {
          if (blogData) {
            setData(blogData);
          }
        }
      } catch (err) {}
      if (isMountedRef.current) {
        setDataLoading(false);
        setDataLoaded(true);
      }
    };
    if (categoryId) {
      getData();
    }
  }, [isMountedRef, categoryId, postId]);

  if (window.location.pathname.startsWith('/blog') && !categoryId && _.orderBy(allBlogs.filter(b => !b.post_id), ['order'], ['asc'])[0]) {
    return <Redirect to={`/blog/${_.orderBy(allBlogs.filter(b => !b.post_id), ['order'], ['asc'])[0].category_id}`} />;
  }

  return (
    <Fragment>
      <Container fluid={true}>
        <Row>
          <Col xs="12">
            {!data && dataLoaded ?
              <Error404 />
              :
              !data && dataLoading ?
                <div className="loader-box">
                  <Spinner />
                </div>
                :
                data ?
                  <Card className="blog-card bg-transparent border-0" style={{ boxShadow: 'none', fontFamily: 'Inter,sans-serif' }}>
                    {allBlogs.filter(b => !b.post_id).length > 1 && (
                      <CardHeader className={`blog-menus ${width <= 1200 ? '' : 'b-t-light b-b-light'} b-r-0 border-0 d-flex py-3`} style={{ overflowX: 'auto' }}>
                        {_.orderBy(allBlogs.filter(b => !b.post_id), ['order'], ['asc']).map((b, i) => (
                          <a key={i} href={`/blog/${b.category_id}`} className={`f-w-600${i === 0 ? ' ml-auto' : ''} pl-${i === 0 ? 0 : 4}`} style={{ color: 'unset' }}>{b.title || getName(b.category_id, true)}</a>
                        ))}
                      </CardHeader>
                    )}
                    <CardBody className="pt-3 px-0">
                      <div className="mx-auto" style={{ maxWidth: '47.5rem' }}>
                        {postId && allBlogs.filter(b => b.category_id === categoryId && !b.post_id).map((b, i) => (
                          <div key={i} className="pb-2">
                            <a href={`/blog/${b.category_id}`} className="f-w-600">{b.title || getName(b.category_id, true)}</a>
                          </div>
                        ))}
                        <h1 className={`${width <= 575 ? 'f-30' : ''} f-w-700 my-2`}>{data.title}</h1>
                        {postId && (<div className="f-12 f-w-400 text-secondary mt-4">{"Chapter "}{data.order}</div>)}
                        <div className="d-flex align-items-center mt-3">
                          <a href={`https://twitter.com/intent/tweet?original_referer=${process.env.REACT_APP_SITE_URL}&text=${data.title}&url=${process.env.REACT_APP_SITE_URL}/blog/${categoryId}${postId ? `/${postId}` : ''}&via=${process.env.REACT_APP_TWITTER_NAME}`} target="_blank" rel="noopener noreferrer">
                            <Badge pill className="twitter-share f-12 d-inline-flex align-items-center"><i className="icofont icofont-social-twitter f-16 mr-1" />Tweet</Badge>
                          </a>
                          &nbsp;&nbsp;
                          <a href={`https://telegram.me/share/url?text=${data.title}&url=${process.env.REACT_APP_SITE_URL}/blog/${categoryId}${postId ? `/${postId}` : ''}`} target="_blank" rel="noopener noreferrer">
                            <Badge pill className="telegram-share f-12 d-inline-flex align-items-center"><i className="icofont icofont-social-telegram f-16 mr-1" />Share</Badge>
                          </a>
                          &nbsp;&nbsp;
                          <a href={`https://wa.me/?text=${process.env.REACT_APP_SITE_URL}/blog/${categoryId}${postId ? `/${postId}` : ''}`} target="_blank" rel="noopener noreferrer">
                            <Badge pill className="whatsapp-share f-12 d-inline-flex align-items-center"><i className="icofont icofont-social-whatsapp f-16 mr-1" />Share</Badge>
                          </a>
                        </div>
                        <div className="f-18 f-w-400 mt-2 mb-5 pt-4 pb-5">
                          {data.html && (<Linkify>{parse(data.html)}</Linkify>)}
                        </div>
                        <div className="b-t-light pt-2">
                          {!postId ?
                            <>
                              {allBlogs.filter(b => b.category_id === categoryId && b.post_id && b.post_id !== postId).length > 0 && (
                                <>
                                  <div className={`${width <= 575 ? 'f-18' : 'f-24'} f-w-700 my-4`}>{allBlogs.findIndex(b => b.category_id === categoryId && !b.post_id && b.title) > -1 ? `📖 All ${allBlogs[allBlogs.findIndex(b => b.category_id === categoryId && !b.post_id && b.title)].title}` : 'Related Topics:'}</div>
                                  {_.orderBy(allBlogs.filter(b => b.category_id === categoryId && b.post_id && b.post_id !== postId), ['order'], ['asc']).map((b, i) => (
                                    <div key={i} className={`${width <= 575 ? 'f-16' : 'f-20'} f-w-500 mt-3`}>
                                      <div className="f-12 f-w-400 text-secondary">{"Chapter "}{b.order}</div>
                                      <a href={`/blog/${b.category_id}/${b.post_id}`}>{b.title || (b.meta && b.meta.title) || getName(b.post_id, true)}</a>
                                    </div>
                                  ))}
                                </>
                              )}
                            </>
                            :
                            <>
                              {_.orderBy(allBlogs.filter(b => b.category_id === categoryId && b.post_id), ['order'], ['asc']).findIndex(b => b.post_id === postId) + 1 < allBlogs.filter(b => b.category_id === categoryId && b.post_id).length && (
                                <>
                                  <div className={`${width <= 575 ? 'f-18' : 'f-24'} f-w-700 my-4`}>{"Next"}</div>
                                  {[_.orderBy(allBlogs.filter(b => b.category_id === categoryId && b.post_id), ['order'], ['asc'])[_.orderBy(allBlogs.filter(b => b.category_id === categoryId && b.post_id), ['order'], ['asc']).findIndex(b => b.post_id === postId) + 1]].map((b, i) => (
                                    <div key={i} className={`${width <= 575 ? 'f-16' : 'f-20'} f-w-500 mt-3`}>
                                      <div className="f-12 f-w-400 text-secondary">{"Chapter "}{b.order}</div>
                                      <a href={`/blog/${b.category_id}/${b.post_id}`}>{b.title || (b.meta && b.meta.title) || getName(b.post_id, true)}</a>
                                    </div>
                                  ))}
                                </>
                              )}
                              {_.orderBy(allBlogs.filter(b => b.category_id === categoryId && b.post_id), ['order'], ['asc']).findIndex(b => b.post_id === postId) - 1 > -1 && _.orderBy(allBlogs.filter(b => b.category_id === categoryId && b.post_id), ['order'], ['asc']).findIndex(b => b.post_id === postId) + 1 < allBlogs.filter(b => b.category_id === categoryId && b.post_id).length && (
                                <div className="py-2" />
                              )}
                              {_.orderBy(allBlogs.filter(b => b.category_id === categoryId && b.post_id), ['order'], ['asc']).findIndex(b => b.post_id === postId) - 1 > -1 && (
                                <>
                                  <div className={`${width <= 575 ? 'f-18' : 'f-24'} f-w-700 my-4`}>{"Previous"}</div>
                                  {[_.orderBy(allBlogs.filter(b => b.category_id === categoryId && b.post_id), ['order'], ['asc'])[_.orderBy(allBlogs.filter(b => b.category_id === categoryId && b.post_id), ['order'], ['asc']).findIndex(b => b.post_id === postId) - 1]].map((b, i) => (
                                    <div key={i} className={`${width <= 575 ? 'f-16' : 'f-20'} f-w-500 mt-3`}>
                                      <div className="f-12 f-w-400 text-secondary">{"Chapter "}{b.order}</div>
                                      <a href={`/blog/${b.category_id}/${b.post_id}`}>{b.title || (b.meta && b.meta.title) || getName(b.post_id, true)}</a>
                                    </div>
                                  ))}
                                </>
                              )}
                            </>
                          }
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                  :
                  null
            }
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
}

export default Blog;
