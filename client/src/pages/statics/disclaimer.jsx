import React, { Fragment } from 'react';
import { Container } from 'reactstrap';

const Disclaimer = () => {
	return (
		<Fragment>
			<div className="page-wrapper">
				<Container>
					<h1 className="headline f-32 mt-3 mb-2 mt-md-4 mb-md-4">{process.env.REACT_APP_APP_NAME}{" Disclaimer"}</h1>
					<p className="sub-content f-16 text-secondary mb-5">{"Disclaimer: All content contained on this website, hyperlinked sites, associated applications, social media accounts, and other platforms (“Site”) is not investment advice. We make no warranties of any kind of our content, including but not limited to completeness, accuracy, and updatedness. Any use or reliance on our content is solely at your own risk and discretion. Trading financial activities carry a high-risk level; therefore, we strongly advise you to consult your investment advisor before making any decision. All content on our Site does not mean to be a solicitation or offer."}</p>
				</Container>
			</div>
		</Fragment>
	);
};

export default Disclaimer;
