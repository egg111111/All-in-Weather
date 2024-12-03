import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { IsNightProvider } from './service/isNight_Provider.jsx'
import { WeatherdataProvider } from './service/weatherdataProvider.jsx'
import { UserDataProvider } from './service/userDataProvider.jsx'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <IsNightProvider>
    <WeatherdataProvider>
    <UserDataProvider>
      <App />
    </UserDataProvider>
    </WeatherdataProvider>
    </IsNightProvider>
  </StrictMode>
)
