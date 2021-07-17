import React, { Fragment } from 'react';
import { Container } from 'reactstrap';

const AboutUs = () => {
  return (
    <Fragment>
      <div className="page-wrapper">
        <Container>
          <h1 className="headline f-32 mt-3 mb-2 mt-md-4 mb-md-4">{"About Us"}</h1>
          <p className="sub-content f-18 text-secondary mb-4">{"We're in a crucial time in the history of humankind. Cryptocurrency and blockchain technologies are disrupting traditional financial services —– soon affecting every inch of our words."}</p>
          <p className="sub-content f-18 text-secondary mb-4">{"The sky is the limit for them."}</p>
          <p className="sub-content f-18 text-secondary mb-4">{"With that belief, we dream of reinventing what's possible, bringing it down-to-earth, and letting it be accessible to everyone —– with the seamlessness of having no restrictions for all. That's how things should be in our modern world."}</p>
          <p className="sub-content f-18 text-secondary mb-4">{"To overcome our belief, we built "}{process.env.REACT_APP_APP_NAME}{" to provide the price movement, foundation analysis, and market capitalization of the cryptocurrency world in a tidy and unified bundle. Notably, "}{process.env.REACT_APP_APP_NAME}{" is designed with simplicity in mind to deliver you the aggregated data in the most uncomplicated ways."}</p>
          <p className="sub-content f-18 text-secondary mb-4">{"Not a financial expert guy? Don't worry. "}{process.env.REACT_APP_APP_NAME}{" speaks in the language you easily understand —– whether you are a new-comer or a professional crypto-wizard."}</p>
          <p className="sub-content f-18 text-secondary mb-4">{"Let's propel yourself into the vital world with us."}</p>
          <p className="sub-content f-18 f-w-500 mb-5">{process.env.REACT_APP_APP_NAME}</p>
        </Container>
      </div>
    </Fragment>
  );
};

export default AboutUs;
