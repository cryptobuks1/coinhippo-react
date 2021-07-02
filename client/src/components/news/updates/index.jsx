import React, { Fragment, useState, useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, CardHeader, CardBody, Media, Badge, Nav, NavItem, NavLink, Button } from 'reactstrap';
import { Grid, List } from 'react-feather';
import Linkify from 'react-linkify';
import _ from 'lodash';
import moment from 'moment';
import Spinner from '../../spinner';
import Error404 from '../../../pages/errors/error404';
import { menus } from '../menus';
import { getStatusUpdates } from '../../../api';
import { useIsMountedRef, sleep, getName } from '../../../utils';

const Updates = props => {
	const pageSize = 50;
	const isMountedRef = useIsMountedRef();
	const [data, setData] = useState([]);
	const [displayTypeSelected, setDisplayTypeSelected] = useState('list');
	const [dataPage, setDataPage] = useState(0);
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
						let updatesData = await getStatusUpdates({ per_page: pageSize, page: i + 1 });
						updatesData = updatesData && updatesData.status_updates ? updatesData.status_updates : null;
						if (updatesData) {
							for (let j = 0; j < updatesData.length; j++) {
								newData[size] = updatesData[j];
								size++;
							}
							if (updatesData.length < pageSize) {
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
													<div className={`nav-link${m.path === '/updates' ? ' active' : ''}${width <= 991 ? ' f-12 p-2' : ''}`}>
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
											<div className={`${width <= 575 ? 'f-14' : width <= 991 ? 'f-18' : 'f-24'} text-${width <= 575 ? 'left' : 'center'} mb-2`} style={{ lineHeight: 'initial' }}>{"Project Update"}</div>
											<div className={`f-w-300 text-info f-${width <= 575 ? 10 : 14} text-${width <= 575 ? 'left mt-2' : 'center'}`} style={{ lineHeight: 1.5 }}>{"Keep up with significant cryptocurrency projects' updates, including milestone updates, partnership, fund movement, etc."}</div>
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
																		{d.project && (
																			<div className="d-flex align-items-center mb-2">
																				<h2 className={`w-100 f-${d.project.name.length > 20 ? 14 : d.project.name.length > 10 ? 20 : 28} f-w-500 d-flex align-items-center mb-0`}>
																					<a href={`/${d.project.type === 'Market' ? 'exchange' : 'coin'}/${d.project.id}`} target="_blank" rel="noopener noreferrer">
																						{d.project.image && d.project.image.large && (<div className="avatar mr-2"><Media body className="img-100" src={d.project.image.large} alt={d.project.symbol && d.project.symbol.toUpperCase()} /></div>)}
																					</a>
																					<a href={`/${d.project.type === 'Market' ? 'exchange' : 'coin'}/${d.project.id}`} target="_blank" rel="noopener noreferrer" className="text-right ml-auto" style={{ display: 'grid' }}>
																						{d.project.name}
																						{d.project.symbol && (<Badge color="light" pill className="f-12 f-w-300 ml-auto">{d.project.symbol.toUpperCase()}</Badge>)}
																					</a>
																				</h2>
																			</div>
																		)}
																		{d.user && (<div className="f-16 f-w-500">{d.user}</div>)}
																		{d.user && d.user_title && (<div className="f-12 f-w-400 text-secondary">{d.user_title}</div>)}
																		{d.description && (
																			<h2 className="f-12 f-w-300 mt-3 mb-0" style={{ lineHeight: 'unset' }}>
																				<span title={d.description} style={dataShowMore.findIndex(t => t === d.description) > -1 ? { whiteSpace: 'pre-wrap' } : { display: '-webkit-box', WebkitLineClamp: '5', WebkitBoxOrient: 'vertical', whiteSpace: 'pre-wrap', overflow: 'hidden' }}>
																					<Linkify>{d.description}</Linkify>
																				</span>
																				{dataShowMore.findIndex(t => t === d.description) < 0 && (d.description.length > 120 || d.description.split('\\n').length > 5) && (
																					<div onClick={() => setDataShowMore(dataShowMore.concat(d.description))} className="font-primary mt-2" style={{ cursor: 'pointer' }}>SHOW MORE</div>
																				)}
																				{dataShowMore.findIndex(t => t === d.description) > -1 && (
																					<div onClick={() => setDataShowMore(dataShowMore.filter(t => t !== d.description))} className="font-secondary mt-2" style={{ cursor: 'pointer' }}>SHOW LESS</div>
																				)}
																			</h2>
																		)}
																		<div className="text-secondary d-flex align-items-center mt-2">{moment(d.created_at).fromNow()}{d.category && (<Badge color="light" pill className="f-12 f-w-300 ml-auto">{getName(d.category, true)}</Badge>)}</div>
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
																			<Col lg="4" md="12" xs="12" className="mt-1 mt-lg-0">
																				{d.project && (
																					<div className="d-flex align-items-center">
																						<h2 className={`w-100 f-${d.project.name.length > 20 ? width <= 1200 ? 14 : 18 : d.project.name.length > 10 ? width <= 1200 ? 16 : 22 : width <= 1200 ? 24 : 32} f-w-500 d-flex align-items-center mb-0`}>
																							<a href={`/${d.project.type === 'Market' ? 'exchange' : 'coin'}/${d.project.id}`} target="_blank" rel="noopener noreferrer">
																								{d.project.image && d.project.image.large && (<div className="avatar mr-2"><Media body className="img-100" src={d.project.image.large} alt={d.project.symbol && d.project.symbol.toUpperCase()} /></div>)}
																							</a>
																							<a href={`/${d.project.type === 'Market' ? 'exchange' : 'coin'}/${d.project.id}`} target="_blank" rel="noopener noreferrer" className="text-right ml-auto ml-md-3 ml-xl-5" style={{ display: 'grid' }}>
																								{d.project.name}
																								{d.project.symbol && (<Badge color="light" pill className="f-12 f-w-300 ml-auto">{d.project.symbol.toUpperCase()}</Badge>)}
																							</a>
																						</h2>
																					</div>
																				)}
																			</Col>
																			<Col lg="8" md="12" xs="12" className="mt-3 mt-lg-0">
																				{d.user && (<div className="f-16 f-w-500">{d.user}</div>)}
																				{d.user && d.user_title && (<div className="f-12 f-w-400 text-secondary">{d.user_title}</div>)}
																				{d.description && (
																					<h2 className={`f-${width <= 575 ? 12 : 14} f-w-300 mt-3 mb-0`} style={{ maxWidth: '35rem', lineHeight: 'unset' }}>
																						<span title={d.description} style={{ whiteSpace: 'pre-wrap' }}>
																							<Linkify>{d.description}</Linkify>
																						</span>
																					</h2>
																				)}
																				<div className="text-secondary d-flex align-items-center mt-2">{moment(d.created_at_time).fromNow()}{d.category && (<Badge color="light" pill className="f-12 f-w-300 ml-auto">{getName(d.category, true)}</Badge>)}</div>
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

export default Updates;
