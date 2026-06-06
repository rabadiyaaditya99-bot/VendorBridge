import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { getApprovals, approveRequest, rejectRequest } from "../../api/approval.api";
import { useAuth } from "../../context/AuthContext";
import { ROLES, STATUS_COLORS } from "../../utils/constants";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Textarea from "../../components/ui/Textarea";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/common/EmptyState";
import { CheckSquare, Check, X, ShieldAlert, AlertCircle } from "lucide-react";

export default function ApprovalList() {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Decision Modal States
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [actionType, setActionType] = useState(""); // "approve" or "reject"
  const [isDecisionOpen, setIsDecisionOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchApprovalsList = async () => {
    setLoading(true);
    try {
      const res = await getApprovals();
      if (res.data?.success) {
        setApprovals(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load approvals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalsList();
  }, []);

  const isManager = user?.role === ROLES.MANAGER || user?.role === ROLES.ADMIN;

  const handleOpenDecision = (approval, type) => {
    setSelectedApproval(approval);
    setActionType(type);
    reset();
    setIsDecisionOpen(true);
  };

  const onDecisionSubmit = async (data) => {
    try {
      let res;
      if (actionType === "approve") {
        res = await approveRequest(selectedApproval.id, data.remarks);
      } else {
        res = await rejectRequest(selectedApproval.id, data.remarks);
      }

      if (res.data?.success) {
        setIsDecisionOpen(false);
        fetchApprovalsList();
      }
    } catch (err) {
      console.error("Approval action error:", err);
      alert(err.response?.data?.message || "Action failed.");
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-sans">Workflow Approvals</h1>
        <p className="text-gray-500 text-sm mt-1">
          {user?.role === ROLES.MANAGER 
            ? "Review procurement bids and authorize Purchase Orders." 
            : "Track requests submitted to management for authorization."}
        </p>
      </div>

      {/* Table grid */}
      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading approvals...</div>
      ) : approvals.length === 0 ? (
        <EmptyState
          title="No approvals found"
          description="Everything is processed and up-to-date."
          icon={CheckSquare}
        />
      ) : (
        <Table headers={["RFQ title", "Supplier", "Total Value", "Requester", "Status", "Date", "Actions"]}>
          {approvals.map((app) => (
            <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4">
                <div>
                  <p className="font-semibold text-gray-900 leading-tight">{app.rfq?.title}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Item: {app.rfq?.itemName} ({app.rfq?.quantity} {app.rfq?.unit})</p>
                </div>
              </td>
              <td className="px-6 py-4 font-medium text-gray-800">
                {app.quotation?.vendor?.companyName}
              </td>
              <td className="px-6 py-4 font-bold text-primary-600">
                Rs. {app.quotation?.totalAmount?.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-xs">
                <div>
                  <p className="font-semibold text-gray-700">{app.requestedBy?.name}</p>
                  <p className="text-gray-400 text-[10px]">{app.requestedBy?.email}</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    STATUS_COLORS[app.status] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {app.status}
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                {new Date(app.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                {isManager && app.status === "PENDING" ? (
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="xs"
                      variant="success"
                      onClick={() => handleOpenDecision(app, "approve")}
                      className="p-1 rounded-md"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </Button>
                    <Button
                      size="xs"
                      variant="danger"
                      onClick={() => handleOpenDecision(app, "reject")}
                      className="p-1 rounded-md"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 font-medium">None</span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Decision Modal (Remarks) */}
      <Modal
        isOpen={isDecisionOpen}
        onClose={() => setIsDecisionOpen(false)}
        title={actionType === "approve" ? "Confirm Purchase Authorization" : "Confirm Quotation Rejection"}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit(onDecisionSubmit)} className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-gray-100 text-xs space-y-2">
            <p className="font-semibold text-gray-700">Audit details:</p>
            <div className="flex justify-between">
              <span className="text-gray-400">RFQ:</span>
              <span className="font-bold text-gray-900">{selectedApproval?.rfq?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Supplier:</span>
              <span className="font-bold text-gray-900">{selectedApproval?.quotation?.vendor?.companyName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Bid Total:</span>
              <span className="font-bold text-primary-600">Rs. {selectedApproval?.quotation?.totalAmount?.toLocaleString()}</span>
            </div>
          </div>

          <Textarea
            label="Audit Notes / Decision Remarks"
            placeholder={actionType === "approve" ? "Authorized because price satisfies budget constraints." : "Rejected due to high bid pricing."}
            error={errors.remarks?.message}
            {...register("remarks", { required: "Decision rationale remarks are required for audit trails" })}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setIsDecisionOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant={actionType === "approve" ? "success" : "danger"}>
              {actionType === "approve" ? "Approve & Sign" : "Reject Bid"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
