import { Link, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, Users, Settings, Activity, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/features/auth/hooks/authStore"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: [1, 2] },
  { name: "Assessments", href: "/assessments", icon: Activity, roles: [1, 2] },
  { name: "Participants", href: "/participants", icon: Users, roles: [1] },
  { name: "Settings", href: "/settings", icon: Settings, roles: [1] },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  // Filter navigation by user role
  const filteredNav = navigation.filter(item => {
    if (!user) return false;
    return item.roles.includes(user.role_id);
  })

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card px-3 py-4">
      <div className="mb-8 px-4">
        <h1 className="text-xl font-bold tracking-tight text-primary">AssessLive</h1>
      </div>
      <nav className="flex-1 space-y-1">
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto px-4 pb-4">
        <button 
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          Logout
        </button>
      </div>
    </div>
  )
}
