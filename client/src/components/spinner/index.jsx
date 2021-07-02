import React, { Fragment, useState, useEffect } from 'react';
import Tada from 'react-reveal/Tada';
import logo from '../../assets/images/logo/logo_square.png';
import logo_dark from '../../assets/images/logo/logo_square_white.png';
import { useIsMountedRef, sleep } from '../../utils';

const Spinner = props => {
	const isMountedRef = useIsMountedRef();
	const [spy, setSpy] = useState(0);

	useEffect(() => {
		const update = async () => {
			if (spy > 0) {
				await sleep(1000);
			}
			if (isMountedRef.current) {
				setSpy(spy + 1);
			}
		};
		update();
	}, [isMountedRef, spy]);

	return (
		<Fragment>
			<Tada spy={spy}>
				<img className="img-fluid for-light" src={logo} alt="Loading..." style={props.style ? props.style : { maxWidth: '2.5rem' }} />
				<img className="img-fluid for-dark" src={logo_dark} alt="Loading..." style={props.style ? props.style : { maxWidth: '2.5rem' }} />
			</Tada>
		</Fragment>
	);
};

export default Spinner;
