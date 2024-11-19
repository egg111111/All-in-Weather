const initialState = {
    user: null,
    token: null,
};

export default function userReducer(state = initialState, action) {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
            };
        case 'LOGOUT':
            return initialState;
        default:
            return state;
    }
}
