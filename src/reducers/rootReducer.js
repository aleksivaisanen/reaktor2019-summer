import { combineReducers } from 'redux';
import { mainReducers } from './mainReducers';


export default combineReducers({
    main: mainReducers,
})