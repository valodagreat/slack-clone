import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { setColorsReducer, setUserReducer } from './User/userReducers';
import { setChannelReducer } from './Channels/channelReducers';

const rootReducer = combineReducers({
    user: setUserReducer,
    channel: setChannelReducer,
    colors: setColorsReducer
})
const currentChannelFromStorage = localStorage.getItem('currentChannel') ? JSON.parse(localStorage.getItem('currentChannel')) : null;
const initialState = {
    channel: {
        currentChannel: currentChannelFromStorage
    }
}
const store = createStore(rootReducer, initialState, composeWithDevTools(applyMiddleware(thunk)) )

export default store;