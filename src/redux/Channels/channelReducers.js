import { SET_CURRENT_CHANNEL, SET_PRIVATE_CHANNEL } from "./channelTypes";

export const setChannelReducer = (state={ currentChannel: null, isPrivateChannel: false }, action) =>{
    switch(action.type){
        case SET_CURRENT_CHANNEL:
            return{
                ...state,
                currentChannel: action.payload.currentChannel,
            }
        case SET_PRIVATE_CHANNEL:
                return{
                    ...state,
                    isPrivateChannel: action.payload.isPrivateChannel,
                }
        default:
            return state
    }
}