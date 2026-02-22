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
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import CreateUser from './pages/Admin/CreateUser.jsx'
import Profile from './pages/Admin/Profile.jsx'

function PrivateRoute({ children }) {
    const user = sessionStorage.getItem("user")
    return user ? children : <Navigate to="/Login" />
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                {/* Public */}
                <Route path="/" element={<Login />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Aiguilleur */}
                <Route path="/Dashboard" element={<Dashboard />} />

                {/* User — sidebar partagée via UserLayout */}
                <Route element={<PrivateRoute><UserLayout /></PrivateRoute>}>
                    <Route path="/Dashboard/Wallet" element={<Wallet />} />
                    <Route path="/Dashboard/Market" element={<Market />} />
                    <Route path="/Dashboard/Data" element={<div>Data</div>} />
                </Route>

                {/* Admin */}
                <Route path="/Dashboard/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
                <Route path="/Dashboard/CreateUser" element={<PrivateRoute><CreateUser /></PrivateRoute>} />
                <Route path="/Dashboard/Profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/Login" />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>
)