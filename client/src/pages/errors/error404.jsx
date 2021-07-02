import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Container, Col, Button, Media } from 'reactstrap';
import sad from '../../assets/images/other-images/sad.png';

const Error404 = () => {
	return (
		<Fragment>
			<div className="page-wrapper mt-3">
				<div className="error-wrapper">
					<Container>
						<Media body className="img-100" src={sad} alt="404" />
						<div className="error-heading">
							<h1 className="headline font-danger">{"404"}</h1>
						</div>
						<Col md="8 offset-md-2">
							<p className="sub-content">{"The page you are attempting to reach is currently not available. This may be because the page does not exist or has been moved."}</p>
						</Col>
						<Link to="/"><Button color="danger-gradien" size="lg">{"BACK TO HOME PAGE"}</Button></Link>
					</Container>
				</div>
			</div>
		</Fragment>
	);
};

export default Error404;
