import { SET_CURRENT_CHANNEL, SET_PRIVATE_CHANNEL, SET_USER_POSTS } from "./channelTypes"

export const setCurrentChannel = (channel) => async(dispatch, getState) => {
    try {
        dispatch({
            type: SET_CURRENT_CHANNEL,
            payload: {
                currentChannel: channel
            }
        })
        localStorage.setItem('currentChannel',JSON.stringify(getState().channel.currentChannel))
    } catch (error) {
        
    }
}

export const setPrivateChannel = (isPrivateChannel) => {
    try {
        return {
            type: SET_PRIVATE_CHANNEL,
            payload: {
                isPrivateChannel
            }
        }
        
    } catch (error) {
        
    }
}

export const setUserPosts = (userPosts) => {
    try {
        return {
            type: SET_USER_POSTS,
            payload: {
                userPosts
            }
        }
    } catch (error) {
        
    }
}