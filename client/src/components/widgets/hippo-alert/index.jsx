import React, { Fragment, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, CardHeader, Media, Badge } from 'reactstrap';
import _ from 'lodash';
import numeral from 'numeral';
import Spinner from '../../spinner';
import { currenciesGroups } from '../../../layout/header/menus';
import { getAllCrypto } from '../../../api';
import { ALL_CRYPTO_DATA } from '../../../redux/actionTypes';
import { useIsMountedRef, getLocationData, numberOptimizeDecimal, capitalize } from '../../../utils';
import logo_min from '../../../assets/images/logo/logo_square.png';
import logo_dark_min from '../../../assets/images/logo/logo_square_white.png';

const HippoAlert = props => {
	const locationData = getLocationData(window);
	const isMountedRef = useIsMountedRef();
	const [alertData, setAlertData] = useState(null);
	const [dataLoading, setDataLoading] = useState(false);
	const [dataLoaded, setDataLoaded] = useState(false);
	const currency = locationData.params && locationData.params.currency && currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === locationData.params.currency.toLowerCase()).length > 0 ? locationData.params.currency.toLowerCase() : 'usd';
	const allCryptoData = useSelector(content => content.Data.all_crypto_data);
	const dispatch = useDispatch();

	useEffect(() => {
		const getData = async () => {
			if (isMountedRef.current) {
				setDataLoading(true);
			}
			try {
				let allCryptoData = await getAllCrypto();
				allCryptoData = allCryptoData ? allCryptoData : null;
				if (isMountedRef.current) {
					if (allCryptoData) {
						dispatch({ type: ALL_CRYPTO_DATA, payload: allCryptoData });
					}
				}
			} catch (err) {}
			if (isMountedRef.current) {
				setDataLoading(false);
				setDataLoaded(true);
			}
		};
		getData();
		const interval = setInterval(() => getData(), 120 * Number(process.env.REACT_APP_INTERVAL_MS));
		return () => clearInterval(interval);
	}, [isMountedRef, dispatch]);

	if (!allCryptoData && dataLoaded && isMountedRef.current) {
		setAlertData(null);
		setDataLoaded(false);
	}
	if (!alertData && isMountedRef.current) {
		if (locationData.params) {
			const data = locationData.params;
			Object.keys(data).forEach(key => { data[key] = key.startsWith('amount') ? Number(data[key]) : key.startsWith('is_') ? data[key] === 'true' : data[key]; });
			setAlertData(data);
		}
	}
	document.body.className = locationData.params && locationData.params.theme && locationData.params.theme.toLowerCase() === 'dark' ? 'dark-only' : 'light';
	const currencyData = _.head(_.uniq(currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === currency), 'id'));
	const data = alertData && alertData.symbol && allCryptoData && allCryptoData.coins && _.head(allCryptoData.coins.filter(c => c.symbol && c.symbol.toLowerCase() === alertData.symbol));
	const fromExchangeData = alertData && alertData.from_address_type === 'exchange' && alertData.from_address_name && allCryptoData && allCryptoData.exchanges && _.head(allCryptoData.exchanges.filter(e => (e.name && e.name.toLowerCase().split(' ').indexOf(alertData.from_address_name.toLowerCase()) > -1) || (e.id && e.id.toLowerCase().split(' ').indexOf(alertData.from_address_name.toLowerCase()) > -1)));
	const toExchangeData = alertData && alertData.to_address_type === 'exchange' && alertData.to_address_name && allCryptoData && allCryptoData.exchanges && _.head(allCryptoData.exchanges.filter(e => (e.name && e.name.toLowerCase().split(' ').indexOf(alertData.to_address_name.toLowerCase()) > -1) || (e.id && e.id.toLowerCase().split(' ').indexOf(alertData.to_address_name.toLowerCase()) > -1)));
	const minAmount = 10000000;
	const repeatEmoticon = (e, amount_usd, data) => [...Array(amount_usd < (data.transaction_type !== 'transfer' ? 1.5 : data.is_donation || data.is_hacked ? 1 : 5) * minAmount ? 1 : amount_usd < (data.transaction_type !== 'transfer' ? 3 : data.is_donation || data.is_hacked ? 2 : 10) * minAmount ? 2 : amount_usd < (data.transaction_type !== 'transfer' ? 10 : data.is_donation || data.is_hacked ? 5 : 50) * minAmount ? 3 : 4).keys()].map(i => e).join('');
	return (
		<Fragment>
			<Container fluid={true} style={{ maxWidth: '25rem' }}>
				<Row>
					<Col xs="12">
						{!data && dataLoading ?
							<div className="loader-box">
								<Spinner />
							</div>
							:
							data ?
								<Card className="bg-transparent border-0 mb-3" style={{ boxShadow: 'none' }}>
									<CardHeader className="widget-card-header bg-transparent p-0" style={{ borderBottom: 'none' }}>
										<Row>
											<Col lg="12" sm="12" xs="12">
												<div className="d-flex align-items-center">
													<h1 className={`w-100 f-${data.name.length > 20 ? 20 : data.name.length > 10 ? 24 : 28} f-w-500 d-flex align-items-center mb-0`}>
														<a href={`/coin/${data.id}`} target="_blank" rel="noopener noreferrer">
															{data.large && (<div className="avatar mr-2"><Media body className="img-60" src={data.large} alt={data.symbol && data.symbol.toUpperCase()} /></div>)}
														</a>
														<a href={`/coin/${data.id}`} target="_blank" rel="noopener noreferrer" className="text-right ml-auto" style={{ display: 'grid' }}>
															{data.name}
															{data.symbol && (<Badge color="light" pill className="f-12 f-w-300 ml-auto">{data.symbol.toUpperCase()}</Badge>)}
														</a>
													</h1>
												</div>
											</Col>
											<Col lg="12" sm="12" xs="12" className="mt-3 mb-1">
												<div className="h2 w-100 f-24 f-w-500 d-flex align-items-center justify-content-center">
													{alertData.amount && typeof alertData.amount === 'number' ?
														numberOptimizeDecimal(numeral(alertData.amount).format('0,0'))
														:
														'N/A'
													}
													&nbsp;
													{data.symbol.toUpperCase()}
												</div>
												{alertData.amount_usd && typeof alertData.amount_usd === 'number' && (
													<div className="h2 w-100 f-14 f-w-300 text-info d-flex align-items-center justify-content-center">
														({currencyData && currencyData.symbol}
														{numberOptimizeDecimal(numeral(alertData.amount_usd).format('0,0'))}
														{!(currencyData && currencyData.symbol) && (<>&nbsp;{currency.toUpperCase()}</>)})
													</div>
												)}
											</Col>
											<Col lg="12" sm="12" xs="12" className="px-4 mb-1">
												<div className="f-32 d-flex align-items-center justify-content-center mb-2">
													{repeatEmoticon(alertData.transaction_type === 'mint' ? '🖨' : alertData.transaction_type === 'burn' ? '🔥' : alertData.transaction_type === 'lock' ? '🔐' : alertData.transaction_type === 'unlock' ? '🔓' : alertData.is_donation ? '🎁' : alertData.is_hacked ? '🥷' : alertData.amount_usd < 5 * minAmount ? '🐬' : alertData.amount_usd < 10 * minAmount ? '🦈' : alertData.amount_usd < 50 * minAmount ? '🐳' : '🐋', alertData.amount_usd, alertData)}
													<a href={`${process.env.REACT_APP_WHALE_ALERT_URL}/transaction/${alertData.blockchain}/${alertData.key}`} target="_blank" rel="noopener noreferrer" className="f-18 f-w-500 ml-2">
														{alertData.transaction_type ? capitalize(alertData.is_donation ? 'donation' : alertData.is_hacked ? 'stolen funds' : alertData.transaction_type) : 'transaction'}
													</a>
												</div>
												{(alertData.transaction_type === 'burn' || alertData.transaction_type === 'transfer') && (
													<div className="d-flex align-items-center">
														<h2 className="my-auto ml-4" style={{ fontWeight: 'unset' }}><span className="f-14 text-secondary d-flex align-items-center">{alertData.transaction_type === 'burn' ? 'At' : 'From'}</span></h2>
														{alertData.from_address_name ?
															<div className="h3 f-16 f-w-400 ml-auto mr-3 mb-0">
																{fromExchangeData ?
																	<a href={`/exchange/${fromExchangeData.id}`} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center">
																		{fromExchangeData.large && (<div className="avatar mr-2"><Media body className="img-30" src={fromExchangeData.large} alt={fromExchangeData.name} /></div>)}
																		{alertData.from_address_name}
																	</a>
																	:
																	alertData.from_address_name
																}
															</div>
															:
															<div className="h3 f-14 f-w-400 ml-auto mr-3 mb-0">{"N/A"}</div>
														}
													</div>
												)}
												{alertData.transaction_type === 'transfer' && (<div className="f-24 d-flex align-items-center justify-content-center my-2" />)}
												{alertData.transaction_type !== 'burn' && (
													<div className="d-flex align-items-center">
														<h2 className="my-auto ml-4" style={{ fontWeight: 'unset' }}><span className="f-14 text-secondary d-flex align-items-center">{alertData.transaction_type !== 'burn' && alertData.transaction_type !== 'transfer' ? 'At' : 'To'}</span></h2>
														{alertData.to_address_name ?
															<div className="h3 f-16 f-w-400 ml-auto mr-3 mb-0">
																{toExchangeData ?
																	<a href={`/exchange/${toExchangeData.id}`} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center">
																		{toExchangeData.large && (<div className="avatar mr-2"><Media body className="img-30" src={toExchangeData.large} alt={toExchangeData.name} /></div>)}
																		{alertData.to_address_name}
																	</a>
																	:
																	alertData.to_address_name
																}
															</div>
															:
															<div className="h3 f-14 f-w-400 ml-auto mr-3 mb-0">{"N/A"}</div>
														}
													</div>
												)}
												{alertData.blockchain && (
													<div className="h2 w-100 f-10 f-w-300 text-secondary d-flex align-items-center justify-content-end mt-3 pr-3">
														{"Blockchain:"}
														&nbsp;
														{capitalize(alertData.blockchain)}
													</div>
												)}
											</Col>
											<Col lg="12" sm="12" xs="12" className="d-flex align-items-center mt-0 pt-1">
												<span className="f-10 text-secondary">
													{"Data from "}
													<a href="https://whale-alert.io" target="_blank" rel="noopener noreferrer" style={{ color: 'unset' }}>{"Whale Alert"}</a>
												</span>
												<a href="/" target="_blank" rel="noopener noreferrer" className="f-10 d-flex align-items-center justify-content-end ml-auto">
													<img className="img-fluid for-light" src={logo_min} alt={process.env.REACT_APP_APP_NAME} style={{ maxHeight: '1.25rem' }} />
													<img className="img-fluid for-dark" src={logo_dark_min} alt={process.env.REACT_APP_APP_NAME} style={{ maxHeight: '1.25rem' }} />
													&nbsp;{process.env.REACT_APP_APP_NAME}
												</a>
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

export default HippoAlert;
