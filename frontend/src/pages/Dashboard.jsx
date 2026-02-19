import AdminDashboard from './Admin/AdminDashboard'
import UserDashboard from './User/UserDashboard'
function renderDashboard(role) {
    switch (role) {
        case 'admin':
            return <AdminDashboard />
        case 'user':
            return <UserDashboard />
        default:
            return <UserDashboard />
    }
}

export default function Dashboard() {
    const user = { role: 'admin' }

    return renderDashboard(user.role)
}

