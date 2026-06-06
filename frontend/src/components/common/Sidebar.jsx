import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/constants";
import {
  LayoutDashboard,
  User,
  Users,
  Store,
  ClipboardList,
  CheckSquare,
  ShoppingBag,
  Receipt,
  BarChart3,
  History,
} from "lucide-react";

export default function Sidebar() {
  const { user } = useAuth();

  const links = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: [ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER, ROLES.VENDOR, ROLES.MANAGER],
    },
    {
      to: "/vendors",
      label: "Vendors",
      icon: Store,
      roles: [ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER, ROLES.MANAGER],
    },
    {
      to: "/rfqs",
      label: "RFQs",
      icon: ClipboardList,
      roles: [ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER, ROLES.VENDOR, ROLES.MANAGER],
    },
    {
      to: "/quotations",
      label: "Quotations",
      icon: ShoppingBag,
      roles: [ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER, ROLES.VENDOR, ROLES.MANAGER],
    },
    {
      to: "/approvals",
      label: "Approvals",
      icon: CheckSquare,
      roles: [ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER, ROLES.MANAGER],
    },
    {
      to: "/purchase-orders",
      label: "Purchase Orders",
      icon: ShoppingBag,
      roles: [ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER, ROLES.VENDOR, ROLES.MANAGER],
    },
    {
      to: "/invoices",
      label: "Invoices",
      icon: Receipt,
      roles: [ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER, ROLES.VENDOR, ROLES.MANAGER],
    },
    {
      to: "/reports",
      label: "Analytics & Reports",
      icon: BarChart3,
      roles: [ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER, ROLES.MANAGER],
    },
    {
      to: "/activity-logs",
      label: "Activity Logs",
      icon: History,
      roles: [ROLES.ADMIN],
    },
    {
      to: "/profile",
      label: "My Profile",
      icon: User,
      roles: [ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER, ROLES.VENDOR, ROLES.MANAGER],
    },
    {
      to: "/admin/users",
      label: "Manage Users",
      icon: Users,
      roles: [ROLES.ADMIN],
    },
  ];

  const filteredLinks = links.filter((link) => link.roles.includes(user?.role));

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
      <nav className="flex-1 px-4 py-6 space-y-1">
        {filteredLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary-50 text-primary-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-100 flex items-center justify-center bg-gray-100">
            {user?.avatar ? (
              <img
                src={`${import.meta.env.VITE_SOCKET_URL || "http://localhost:5000"}${user.avatar}`}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full gradient-primary flex items-center justify-center">
                <span className="text-white font-medium text-xs">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#3B82F6] truncate">
              {user?.username || user?.name?.toLowerCase()?.replace(/\s/g, '')}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.name}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
