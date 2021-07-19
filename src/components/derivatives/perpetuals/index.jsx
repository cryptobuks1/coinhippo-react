import React from 'react';
import Derivatives from '../derivatives.jsx';

const Perpetuals = props => {
  return (
    <Derivatives derivativeType="perpetual" path="/derivatives" title="Perpetual" />
  );
}

export default Perpetuals;
