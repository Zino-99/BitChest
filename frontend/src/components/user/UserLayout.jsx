import { useState } from "react"
import { useNavigate, useLocation, Outlet } from "react-router-dom"
import { Wallet, TrendingUp, BarChart2, Menu, X, LogOut } from "lucide-react"
import BitchestLogo from '../../assets/bitchest_logo.png'

const navItems = [
  { label: "My Wallet", icon: Wallet, path: "/user/Wallet" },
  { label: "Market", icon: TrendingUp, path: "/user/Market" },
  { label: "Data", icon: BarChart2, path: "/user/Data" },
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

  const SidebarContent = () => (
    <aside className="h-screen flex flex-col w-[270px] overflow-hidden" style={{ backgroundColor: "#38618C" }}>
      {/* Title */}
      <div className="flex-shrink-0 p-4 h-[120px] flex items-center justify-center">
        <h1 className="text-4xl font-bold text-white tracking-tight">BitChest</h1>
      </div>

      {/* User Info */}
      <div className="flex-shrink-0 px-5 py-3 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user.firstname?.[0]}{user.lastname?.[0]}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm truncate">{user.firstname} {user.lastname}</p>
            <p className="text-xs text-white/60 uppercase tracking-widest">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.label}
              onClick={() => { navigate(item.path); setIsOpen(false) }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left w-full group
                ${isActive ? "bg-white/20" : "hover:bg-white/10"}`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0
                ${isActive ? "bg-white/30" : "bg-white/10 group-hover:bg-white/20"}`}>
                <Icon size={18} className="text-white" />
              </div>
              <span className="text-sm font-medium text-white">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="flex-shrink-0 p-3 border-t border-white/20">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-white/10 transition-colors group"
        >
          <div className="w-9 h-9 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center flex-shrink-0 transition-all">
            <LogOut size={18} className="text-white/70 group-hover:text-white" />
          </div>
          <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
            Logout
          </span>
        </button>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3" style={{ backgroundColor: "#38618C" }}>
      <h1 className="text-xl font-bold text-white">Bitchest</h1>
        <button onClick={() => setIsOpen(!isOpen)} className="text-white p-1">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setIsOpen(false)} />
          <div className="fixed top-0 left-0 h-full z-50 md:hidden">
            <SidebarContent />
          </div>
        </>
      )}

      {/* Page content */}
      <main className="flex-1 overflow-y-auto md:pt-0 pt-14">
        <Outlet />
      </main>
    </div>
  )
}