import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { setUserReducer } from './User/userReducers';
import { setChannelReducer } from './Channels/channelReducers';

const rootReducer = combineReducers({
    user: setUserReducer,
    channel: setChannelReducer
})
const initialState = {

}
const store = createStore(rootReducer, initialState, composeWithDevTools(applyMiddleware(thunk)) )

export default store;