import { SET_CURRENT_CHANNEL, SET_PRIVATE_CHANNEL, SET_USER_POSTS } from "./channelTypes";

export const setChannelReducer = (state={ currentChannel: null, isPrivateChannel: false, userPosts: null }, action) =>{
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
        case SET_USER_POSTS:
            return {
                ...state,
                userPosts: action.payload.userPosts
            }
        default:
            return state
    }
}