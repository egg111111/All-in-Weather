import { useState, useContext, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import './App.css'
import Signup from './sign_component/sign_up'
import Home_basic from './sign_component/home_basic'
import Login from './sign_component/login';
import Dashboard from './page_component/dashboard';
import MyPage from './page_component/myPage';

import Id_pw_update from './page_component/Id_pw_update';
import ChatgptApi from './service/chatgptApi';
import Delete_user from './page_component/delete';

import SocialDeleteUser from './page_component/social_delete';
import RecView from './page_component/recView';
import AddUserInfo from './page_component/AddUserInfo';
import InputBox from './sign_component/InputBox';
import Perference_check from './page_component/preference_check';
import Result from './page_component/result';
import RecommendItem from './service/RecommendItem';
import RecentCalendar from './service/RecentCalendar';

import Layout from './header_footer/layout';
import TopNav from './header_footer/topNav';
import DetailPage from './page_component/detailPage';

import { Provider } from 'react-redux';
import store from './store/store';
import { IsNightContext } from './service/isNight_Provider';


const App = () => {
  const { isNight } = useContext(IsNightContext);

  useEffect(() => {
    // body 스타일 업데이트
    document.body.style.backgroundImage = isNight
      ? "url('../src/assets/images/background_night.jpg')"
      : "url('../src/assets/images/background.jpg')";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundSize = "cover";
    document.body.style.display = "grid";
    document.body.style.justifyContent = "center";
    document.body.style.alignItems = "center";
    document.body.style.height = "100vh";
    document.body.style.width = "100vw";

    // 컴포넌트 언마운트 시 초기화
    return () => {
      document.body.style.backgroundImage = null;
      document.body.style.backgroundRepeat = null;
      document.body.style.backgroundAttachment = null;
      document.body.style.backgroundSize = null;
    };
  }, [isNight]); // isNight 값이 변경될 때마다 업데이트

  return (
    <Provider store={store} >
      <Router>
        <Layout>
          <div>
            <div className="centered-content">
              <Routes>
                <Route path="/" element={<Home_basic />} />
                <Route path="/sign_up" element={<Signup />} />
                <Route path="/addUserInfo" element={<AddUserInfo />} />
                <Route path="/perference" element={<Perference_check />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/myPage" element={<MyPage />} />
                <Route path="/pwUpdate" element={<Id_pw_update />} />
                <Route path="/chatgpt" element={<ChatgptApi />} />
                <Route path="/delete" element={< Delete_user />} />
                <Route path="/social_delete" element={< SocialDeleteUser />} />
                <Route path="/inputbox" element={< InputBox />} />
                <Route path="/recView" element={<RecView />} />
                <Route path="/result" element={<Result />} />
                <Route path="/recItem" element={<RecommendItem />} />
                <Route path="/recCalendar" element={<RecentCalendar/>}/>
                <Route path="/detail" element={<DetailPage />} />
              </Routes>
            </div>
          </div>
        </Layout>
      </Router>
    </Provider>
  );
}

export default App
