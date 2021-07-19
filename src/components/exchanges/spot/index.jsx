import React from 'react';
import Exchanges from '../exchanges.jsx';

const SpotExchanges = props => {
  return <Exchanges exchangesType="spot" path="/exchanges" title="Cryptocurrency Spot" sortTitle="Confidence" typeVisible={true} />
}

export default SpotExchanges;
