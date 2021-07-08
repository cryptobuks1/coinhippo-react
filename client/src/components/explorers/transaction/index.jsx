import React, { Fragment, useState, useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
// import { useSelector } from 'react-redux';
import { Container, Row, Col, Card, CardHeader, CardBody, Media, Badge } from 'reactstrap';
import { Tooltip, message } from 'antd';
import { Copy, CheckCircle, XCircle } from 'react-feather';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import _ from 'lodash';
import convert from 'ether-converter';
import moment from 'moment';
import numeral from 'numeral';
import Spinner from '../../spinner';
import Error404 from '../../../pages/errors/error404';
import NotFound from '../../../pages/errors/notFound';
import { menus, currenciesGroups } from '../../../layout/header/menus';
import { getTransaction } from '../../../api';
import { useIsMountedRef, numberOptimizeDecimal } from '../../../utils';

const Transaction = props => {
	const chain = props.match ? props.match.params.chain : null;
	const txHash = props.match ? props.match.params.tx_hash : null;
	const chains = menus[0].subMenu[2][0].subMenu;
	const chainData = chains.findIndex(c => c.path === `/explorer/${chain}`) > -1 ? chains[chains.findIndex(c => c.path === `/explorer/${chain}`)] : null;
	const chainId = chainData && chainData.chain_id;
	const isMountedRef = useIsMountedRef();
	const [data, setData] = useState([]);
	const currency = 'usd'; // useSelector(content => content.Preferences.vs_currency);
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
			if (chainId && txHash) {
				if (isMountedRef.current) {
					setLoading(true);
				}
				const newData = data ? data : [];
				let size = 0;
				try {
					let transactionItemsData = await getTransaction(chainId, txHash, {});
					transactionItemsData = transactionItemsData && !transactionItemsData.error && transactionItemsData.data && transactionItemsData.data.items ? transactionItemsData.data.items : null;
					if (transactionItemsData) {
						for (let i = 0; i < transactionItemsData.length; i++) {
							newData[size] = transactionItemsData[i];
							size++;
						}
					}
				} catch (err) {}
				newData.length = size;
				if (isMountedRef.current) {
					if (size !== 0) {
						setData(newData.length > 0 ? newData : null);
					}
					setLoading(false);
				}
			}
		};
		getData();
		const interval = setInterval(() => getData(), Number(process.env.REACT_APP_INTERVAL_MS));
		return () => clearInterval(interval);
	}, [isMountedRef, chainId, txHash, data]);

	const currencyData = _.head(_.uniq(currenciesGroups.flatMap(currenciesGroup => currenciesGroup.currencies).filter(c => c.id === currency), 'id'));
	return (
		<Fragment>
			<Container fluid={true}>
				<Row>
					<Col xs="12">
						<Card className="bg-transparent border-0 px-0 px-lg-3 mx-0 mx-lg-1" style={{ boxShadow: 'none' }}>
							<CardHeader className="bg-transparent pt-0 pb-2 px-0">
								<h1 className="mb-0">
									<div className={`${width <= 575 ? 'f-14' : width <= 991 ? 'f-18' : 'f-20'} mb-2`} style={{ lineHeight: '1.25' }}>{"Transaction Details"}</div>
								</h1>
							</CardHeader>
							<CardBody className="pt-4 pb-3 px-1">
								{!data ?
									<Error404 />
									:
									data.length > 0 ?
										data.map((d, i) => (
											<Row key={i}>
												<Col xl="3" lg="4" md="4" xs="12" className="f-w-500 text-info d-inline-flex align-items-center" style={{ lineHeight: '100%' }}>
													{"Transaction Hash:"}
												</Col>
												<Col xl="9" lg="8" md="8" xs="12" className="d-inline-flex align-items-center mt-2 mt-md-0" style={{ overflowWrap: 'anywhere' }}>
													<CopyToClipboard text={d.tx_hash}>
														<div onClick={() => { message.destroy(); message.success('Copied'); }} className="f-12 f-w-300 d-flex align-items-center" style={{ cursor: 'pointer' }}>
															{d.tx_hash}
															<Badge color="light" pill className="f-12 ml-2"><Copy /></Badge>
														</div>
													</CopyToClipboard>
												</Col>
												<Col xl="3" lg="4" md="4" xs="12" className="f-w-500 text-info d-inline-flex align-items-center mt-3" style={{ lineHeight: '100%' }}>
													{"Status:"}
												</Col>
												<Col xl="9" lg="8" md="8" xs="12" className="d-inline-flex align-items-center mt-2 mt-md-3" style={{ overflowWrap: 'anywhere' }}>
													<div className="f-12 f-w-300 d-flex align-items-center">
														<Badge color={d.successful ? 'success' : 'danger'} pill className="f-12">{d.successful ? <CheckCircle className="mr-1" /> : <XCircle className="mr-1" />}{d.successful ? 'Success' : 'Failed'}</Badge>
													</div>
												</Col>
												<Col xl="3" lg="4" md="4" xs="12" className="f-w-500 text-info d-inline-flex align-items-center mt-3" style={{ lineHeight: '100%' }}>
													{"Time:"}
												</Col>
												<Col xl="9" lg="8" md="8" xs="12" className="d-inline-flex align-items-center mt-2 mt-md-3" style={{ overflowWrap: 'anywhere' }}>
													<div className="f-12 f-w-300 d-flex align-items-center">
														{moment(d.block_signed_at).fromNow()}&nbsp;<span className="f-w-200 text-info">({moment(d.block_signed_at).format('dddd, MMMM Do YYYY LTS')})</span>
													</div>
												</Col>
												<Col xl="3" lg="4" md="4" xs="12" className="f-w-500 text-info d-inline-flex align-items-center mt-3" style={{ lineHeight: '100%' }}>
													{"Block:"}
												</Col>
												<Col xl="9" lg="8" md="8" xs="12" className="d-inline-flex align-items-center mt-2 mt-md-3" style={{ overflowWrap: 'anywhere' }}>
													<div className="f-12 f-w-300 d-flex align-items-center">
														{d.block_height}
													</div>
												</Col>
												<Col xl="3" lg="4" md="4" xs="12" className="f-w-500 text-info d-inline-flex align-items-center mt-3" style={{ lineHeight: '100%' }}>
													{"From:"}
												</Col>
												<Col xl="9" lg="8" md="8" xs="12" className="mt-2 mt-md-3" style={{ overflowWrap: 'anywhere' }}>
													<div className="d-inline-flex align-items-center">
														{d.from_address ?
															<>
																<Link to={`/explorer/${chain}/${d.from_address}`}>{d.from_address}</Link>
																<CopyToClipboard text={d.from_address}>
																	<div onClick={() => { message.destroy(); message.success('Copied'); }} className="f-12 f-w-300 d-flex align-items-center" style={{ cursor: 'pointer' }}>
																		<Badge color="light" pill className="f-12 ml-2"><Copy /></Badge>
																	</div>
																</CopyToClipboard>
															</>
															:
															'N/A'
														}
													</div>
													{d.from_address_label && (<div className="f-12 f-w-200 text-info">{d.from_address_label}</div>)}
												</Col>
												<Col xl="3" lg="4" md="4" xs="12" className="f-w-500 text-info d-inline-flex align-items-center mt-3" style={{ lineHeight: '100%' }}>
													{"To:"}
												</Col>
												<Col xl="9" lg="8" md="8" xs="12" className="mt-2 mt-md-3" style={{ overflowWrap: 'anywhere' }}>
													<div className="d-inline-flex align-items-center">
														{d.to_address ?
															<>
																<Link to={`/explorer/${chain}/${d.to_address}`}>{d.to_address}</Link>
																<CopyToClipboard text={d.to_address}>
																	<div onClick={() => { message.destroy(); message.success('Copied'); }} className="f-12 f-w-300 d-flex align-items-center" style={{ cursor: 'pointer' }}>
																		<Badge color="light" pill className="f-12 ml-2"><Copy /></Badge>
																	</div>
																</CopyToClipboard>
															</>
															:
															'N/A'
														}
													</div>
													{d.to_address_label && (<div className="f-12 f-w-200 text-info">{d.to_address_label}</div>)}
												</Col>
												<Col xl="3" lg="4" md="4" xs="12" className="f-w-500 text-info d-inline-flex align-items-center mt-3" style={{ lineHeight: '100%' }}>
													{"Value:"}
												</Col>
												<Col xl="9" lg="8" md="8" xs="12" className="d-inline-flex align-items-center mt-2 mt-md-3" style={{ overflowWrap: 'anywhere' }}>
													<div className="f-12 f-w-300 d-flex align-items-center">
														<Badge color="light" pill className="f-12 mr-2">{convert(Number(d.value), 'wei', 'ether')}&nbsp;{chainData && chainData.unit}</Badge>
														{typeof d.value_quote === 'number' && (<span className="text-info">({currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(d.value_quote).format(d.value_quote > 1.01 ? '0,0.00' : '0,0.0000000000') !== 'NaN' ? numeral(d.value_quote).format(d.value_quote > 1.01 ? '0,0.00' : '0,0.0000000000') : d.value_quote.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))})</span>)}
													</div>
												</Col>
												<Col xl="3" lg="4" md="4" xs="12" className="f-w-500 text-info d-inline-flex align-items-center mt-3" style={{ lineHeight: '100%' }}>
													{"Transaction Fee:"}
												</Col>
												<Col xl="9" lg="8" md="8" xs="12" className="d-inline-flex align-items-center mt-2 mt-md-3" style={{ overflowWrap: 'anywhere' }}>
													<div className="f-12 f-w-300 d-flex align-items-center">
														{typeof d.gas_quote === 'number' && typeof d.gas_quote_rate === 'number' ? <>{numberOptimizeDecimal(numeral(d.gas_quote / d.gas_quote_rate).format(d.gas_quote / d.gas_quote_rate > 1.01 ? '0,0.00' : '0,0.0000000000') !== 'NaN' ? numeral(d.gas_quote / d.gas_quote_rate).format(d.gas_quote / d.gas_quote_rate > 1.01 ? '0,0.00' : '0,0.0000000000') : (d.gas_quote / d.gas_quote_rate).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))}&nbsp;{chainData && chainData.unit}&nbsp;&nbsp;</> : 'N/A'}
														{typeof d.gas_quote === 'number' && (<span className="text-info">({currencyData && currencyData.symbol}{numberOptimizeDecimal(numeral(d.gas_quote).format(d.gas_quote > 1.01 ? '0,0.00' : '0,0.0000000000') !== 'NaN' ? numeral(d.gas_quote).format(d.gas_quote > 1.01 ? '0,0.00' : '0,0.0000000000') : d.gas_quote.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 }))})</span>)}
													</div>
												</Col>
												<Col xl="3" lg="4" md="4" xs="12" className="f-w-500 text-info d-inline-flex align-items-center mt-3" style={{ lineHeight: '100%' }}>
													{"Gas Limit:"}
												</Col>
												<Col xl="9" lg="8" md="8" xs="12" className="d-inline-flex align-items-center mt-2 mt-md-3" style={{ overflowWrap: 'anywhere' }}>
													<div className="f-12 f-w-300 d-flex align-items-center">
														{numeral(d.gas_offered).format('0,0')}
													</div>
												</Col>
												<Col xl="3" lg="4" md="4" xs="12" className="f-w-500 text-info d-inline-flex align-items-center mt-3" style={{ lineHeight: '100%' }}>
													{"Gas Used by Transaction:"}
												</Col>
												<Col xl="9" lg="8" md="8" xs="12" className="d-inline-flex align-items-center mt-2 mt-md-3" style={{ overflowWrap: 'anywhere' }}>
													<div className="f-12 f-w-300 d-flex align-items-center">
														{numeral(d.gas_spent).format('0,0')}&nbsp;({numeral(d.gas_spent / d.gas_offered).format('0.00%')})
													</div>
												</Col>
												<Col xl="3" lg="4" md="4" xs="12" className="f-w-500 text-info d-inline-flex align-items-center mt-3" style={{ lineHeight: '100%' }}>
													{"Gas Price:"}
												</Col>
												<Col xl="9" lg="8" md="8" xs="12" className="d-inline-flex align-items-center mt-2 mt-md-3" style={{ overflowWrap: 'anywhere' }}>
													<div className="f-12 f-w-300 d-flex align-items-center">
														{convert(d.gas_price, 'wei', 'gwei')}&nbsp;{(chainData && chainData.gas_unit) || 'Gwei'}
													</div>
												</Col>
												{d.log_events && d.log_events.filter(e => e.decoded && e.decoded.name && e.decoded.name.toLowerCase() === 'transfer').length > 0 && (
													<>
														<Col xl="3" lg="4" md="4" xs="12" className="f-w-500 text-info d-inline-flex align-items-center mt-3" style={{ height: 'fit-content', ineHeight: '100%' }}>
															{"Tokens Transferred:"}
															{d.log_events.filter(e => e.decoded && e.decoded.name && e.decoded.name.toLowerCase() === 'transfer').length > 1 && (<Badge color="light" pill className="f-12 f-w-100 ml-1">{d.log_events.filter(e => e.decoded && e.decoded.name && e.decoded.name.toLowerCase() === 'transfer').length}</Badge>)}
														</Col>
														<Col xl="9" lg="8" md="8" xs="12" className="mt-2 mt-md-3" style={{ display: 'grid' }}>
															{_.reverse(d.log_events.filter(e => e.decoded && e.decoded.name && e.decoded.name.toLowerCase() === 'transfer')).map((e, j) => {
																const from = _.head(e.decoded.params.filter(p => p.name === 'from' && p.type === 'address'));
																if (from && from.value) {
																	from.address_label = from.value === d.from_address && d.from_address_label ? d.from_address_label : from.value === d.to_address && d.to_address_label ? d.to_address_label : '';
																}
																const to = _.head(e.decoded.params.filter(p => p.name === 'to' && p.type === 'address'));
																if (to && to.value) {
																	to.address_label = to.value === d.from_address && d.from_address_label ? d.from_address_label : to.value === d.to_address && d.to_address_label ? d.to_address_label : '';
																}
																const value = _.head(e.decoded.params.filter(p => p.name === 'value' && p.type === 'uint256'));
																return (
																	<div key={j} className={`f-12 mt-${j > 0 ? '2' : '0'}`} style={{ flexFlow: 'wrap' }}>
																		<div className="d-inline-flex align-items-center mr-2">
																			<span className="f-w-500 mr-1" style={{ minWidth: 'fit-content' }}>{"From"}</span>
																			<Tooltip placement="top" title={<div className="text-center" style={{ marginTop: '.125rem' }}>{from.value}{from.address_label && (<><br /><span className="f-w-500">({from.address_label})</span></>)}</div>} overlayClassName="f-10 f-w-200" overlayStyle={{ minWidth: 'fit-content' }}>
																				<Link to={`/explorer/${chain}/${from.value}`} className="text-truncate" style={{ maxWidth: '12.5rem' }}>{from.address_label || from.value}</Link>
																			</Tooltip>
																		</div>
																		<div className="d-inline-flex align-items-center mr-2">
																			<span className="f-w-500 mr-1" style={{ minWidth: 'fit-content' }}>{"To"}</span>
																			<Tooltip placement="top" title={<div className="text-center" style={{ marginTop: '.125rem' }}>{to.value}{to.address_label && (<><br /><span className="f-w-500">({to.address_label})</span></>)}</div>} overlayClassName="f-10 f-w-200" overlayStyle={{ minWidth: 'fit-content' }}>
																				<Link to={`/explorer/${chain}/${to.value}`} className="text-truncate" style={{ maxWidth: '12.5rem' }}>{to.address_label || to.value}</Link>
																			</Tooltip>
																		</div>
																		<div className="d-inline-flex align-items-center">
																			<span className="f-w-500 mr-1" style={{ minWidth: 'fit-content' }}>{"For"}</span>
																			<span className="d-inline-flex align-items-center" style={{ minWidth: 'fit-content' }}>
																				{numberOptimizeDecimal(numeral(value.value * Math.pow(10, -1 * e.sender_contract_decimals)).format('0,0.0000000000'))}&nbsp;&nbsp;
																				{e.sender_logo_url && (<div className="avatar mr-2"><Media body className="img-20" src={e.sender_logo_url} alt="" /></div>)}
																				{e.sender_name}
																				{e.sender_contract_ticker_symbol && (<Badge color="light" pill className="f-12 f-w-300 text-info ml-1">{e.sender_contract_ticker_symbol}</Badge>)}
																			</span>
																		</div>
																	</div>
																);
															})}
														</Col>
													</>
												)}
											</Row>
										))
										:
										!loading ?
											<NotFound message={<>Sorry, We are unable to locate this Transaction Hash:<br /><span className="f-14 text-info">{txHash}</span></>} />
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

export default Transaction;
