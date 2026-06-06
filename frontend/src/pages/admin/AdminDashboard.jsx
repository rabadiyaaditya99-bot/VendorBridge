import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { getDashboardStats, getAllUsers, updateUserRole } from "../../api/admin.api";
import Card, { CardBody, CardHeader } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Loader from "../../components/common/Loader";
import { formatDateTime, timeAgo } from "../../utils/formatDate";
import {
  Users,
  UserPlus,
  Shield,
  TrendingUp,
  Clock,
  BarChart3,
  RefreshCw,
  Activity,
  UserCheck,
  ChevronDown,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const socket = useSocket();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [roleUpdating, setRoleUpdating] = useState(null);
  const [error, setError] = useState("");

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      setError("");
      const [statsRes, usersRes] = await Promise.all([
        getDashboardStats(),
        getAllUsers(),
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data.users);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time: listen for new user registrations
  useEffect(() => {
    if (socket) {
      socket.on("user-registered", () => {
        fetchData(true);
      });
      socket.on("data-updated", () => {
        fetchData(true);
      });
      return () => {
        socket.off("user-registered");
        socket.off("data-updated");
      };
    }
  }, [socket, fetchData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setRoleUpdating(userId);
      await updateUserRole(userId, newRole);
      await fetchData(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update role");
    } finally {
      setRoleUpdating(null);
    }
  };

  const getRoleColor = (roleName) => {
    switch (roleName) {
      case "ADMIN": return "purple";
      case "PROCUREMENT_OFFICER": return "blue";
      case "MANAGER": return "green";
      case "VENDOR": return "orange";
      default: return "slate";
    }
  };

  if (loading) return <Loader text="Loading admin dashboard..." />;

  if (error && !stats) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => fetchData()}>Retry</Button>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-primary-600 bg-primary-50",
      border: "border-primary-200",
    },
    {
      label: "New Today",
      value: stats?.newUsersToday || 0,
      icon: UserPlus,
      color: "text-green-600 bg-green-50",
      border: "border-green-200",
    },
    {
      label: "This Week",
      value: stats?.newUsersThisWeek || 0,
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-50",
      border: "border-blue-200",
    },
    {
      label: "Admins",
      value: stats?.rolesData?.ADMIN || 0,
      icon: Shield,
      color: "text-purple-600 bg-purple-50",
      border: "border-purple-200",
    },
  ];

  const maxDailyCount = Math.max(...(stats?.dailyRegistrations?.map((d) => d.count) || [1]), 1);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-500" />
            Live surveillance feed • Auto-refreshes every 30s
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          loading={refreshing}
          onClick={() => fetchData(true)}
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className={`border ${stat.border} hover:shadow-md transition-shadow`}>
              <CardBody className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Registrations Bar Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-gray-900">Daily Registrations (Last 7 Days)</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="flex items-end gap-3 h-40">
              {stats?.dailyRegistrations?.map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-medium text-gray-700">{day.count}</span>
                  <div
                    className="w-full rounded-t-lg gradient-primary transition-all duration-500 min-h-[4px]"
                    style={{
                      height: `${Math.max((day.count / maxDailyCount) * 120, 4)}px`,
                    }}
                  />
                  <span className="text-xs text-gray-500">{day.day}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Roles Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Users by Role</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            {Object.entries(stats?.rolesData || {}).map(([roleName, count]) => {
              const total = stats?.totalUsers || 1;
              const percentage = Math.round((count / total) * 100);
              const barColor = roleName === "ADMIN" ? "bg-purple-500" : roleName === "MANAGER" ? "bg-green-500" : roleName === "PROCUREMENT_OFFICER" ? "bg-blue-500" : "bg-orange-500";
              const bgColor = roleName === "ADMIN" ? "bg-purple-100" : roleName === "MANAGER" ? "bg-green-100" : roleName === "PROCUREMENT_OFFICER" ? "bg-blue-100" : "bg-orange-100";
              return (
                <div key={roleName}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium text-gray-700 capitalize">{roleName.toLowerCase().replace("_", " ")}</span>
                    <span className="text-xs text-gray-500 font-bold">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${bgColor}`}>
                    <div
                      className={`h-2 rounded-full ${barColor} transition-all duration-700`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>

      {/* Recent Users Table */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Recent Registrations</h3>
          </div>
          <Badge color="indigo">{stats?.recentUsers?.length || 0} latest</Badge>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">User</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3 hidden sm:table-cell">Email</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3 hidden md:table-cell">Phone</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Role</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3 hidden lg:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentUsers?.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-medium">
                          {u.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-gray-600 hidden sm:table-cell">{u.email}</td>
                  <td className="px-6 py-3.5 text-sm text-gray-600 hidden md:table-cell">{u.phone || "—"}</td>
                  <td className="px-6 py-3.5">
                    <Badge color={getRoleColor(u.role)}>{u.role}</Badge>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-gray-500 hidden lg:table-cell">
                    {timeAgo(u.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* All Users Management */}
      <Card>
        <CardHeader>
          <button
            onClick={() => setShowUsers(!showUsers)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Manage All Users ({users.length})</h3>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${
                showUsers ? "rotate-180" : ""
              }`}
            />
          </button>
        </CardHeader>

        {showUsers && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3 hidden sm:table-cell">Email</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Role</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Change Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-medium">
                            {u.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-500 sm:hidden">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-gray-600 hidden sm:table-cell">{u.email}</td>
                    <td className="px-6 py-3.5">
                      <Badge color={getRoleColor(u.role)}>{u.role}</Badge>
                    </td>
                    <td className="px-6 py-3.5">
                      {u.id === user?.id ? (
                        <span className="text-xs text-gray-400 font-medium">Current Admin user</span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={roleUpdating === u.id}
                          className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="PROCUREMENT_OFFICER">PROCUREMENT OFFICER</option>
                          <option value="VENDOR">VENDOR</option>
                          <option value="MANAGER">MANAGER</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
