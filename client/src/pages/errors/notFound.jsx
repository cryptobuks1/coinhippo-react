import React, { Fragment } from 'react';
import { Container, Col, Media } from 'reactstrap';
import sad from '../../assets/images/other-images/sad.png';

const NotFound = props => {
	return (
		<Fragment>
			<div className="page-wrapper">
				<div className="error-wrapper" style={{ minHeight: '60vh' }}>
					<Container className="my-3">
						<Media body className="img-100" src={sad} alt="404" />
						<div className="mt-4">{props.title}</div>
						<Col md="12 offset-md-0">
							<div className="sub-content">{props.message}</div>
						</Col>
					</Container>
				</div>
			</div>
		</Fragment>
	);
};

export default NotFound;
