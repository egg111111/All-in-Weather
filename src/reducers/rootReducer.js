import { combineReducers } from 'redux';
import userReducer from './userReducer'; // 사용자 관련 리듀서 예시
import titleReducer from './titleSlice';

export default combineReducers({
    user: userReducer,
    title: titleReducer,
    // 리듀서 추가 가능 
});