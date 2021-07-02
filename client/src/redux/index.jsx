import { combineReducers } from 'redux';
import Customizer from './customizer/reducer';
import Preferences from './preferences/reducer';
import Data from './data/reducer';

const reducers = combineReducers({
	Customizer,
	Preferences,
	Data
});

export default reducers;
