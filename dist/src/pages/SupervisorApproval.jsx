import { useEffect, useState } from "react";
import api from "../utils/api";

export default function SupervisorApproval() {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);

  // Filters
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    api.get("/admin/leave").then((res) => {
      setRequests(res.data.requests);
      setFiltered(res.data.requests);
    });
  }, []);

  // Apply filters
  useEffect(() => {
    let data = [...requests];

    if (leaveType) {
      data = data.filter((r) => r.leave_type === leaveType);
    }

    if (fromDate) {
      data = data.filter((r) => new Date(r.start_date) >= new Date(fromDate));
    }

    if (toDate) {
      data = data.filter((r) => new Date(r.end_date) <= new Date(toDate));
    }

    setFiltered(data);
  }, [leaveType, fromDate, toDate, requests]);

  const updateStatus = (id, status) => {
    api.put(`/admin/leave/${id}`, { status }).then(() => {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    });
  };

  // CSV Export
  const exportCSV = () => {
    if (filtered.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = [
      "Full Name",
      "Start Date",
      "End Date",
      "Leave Type",
      "Reason",
      "Status"
    ];

    const rows = filtered.map((r) => [
      r.full_name,
      r.start_date,
      r.end_date,
      r.leave_type,
      r.reason ? `"${r.reason.replace(/"/g, '""')}"` : "",
      r.status || "pending"
    ]);

    const csvContent =
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "staff-leave-requests.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-cescoBlueDark">
        Staff Leave Approval
      </h1>

      <button
        onClick={exportCSV}
        className="px-4 py-2 bg-cescoBlue text-white rounded hover:bg-cescoBlueDark"
      >
        Export CSV
      </button>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-4 gap-4">

        <div>
          <label className="text-sm text-slate-600">Leave Type</label>
          <select
            className="w-full border rounded p-2"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
          >
            <option value="">All</option>
            <option value="annual">Annual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="unpaid">Unpaid Leave</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-slate-600">From Date</label>
          <input
            type="date"
            className="w-full border rounded p-2"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-slate-600">To Date</label>
          <input
            type="date"
            className="w-full border rounded p-2"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

      </div>

      {/* REQUEST LIST */}
      {filtered.length === 0 ? (
        <p className="text-gray-500">No leave requests found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white p-4 rounded shadow">
              <p className="font-semibold text-cescoBlueDark">
                {r.full_name}
              </p>

              <p className="text-sm text-slate-600">
                {r.start_date} → {r.end_date}
              </p>

              <p className="mt-1">
                <strong>Type:</strong> {r.leave_type}
              </p>

              <p className="mt-1">
                <strong>Reason:</strong> {r.reason || "No reason provided"}
              </p>

              <p className="mt-1">
                <strong>Status:</strong> {r.status || "pending"}
              </p>

              {(!r.status || r.status === "pending") && (
                <div className="flex gap-2 mt-3">
                  <button
                    className="px-3 py-1 bg-green-600 text-white rounded"
                    onClick={() => updateStatus(r.id, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded"
                    onClick={() => updateStatus(r.id, "rejected")}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
