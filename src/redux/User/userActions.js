import { CLEAR_USER, SET_USER_REQUEST } from "./userTypes";
//import firebase from "../../firebase"

export const setUser = (user) => async(dispatch) => {
    try {
        dispatch({
            type: SET_USER_REQUEST,
            payload: {
                currentUser: user
            }
        })
        
    } catch (error) {
        
    }
}

export const clearUser = () => async(dispatch) =>{
    try {
        dispatch({
            type: CLEAR_USER
        })
    } catch (error) {
        
    }
}