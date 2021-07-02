import React, { Fragment, useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardHeader } from 'reactstrap';
import { ArrowUp, ArrowDown } from 'react-feather';
import _ from 'lodash';
import numeral from 'numeral';
import Spinner from '../../spinner';
import Error404 from '../../../pages/errors/error404';
import { currenciesGroups } from '../../../layout/header/menus';
import { getGlobal, getAllCrypto } from '../../../api';
import { useIsMountedRef, getLocationData } from '../../../utils';

const Global = props => {
	const locationData = getLocationData(window);
	const isMountedRef = useIsMountedRef();
	const [data, setData] = useState(null);
	const [dataLoading, setDataLoading] = useState(false);
	const [dataLoaded, setDataLoaded] = useState(false);
	const [allCryptoData, setAllCryptoData] = useState(null);
	const currency = locationData.params && locationData.params.currency && currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === locationData.params.currency.toLowerCase()).length > 0 ? locationData.params.currency.toLowerCase() : 'usd';

	useEffect(() => {
		const getData = async () => {
			if (isMountedRef.current) {
				setDataLoading(true);
			}
			try {
				let globalData = await getGlobal();
				globalData = globalData && globalData.data ? globalData.data : null;
				if (isMountedRef.current) {
					if (globalData) {
						setData(globalData);
					}
				}
			} catch (err) {}
			if (isMountedRef.current) {
				setDataLoading(false);
				setDataLoaded(true);
			}
		};
		getData();
		const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
		return () => clearInterval(interval);
	}, [isMountedRef, currency]);

	useEffect(() => {
		const getData = async () => {
			try {
				let allCryptoData = await getAllCrypto();
				allCryptoData = allCryptoData ? allCryptoData : null;
				if (isMountedRef.current) {
					if (allCryptoData) {
						setAllCryptoData(allCryptoData);
					}
				}
			} catch (err) {}
		};
		getData();
		const interval = setInterval(() => getData(), 120 * Number(process.env.REACT_APP_INTERVAL_MS));
		return () => clearInterval(interval);
	}, [isMountedRef, currency]);

	document.body.className = locationData.params && locationData.params.theme && locationData.params.theme.toLowerCase() === 'dark' ? 'dark-only' : 'light';
	const currencyData = _.head(_.uniq(currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === currency), 'id'));
	return (
		<Fragment>
			<Container fluid={true} style={{ maxWidth: '60rem' }}>
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
									<Card className="bg-transparent border-0 mb-0" style={{ boxShadow: 'none' }}>
										<CardHeader className="widget-card-header bg-transparent p-0" style={{ borderBottom: 'none' }}>
											<Row>
												<Col lg="12" sm="12" xs="12">
													<div className="d-flex align-items-center" style={{ overflowX: 'auto' }}>
														<p className="mb-0"><span className="f-12 f-w-400 mr-1">{"Coins:"}</span><a href="/coins" target="_blank" rel="noopener noreferrer">{data.active_cryptocurrencies ? numeral(data.active_cryptocurrencies).format('0,0') : ''}</a></p>
														<p className="d-flex align-items-center mb-0 ml-3"><span className="f-12 f-w-400 mr-1">{"Market"}&nbsp;{"Cap:"}</span>
															<span className="f-w-400 text-info d-inline-flex align-items-center">
																<a href="/coins" target="_blank" rel="noopener noreferrer">
																	{data.total_market_cap && data.total_market_cap[currency] ?
																		<>
																			{currencyData && currencyData.symbol}
																			{numeral(data.total_market_cap[currency]).format('0,0')}
																			{!(currencyData && currencyData.symbol) && <>&nbsp;{currency.toUpperCase()}</>}
																		</>
																		:
																		''
																	}
																</a>
																{typeof data.market_cap_change_percentage_24h_usd === 'number' && data.market_cap_change_percentage_24h_usd !== 0 && (<span className={`font-${data.market_cap_change_percentage_24h_usd < 0 ? 'danger' : 'success'} d-inline-flex align-items-center`}>{data.market_cap_change_percentage_24h_usd < 0 ? <ArrowDown style={{ width: '.85rem', marginTop: '-2px' }} /> : <ArrowUp style={{ width: '.85rem', marginTop: '-2px' }} />}{numeral(data.market_cap_change_percentage_24h_usd / 100).format('0,0.00%')}</span>)}
															</span>
														</p>
														<p className="mb-0 ml-3"><span className="f-12 f-w-400 mr-1">{"24h"}&nbsp;{"Vol:"}</span>
															<span className="f-w-400 text-info">
																<a href="/exchanges" target="_blank" rel="noopener noreferrer">
																	{data.total_volume && data.total_volume[currency] ?
																		<>
																			{currencyData && currencyData.symbol}
																			{numeral(data.total_volume[currency]).format('0,0')}
																			{!(currencyData && currencyData.symbol) && <>&nbsp;{currency.toUpperCase()}</>}
																		</>
																		:
																		''
																	}
																</a>
															</span>
														</p>
														<p className="mb-0 ml-3">
															<span className="f-12 f-w-400 mr-1">{"Dominance:"}</span><span className="f-w-400 text-info">
																{data.market_cap_percentage && Object.keys(data.market_cap_percentage).length > 0 ?
																	_.slice(_.orderBy(Object.keys(data.market_cap_percentage).map(key => {
																		const coinIndex = allCryptoData && allCryptoData.coins ? allCryptoData.coins.findIndex(c => c.symbol && c.symbol.toLowerCase() === key) : -1;
																		const url = coinIndex > -1 ? `/coin/${allCryptoData.coins[coinIndex].id}` : null;
																		return { id: key, value: data.market_cap_percentage[key], url };
																	}).filter(x => typeof x.value === 'number'), ['value'], ['desc']), 0, 2).map((x, i) => (
																		<span key={i} className={`${i > 0 ? 'ml-1' : ''}`}>
																			{x.url ?
																				<><a href={x.url} target="_blank" rel="noopener noreferrer">{x.id.toUpperCase()}</a>&nbsp;{numeral(x.value / 100).format(`0,0.00%`)}</>
																				:
																				<>{x.id.toUpperCase()}&nbsp;{numeral(x.value / 100).format(`0,0.00%`)}</>
																			}
																		</span>
																	))
																	:
																	''
																}
															</span>
														</p>
													</div>
												</Col>
											</Row>
										</CardHeader>
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

export default Global;
