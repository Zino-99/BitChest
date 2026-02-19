import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Register from './pages/user/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Market from './pages/User/Market.jsx'
import Wallet from './pages/user/Wallet.jsx'
import CreateUser from './pages/Admin/CreateUser.jsx'
import Profile from './pages/Admin/Profile.jsx'
import Login from './pages/Login.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Register />}></Route>
                <Route path="/Login" element={<Login />}></Route>
                <Route path="/Dashboard" element={<Dashboard />}></Route>
                <Route path="/Dashboard/Market" element={<Market />}></Route>
                <Route path="/Dashboard/Wallet" element={<Wallet />}></Route>
                <Route
                    path="/Dashboard/CreateUser"
                    element={<CreateUser />}
                ></Route>
                <Route path="/Dashboard/Profile" element={<Profile />}></Route>
            </Routes>
        </BrowserRouter>
    </StrictMode>
)
