import React, { Fragment, useState, useEffect } from 'react';
import Tada from 'react-reveal/Tada';
import logo from '../../assets/images/logo/logo_square.png';
import logo_dark from '../../assets/images/logo/logo_square_white.png';
import { sleep } from '../../utils';

const Loader = props => {
	const [show, setShow] = useState(true);
	const [spy, setSpy] = useState(0);

	useEffect(() => {
		const timeout = setTimeout(() => setShow(false), 1000);
		return () => clearTimeout(timeout);
	}, [show]);

	useEffect(() => {
		const update = async () => {
			if (spy > 0) {
				await sleep(1000);
			}
			setSpy(spy + 1);
		};
		update();
	}, [spy]);

	return (
		<Fragment>
			<div className={`loader-wrapper ${show ? '' : 'loderhide'}`}>
				{/*<div className="loader-index"><span></span></div>
				<svg>
					<defs></defs>
					<filter id="goo">
						<fegaussianblur in="SourceGraphic" stdDeviation="11" result="blur"></fegaussianblur>
						<fecolormatrix in="blur" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 19 -9" result="goo"></fecolormatrix>
					</filter>
				</svg>*/}
				<Tada spy={spy}>
					<img className="img-fluid for-light" src={logo} alt="Loading..." style={{ maxWidth: '5rem' }} />
					<img className="img-fluid for-dark" src={logo_dark} alt="Loading..." style={{ maxWidth: '5rem' }} />
				</Tada>
			</div>
		</Fragment>
	);
};

export default Loader;
