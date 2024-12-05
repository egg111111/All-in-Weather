import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    title: "",
};

const titleReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_TITLE' : 
        return { ...state, title: action.payload};
        default :
        return state;
    }
};

export const setTitle = (title) => ({
    type: 'SET_TITLE', 
    payload: title,
});

export default titleReducer;