import { VS_CURRENCY, THEME } from '../types';
import ConfigDB from '../../data/customizer/config';

const initial_state = {
  vs_currency: localStorage.getItem(VS_CURRENCY) || 'usd',
  theme: localStorage.getItem('layout_version') || ConfigDB.data.color.layout_version || 'light',
};

const reducer = (state = initial_state, action) => {
  switch (action.type) {
    case VS_CURRENCY:
      return { ...state, vs_currency: action.payload };
    case THEME:
      return { ...state, theme: action.payload };
    default: return { ...state };
  }
};

export default reducer;
