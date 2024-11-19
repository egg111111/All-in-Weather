import { combineReducers } from 'redux';
import userReducer from './userReducer'; // 사용자 관련 리듀서 예시

export default combineReducers({
    user: userReducer,
    // 다른 리듀서도 여기에 추가할 수 있습니다.
});