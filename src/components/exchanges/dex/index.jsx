import React from 'react';
import Exchanges from '../exchanges.jsx';

const DexExchanges = props => {
  return <Exchanges exchangesType="dex" path="/exchanges/dex" title="Decentralized (DEX)" sortTitle="Volume" />
}

export default DexExchanges;
