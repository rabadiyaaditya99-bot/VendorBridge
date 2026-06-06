import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getQuotations } from "../../api/quotation.api";
import { useAuth } from "../../context/AuthContext";
import { ROLES, STATUS_COLORS } from "../../utils/constants";
import Table from "../../components/ui/Table";
import EmptyState from "../../components/common/EmptyState";
import { ShoppingBag, Eye, ExternalLink } from "lucide-react";

export default function QuotationList() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getQuotations()
      .then((res) => {
        if (res.data?.success) {
          setQuotations(res.data.data);
        }
      })
      .catch((err) => console.error("Error loading quotations:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-sans">Quotations</h1>
        <p className="text-gray-500 text-sm mt-1">
          {user?.role === ROLES.VENDOR 
            ? "Track your submitted bids, pricing structures, and selection statuses." 
            : "Review all suppliers bids submitted in response to active RFQs."}
        </p>
      </div>

      {/* Table section */}
      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading quotations...</div>
      ) : quotations.length === 0 ? (
        <EmptyState
          title="No quotations found"
          description="Submit quotes for active RFQs to get started."
          actionText={user?.role === ROLES.VENDOR ? "Browse RFQs" : null}
          onAction={user?.role === ROLES.VENDOR ? () => navigate("/rfqs") : null}
        />
      ) : (
        <Table headers={["Quotation", "RFQ Title", "Supplier", "Unit Price", "Total Bid", "Status", "Submitted Date", "Action"]}>
          {quotations.map((quote) => (
            <tr key={quote.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4 font-semibold text-gray-900 text-xs font-mono whitespace-nowrap">
                #{quote.id.substring(0, 8).toUpperCase()}
              </td>
              <td className="px-6 py-4 font-medium text-gray-800">
                {quote.rfq?.title || "RFQ Ref"}
              </td>
              <td className="px-6 py-4">
                {quote.vendor?.companyName || "Supplier"}
              </td>
              <td className="px-6 py-4">Rs. {quote.price.toLocaleString()}</td>
              <td className="px-6 py-4 font-bold text-primary-600">
                Rs. {quote.totalAmount.toLocaleString()}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    STATUS_COLORS[quote.status] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {quote.status}
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-gray-500">
                {new Date(quote.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => navigate(`/rfqs/${quote.rfqId}`)}
                  className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-1 text-xs"
                  title="View RFQ"
                >
                  <ExternalLink className="w-4 h-4" /> RFQ
                </button>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
