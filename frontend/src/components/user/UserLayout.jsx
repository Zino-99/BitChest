import { useState } from "react"
import { useNavigate, useLocation, Outlet } from "react-router-dom"
import { Wallet, TrendingUp, BarChart2, Menu, X } from "lucide-react"
import BitchestLogo from '../../assets/bitchest_logo.png'

const navItems = [
  { label: "My Wallet", icon: Wallet, path: "/Dashboard/Wallet" },
  { label: "Market", icon: TrendingUp, path: "/Dashboard/Market" },
  { label: "Data", icon: BarChart2, path: "/Dashboard/Data" },
]

export default function UserLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(sessionStorage.getItem("user") || "{}")
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    sessionStorage.removeItem("user")
    navigate("/Login")
  }

  const Sidebar = () => (
    <aside className="h-full flex flex-col w-[270px]" style={{ backgroundColor: "#38618C" }}>
      {/* Logo */}
    <div className="p-4 h-[150px] flex items-center justify-center">
        <h1 className="text-5xl font-bold text-white tracking-tight">BitChest</h1>
    </div>


      {/* User Info */}
      <div className="px-5 py-4 border-b border-white/20">
        <p className="font-semibold text-white text-lg">{user.firstname} {user.lastname}</p>
        <p className="text-xs text-white/60 uppercase tracking-widest mt-0.5">{user.role}</p>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col gap-2 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.label}
              onClick={() => { navigate(item.path); setIsOpen(false) }}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-left w-full group
                ${isActive ? "bg-white/20" : "hover:bg-white/10"}`}
            >
              {/* Icon bubble */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all
                ${isActive ? "bg-white/30" : "bg-white/10 group-hover:bg-white/20"}`}>
                <Icon size={22} className="text-white" />
              </div>
              <span className="text-base font-medium text-white">
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="py-3 px-8 w-full text-start text-base font-medium text-white/70 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[#EAEAEA]" style={{ backgroundColor: "#38618C" }}>
        <img src={BitchestLogo} alt="logo" className="h-8" />
        <button onClick={() => setIsOpen(!isOpen)} className="text-white">
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      <div className="flex">
        {/* Desktop sidebar */}
        <div className="hidden md:block min-h-screen sticky top-0">
          <Sidebar />
        </div>

        {/* Mobile sidebar overlay */}
        {isOpen && (
          <>
            <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setIsOpen(false)} />
            <div className="fixed top-0 left-0 h-full z-50 md:hidden">
              <Sidebar />
            </div>
          </>
        )}

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}