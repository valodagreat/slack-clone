import { CLEAR_USER, SET_USER_REQUEST } from "./userTypes";

export const setUserReducer = (state={ isLoading: true, currentUser: null }, action) =>{
    switch(action.type){
        case SET_USER_REQUEST:
            return{
                currentUser: action.payload.currentUser,
                isLoading: false
            }
        case CLEAR_USER:
            return{
                ...state,
                isLoading: false
            }
        default:
            return state
    }
}