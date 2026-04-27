import { useEffect, useState } from "react";
import api from "../utils/api";
import Calendar from "../components/Calendar";

export default function AdminDashboard() {
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedThisMonth, setApprovedThisMonth] = useState(0);
  const [rejectedThisMonth, setRejectedThisMonth] = useState(0);
  const [approvedRequests, setApprovedRequests] = useState([]);

  const load = async () => {
    try {
      const res = await api.get("/admin/leave");
      const all = res.data.requests || [];

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const isSameMonth = (dateStr) => {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      };

      const pending = all.filter(
        (r) => !r.status || r.status === "pending"
      );

      const approvedMonth = all.filter(
        (r) => r.status === "approved" && isSameMonth(r.start_date)
      );

      const rejectedMonth = all.filter(
        (r) => r.status === "rejected" && isSameMonth(r.start_date)
      );

      const approvedAll = all.filter((r) => r.status === "approved");

      setPendingCount(pending.length);
      setApprovedThisMonth(approvedMonth.length);
      setRejectedThisMonth(rejectedMonth.length);
      setApprovedRequests(approvedAll);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-cescoBlueDark">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-sm text-slate-500">Pending Requests</h2>
          <p className="text-3xl font-bold text-cescoBlue">
            {pendingCount}
          </p>
        </div>

        <div className="bg-white shadow rounded p-4">
          <h2 className="text-sm text-slate-500">Approved This Month</h2>
          <p className="text-3xl font-bold text-green-600">
            {approvedThisMonth}
          </p>
        </div>

        <div className="bg-white shadow rounded p-4">
          <h2 className="text-sm text-slate-500">Rejected This Month</h2>
          <p className="text-3xl font-bold text-red-600">
            {rejectedThisMonth}
          </p>
        </div>
      </div>

      {/* Calendar should highlight approved leave for the displayed month */}
      <Calendar approvedRequests={approvedRequests} />
    </div>
  );
}
