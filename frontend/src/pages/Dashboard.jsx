import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function Dashboard() {
    const navigate = useNavigate()
    const user = JSON.parse(sessionStorage.getItem("user"))

    useEffect(() => {
        if (!user) {
            navigate("/Login")
        } else if (user.role === "admin") {
            navigate("/Dashboard/admin")
        } else {
            navigate("/Dashboard/Wallet")
        }
    }, [])

    return null
}