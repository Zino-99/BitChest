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
import CreateUser from './pages/Admin/CreateUser.jsx'
import Profile from './pages/Admin/Profile.jsx'

function PrivateRoute({ children }) {
    const user = sessionStorage.getItem("user")
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
                <Route path="/user/Data" element={<div>Data</div>} />
            </Route>

            {/* Admin */}
            <Route element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
                <Route path="/admin/Market" element={<Market />} />
                <Route path="/admin/CreateUser" element={<CreateUser />} />
                <Route path="/admin/Profile" element={<Profile />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/Login" />} />
        </Routes>
    </BrowserRouter>
)