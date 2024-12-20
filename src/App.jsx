import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import './App.css'
import Signup from './sign_component/sign_up'
import Home_basic from './sign_component/home_basic'
import Login from './sign_component/login';
import Dashboard from './page_component/dashborad';
import MyPage from './page_component/myPage';

import WeatherOpenApi from './service/WeatherOpenAPi';
import Id_pw_update from './page_component/Id_pw_update';
import ChatgptApi from './service/chatgptApi';
import Delete_user from './page_component/delete';
import RecView from './page_component/recView';

import Layout from './header_footer/layout';
import Sidebar from './header_footer/sidebar';

import { Provider } from 'react-redux';
import store from './store/store';

function App() {

  return (
    <Provider store={store} >
      <Router>
        <Layout>
        <div className="centered-content">
          <Routes>
              <Route path="/" element={<Home_basic />} />
              <Route path="/sign_up" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/myPage" element={<MyPage />} />
              <Route path="/pwUpdate" element={<Id_pw_update />} />
              <Route path="/weatherTest" element={< WeatherOpenApi/>} />
              <Route path="/chatgpt" element={<ChatgptApi />} />
              <Route path="/delete" element={< Delete_user/>} />
              <Route path="/recView" element={<RecView/>} />
          </Routes>
          </div>
          </Layout>
      </Router>
    </Provider>
  );
}

export default App

