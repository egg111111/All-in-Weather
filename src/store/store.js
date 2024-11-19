import { createStore, applyMiddleware } from 'redux';
import {thunk} from 'redux-thunk'; // 비동기 처리를 위한 미들웨어
import rootReducer from '../reducers/rootReducer';

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;