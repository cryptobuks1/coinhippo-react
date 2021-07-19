import React from 'react';
import Derivatives from '../derivatives.jsx';

const Futures = props => {
  return (
    <Derivatives derivativeType="futures" path="/derivatives/futures" title="Futures" />
  );
}

export default Futures;
