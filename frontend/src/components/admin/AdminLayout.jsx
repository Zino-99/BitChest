// Import React hooks and necessary components
import { useState } from "react" // useState for local state management
import { useNavigate, useLocation, Outlet } from "react-router-dom" 
// useNavigate: programmatic navigation
// useLocation: current URL/path
// Outlet: renders nested routes
import { TrendingUp, Users, User, Menu, X, LogOut } from "lucide-react" 
// Import icons for menu and actions

// Define sidebar navigation items
const navItems = [
  { label: "Market", icon: TrendingUp, path: "/admin/Market" },
  { label: "User Management", icon: Users, path: "/admin/UserManagement" },
  { label: "Profile", icon: User, path: "/admin/Profile" },
]
// Each object contains:
// label -> displayed text
// icon -> icon component
// path -> URL to navigate to

// Main admin layout component
export default function AdminLayout() {
  // Hooks for navigation and current location
  const navigate = useNavigate() // to programmatically navigate pages
  const location = useLocation() // to determine the active route

  // Retrieve user info from sessionStorage
  const user = JSON.parse(sessionStorage.getItem("user") || "{}") 
  // returns empty object if no user is stored

  // Local state for mobile sidebar (open/closed)
  const [isOpen, setIsOpen] = useState(false)

  // Logout function
  const handleLogout = () => {
    sessionStorage.removeItem("user") // remove user info
    navigate("/Login") // redirect to login page
  }

  // Internal component for sidebar content
  const SidebarContent = () => (
    <aside className="h-screen flex flex-col w-[270px] overflow-hidden" style={{ backgroundColor: "#38618C" }}>
      {/* App title */}
      <div className="flex-shrink-0 p-4 h-[120px] flex items-center justify-center">
        <h1 className="text-4xl font-bold text-white tracking-tight">Bitchest</h1>
      </div>

      {/* User info */}
      <div className="flex-shrink-0 px-5 py-3 border-b border-white/20">
        <div className="flex items-center gap-3">
          {/* Avatar with initials */}
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user.firstname?.[0]}{user.lastname?.[0]}
          </div>
          {/* Name and role */}
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm truncate">{user.firstname} {user.lastname}</p>
            <p className="text-xs text-white/60 uppercase tracking-widest">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon // retrieve icon component
          const isActive = location.pathname === item.path // check if menu item is active
          return (
            <button
              key={item.label} // unique key for React
              onClick={() => { navigate(item.path); setIsOpen(false) }} // navigate and close mobile sidebar
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left w-full group
                ${isActive ? "bg-white/20" : "hover:bg-white/10"}`}
            >
              {/* Icon for menu item */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0
                ${isActive ? "bg-white/30" : "bg-white/10 group-hover:bg-white/20"}`}>
                <Icon size={18} className="text-white" />
              </div>
              {/* Menu label */}
              <span className="text-sm font-medium text-white">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Logout button */}
      <div className="flex-shrink-0 p-3 border-t border-white/20">
        <button
          onClick={handleLogout} // call logout function on click
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

  // Return the main layout
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar (visible on medium+ screens) */}
      <div className="hidden md:flex flex-shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </div>

      {/* Mobile top bar (visible on small screens) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3" style={{ backgroundColor: "#38618C" }}>
        <h1 className="text-xl font-bold text-white">Bitchest</h1>
        {/* Button to toggle mobile sidebar */}
        <button onClick={() => setIsOpen(!isOpen)} className="text-white p-1">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <>
          {/* Semi-transparent overlay behind sidebar */}
          <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setIsOpen(false)} />
          {/* Mobile sidebar */}
          <div className="fixed top-0 left-0 h-full z-50 md:hidden">
            <SidebarContent />
          </div>
        </>
      )}

      {/* Main page content */}
      <main className="flex-1 overflow-y-auto md:pt-0 pt-14">
        <Outlet /> {/* Renders the nested route component */}
      </main>
    </div>
  )
}