import { SET_CURRENT_CHANNEL, SET_PRIVATE_CHANNEL } from "./channelTypes"

export const setCurrentChannel = (channel) => async(dispatch) => {
    try {
        dispatch({
            type: SET_CURRENT_CHANNEL,
            payload: {
                currentChannel: channel
            }
        })
        
    } catch (error) {
        
    }
}

export const setPrivateChannel = (isPrivateChannel) => async(dispatch) => {
    try {
        dispatch({
            type: SET_PRIVATE_CHANNEL,
            payload: {
                isPrivateChannel
            }
        })
        
    } catch (error) {
        
    }
}