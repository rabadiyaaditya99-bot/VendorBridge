import { useState, useEffect } from "react";
import { getActivityLogs } from "../../api/report.api";
import Table from "../../components/ui/Table";
import EmptyState from "../../components/common/EmptyState";
import { History } from "lucide-react";

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getActivityLogs()
      .then((res) => {
        if (res.data?.success) {
          setLogs(res.data.data);
        }
      })
      .catch((err) => console.error("Error loading activity logs:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-sans">System Activity Logs</h1>
        <p className="text-gray-500 text-sm mt-1">Audit log records representing operations, changes, and authentication requests.</p>
      </div>

      {/* Table grid */}
      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading audit trail logs...</div>
      ) : logs.length === 0 ? (
        <EmptyState
          title="No Logs Available"
          description="Activities will show up once operations occur."
          icon={History}
        />
      ) : (
        <Table headers={["User", "Action", "Description", "IP Address", "Timestamp"]}>
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <p className="font-semibold text-gray-900 leading-tight">{log.user?.name || "System"}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{log.user?.role}</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs font-semibold border border-slate-200 uppercase font-mono">
                  {log.action}
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-gray-600 max-w-xs truncate" title={log.details}>
                {log.details}
              </td>
              <td className="px-6 py-4 font-mono text-xs text-gray-400">
                {log.ipAddress || "127.0.0.1"}
              </td>
              <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                {new Date(log.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
