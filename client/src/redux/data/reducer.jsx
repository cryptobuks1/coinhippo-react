import {
	GLOBAL_DATA,
	ALL_CRYPTO_DATA,
	EXCHANGE_RATES_DATA,
	ALL_PAPRIKA_COINS_DATA,
	ALL_PAPRIKA_EXCHANGES_DATA,
} from '../actionTypes';

const initial_state = {
	global_data: null,
	all_crypto_data: null,
	exchange_rates_data: {},
	all_paprika_coins_data: null,
	all_paprika_exchanges_data: null,
};

const reducer = (state = initial_state, action) => {
	switch (action.type) {
		case GLOBAL_DATA:
			return { ...state, global_data: action.payload };
		case ALL_CRYPTO_DATA:
			return { ...state, all_crypto_data: action.payload };
		case EXCHANGE_RATES_DATA:
			return { ...state, exchange_rates_data: action.payload };
		case ALL_PAPRIKA_COINS_DATA:
			return { ...state, all_paprika_coins_data: action.payload };
		case ALL_PAPRIKA_EXCHANGES_DATA:
			return { ...state, all_paprika_exchanges_data: action.payload };
		default: return { ...state };
	}
};

export default reducer;
