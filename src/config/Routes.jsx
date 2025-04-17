import React from 'react'
import { Route, Routes } from 'react-router-dom'
import App from '../App';
import ChatPage from '../components/ChatPage';


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="*" element={<h1> Page Not Found!!! </h1>} />
    </Routes>
  )
}

export default AppRoutes;