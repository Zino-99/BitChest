// import { useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'

// export default function Dashboard() {
//     const navigate = useNavigate()
//     const user = JSON.parse(sessionStorage.getItem('user'))

//     useEffect(() => {
//         if (!user) {
//             navigate('/Login')
//         } else if (user.role === 'admin') {
//             navigate('/admin/Market')
//         } else {
//             navigate('/user/Wallet')
//         }
//     }, [])

//     return null
// }

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Dashboard component acts as a redirect based on user authentication and role
export default function Dashboard() {
    const navigate = useNavigate() // Hook to programmatically navigate
    const user = JSON.parse(sessionStorage.getItem('user')) // Retrieve user from session storage

    useEffect(() => {
        // Redirect logic based on authentication and role
        if (!user) {
            // If no user is logged in, redirect to login page
            navigate('/Login')
        } else if (user.role === 'admin') {
            // If user is admin, redirect to admin market page
            navigate('/admin/Market')
        } else {
            // If user is a normal user, redirect to wallet page
            navigate('/user/Wallet')
        }
    }, []) // Empty dependency array so this runs only once on mount

    return null // Component does not render anything
}
