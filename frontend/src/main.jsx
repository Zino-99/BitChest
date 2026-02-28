import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Register from './pages/user/Register.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Market from './pages/User/Market.jsx'
import Wallet from './pages/user/Wallet.jsx'
import UserLayout from './components/user/UserLayout.jsx'
import AdminLayout from './components/admin/AdminLayout.jsx'
import UserManagement from './pages/admin/UserManagement.jsx'

import Data from './pages/Data.jsx'
import Buy from './pages/user/Buy.jsx'
import Sell from './pages/user/Sell.jsx'
import AdminMarket from './pages/admin/AdminMarket.jsx'



function PrivateRoute({ children }) {
    const user = sessionStorage.getItem('user')
    return user ? children : <Navigate to="/Login" />
}

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <Routes>
            {/* Public */}
            <Route path="/" element={<Login />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Aiguilleur */}
            <Route path="/Dashboard" element={<Dashboard />} />

            {/* User */}
            <Route element={<PrivateRoute><UserLayout /></PrivateRoute>}>
                <Route path="/user/Wallet" element={<Wallet />} />
                <Route path="/user/Market" element={<Market />} />
                <Route path="/user/Data" element={<Data />} />
                <Route path="/user/buy/:id" element={<Buy />} />
                <Route path="/user/sell/:id" element={<Sell />} />
            </Route>

            {/* Admin */}
            <Route element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
                <Route path="/admin/Market" element={<AdminMarket />} />
                <Route path="/admin/UserManagement"element={<UserManagement />}/>
                <Route path="/admin/Profile" element={<Data />} />
                
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/Login" />} />
        </Routes>
    </BrowserRouter>
)
