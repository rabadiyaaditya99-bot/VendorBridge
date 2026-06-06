import { useState, useEffect } from "react";
import { getVendorPerformanceReport, getMonthlySpendingReport, getProcurementStatsReport } from "../../api/report.api";
import Card, { CardBody } from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import { BarChart3, TrendingUp, Users, Star, PieChart, Landmark } from "lucide-react";

export default function Reports() {
  const [vendors, setVendors] = useState([]);
  const [spending, setSpending] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getVendorPerformanceReport(),
      getMonthlySpendingReport(),
      getProcurementStatsReport(),
    ])
      .then(([resVendors, resSpending, resStats]) => {
        if (resVendors.data?.success) setVendors(resVendors.data.data || []);
        if (resSpending.data?.success) setSpending(resSpending.data.data || []);
        if (resStats.data?.success) setStats(resStats.data.data || null);
      })
      .catch((err) => console.error("Error loading analytics data:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Loading procurement intelligence...</div>;
  }

  // Find max spending to scale graph height
  const maxSpendingVal = spending.length > 0
    ? Math.max(...spending.map((s) => s.amount))
    : 100000;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-sans">Analytics & Intelligence</h1>
        <p className="text-gray-500 text-sm mt-1">Audit spend data, supplier scorecards, and system conversions.</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Monthly bar charts */}
        <Card className="lg:col-span-2">
          <CardBody className="p-6 space-y-6">
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Landmark className="w-5 h-5 text-primary-500" /> Spend Analysis (Monthly)
            </h3>

            {spending.length === 0 ? (
              <p className="text-xs text-gray-400 py-12 text-center">No monthly spending logs recorded.</p>
            ) : (
              <div className="space-y-4">
                {/* CSS Bar Chart */}
                <div className="flex items-end justify-between h-48 pt-6 border-b border-gray-100 px-4 gap-2">
                  {spending.map((s, idx) => {
                    const percentage = (s.amount / maxSpendingVal) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center group relative">
                        {/* Tooltip */}
                        <span className="absolute -top-7 scale-0 group-hover:scale-100 transition-transform bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow font-semibold">
                          Rs. {s.amount.toLocaleString()}
                        </span>
                        {/* Bar */}
                        <div
                          style={{ height: `${Math.max(5, percentage)}%` }}
                          className="w-full bg-primary-600 rounded-t-lg group-hover:bg-primary-500 transition-colors"
                        />
                        <span className="text-[10px] font-bold text-gray-400 mt-2 whitespace-nowrap">
                          {s.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* General conversion stats */}
        <Card className="lg:col-span-1">
          <CardBody className="p-6 space-y-6">
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-500" /> RFQ Conversion
            </h3>

            {(!stats) ? (
              <p className="text-xs text-gray-400 py-12 text-center">No conversion records found.</p>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 border border-gray-100 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Bids Received:</span>
                    <span className="font-bold text-gray-900">{stats.totalQuotations || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Purchase Orders:</span>
                    <span className="font-bold text-gray-900">{stats.totalPOs || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average Quotation Value:</span>
                    <span className="font-bold text-primary-600">
                      Rs. {(stats.avgQuotationAmount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                {/* RFQs by status listing */}
                <div className="space-y-2">
                  <p className="font-bold text-gray-700">Demand pipeline</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 border border-gray-100 rounded-lg">
                      <span className="text-gray-400 block text-[10px]">APPROVED RFQs</span>
                      <span className="text-sm font-bold text-emerald-600">{stats.rfqsByStatus?.APPROVED || 0}</span>
                    </div>
                    <div className="p-2 border border-gray-100 rounded-lg">
                      <span className="text-gray-400 block text-[10px]">PENDING APPROVAL</span>
                      <span className="text-sm font-bold text-amber-600">{stats.rfqsByStatus?.APPROVAL_PENDING || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Supplier Scorecards */}
      <Card>
        <CardBody className="p-6">
          <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" /> Supplier Scorecards
          </h3>

          {vendors.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No active suppliers onboarded.</p>
          ) : (
            <Table headers={["Supplier", "Rating Score", "Purchase Orders", "Success Rate"]}>
              {vendors.map((v, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900 leading-tight">{v.companyName}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{v.category}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-yellow-500 font-bold text-xs">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{v.rating.toFixed(1)} / 5.0</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-700">
                    {v.purchaseOrdersCount || 0} Orders
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {/* CSS progress bar */}
                      <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          style={{ width: `${v.successRate || 75}%` }}
                          className="bg-emerald-500 h-full rounded-full"
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-800">{(v.successRate || 75).toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
