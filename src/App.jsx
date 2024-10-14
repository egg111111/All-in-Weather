import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import Signup from './sign_component/sign_up'
import Home_basic from './sign_component/home_basic'
import Login from './sign_component/login';

function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<Home_basic />} />
              <Route path="/sign_up" element={<Signup />} />
              <Route path="/login" element={<Login />} />
          </Routes>
      </Router>
  );
}

export default App

