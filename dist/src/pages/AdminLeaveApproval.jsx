import { useEffect, useState } from "react";
import api from "../utils/api";

export default function AdminLeaveApproval() {
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);

  const [filters, setFilters] = useState({
    user_id: "",
    type: "",
    status: "pending",
    fromDate: "",
    toDate: ""
  });

  // Load list of users
  const loadUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users", err);
    }
  };

  // Load filtered leave requests
  const load = async () => {
    try {
      const params = new URLSearchParams();

      if (filters.user_id) params.append("user_id", filters.user_id);
      if (filters.type) params.append("type", filters.type);
      if (filters.status) params.append("status", filters.status);
      if (filters.fromDate) params.append("from", filters.fromDate);
      if (filters.toDate) params.append("to", filters.toDate);

      const res = await api.get(`/admin/leave?${params.toString()}`);
      setRows(res.data.requests || []);
    } catch (err) {
      console.error("Failed to load leave requests", err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    load();
  }, [filters]);

  const update = async (id, status) => {
    try {
      await api.put(`/admin/leave/${id}`, { status });
      load();
    } catch (err) {
      console.error("Failed to update leave request", err);
    }
  };

  // CSV Export
  const exportCSV = () => {
    if (rows.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = [
      "Employee",
      "Start Date",
      "End Date",
      "Leave Type",
      "Reason",
      "Status"
    ];

    const csvRows = rows.map((r) => [
      r.full_name,
      r.start_date,
      r.end_date,
      r.leave_type,
      r.reason ? `"${r.reason.replace(/"/g, '""')}"` : "",
      r.status || "pending"
    ]);

    const csvContent =
      [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "admin-leave-requests.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-cescoBlueDark mb-4">
        Leave Approval
      </h1>

      {/* EXPORT BUTTON */}
      <button
        onClick={exportCSV}
        className="px-4 py-2 mb-4 bg-cescoBlue text-white rounded hover:bg-cescoBlueDark"
      >
        Export CSV
      </button>

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-4 mb-4">

        {/* Employee */}
        <select
          className="border p-2 rounded"
          value={filters.user_id}
          onChange={(e) =>
            setFilters({ ...filters, user_id: e.target.value })
          }
        >
          <option value="">All Employees</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.full_name}
            </option>
          ))}
        </select>

        {/* Leave Type */}
        <select
          className="border p-2 rounded"
          value={filters.type}
          onChange={(e) =>
            setFilters({ ...filters, type: e.target.value })
          }
        >
          <option value="">All Types</option>
          <option value="annual">Annual</option>
          <option value="sick">Sick</option>
          <option value="unpaid">Unpaid</option>
        </select>

        {/* Status */}
        <select
          className="border p-2 rounded"
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value })
          }
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        {/* From Date */}
        <input
          type="date"
          className="border p-2 rounded"
          value={filters.fromDate}
          onChange={(e) =>
            setFilters({ ...filters, fromDate: e.target.value })
          }
        />

        {/* To Date */}
        <input
          type="date"
          className="border p-2 rounded"
          value={filters.toDate}
          onChange={(e) =>
            setFilters({ ...filters, toDate: e.target.value })
          }
        />

      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cescoBlueLight text-cescoBlueDark">
            <tr>
              <th className="p-3 text-left">Employee</th>
              <th className="p-3 text-left">Dates</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Reason</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-3">{r.full_name}</td>

                <td className="p-3">
                  {r.start_date} → {r.end_date}
                </td>

                <td className="p-3">{r.leave_type}</td>

                <td className="p-3">{r.reason || "—"}</td>

                <td className="p-3 capitalize">{r.status || "pending"}</td>

                <td className="p-3 space-x-2">
                  <button
                    onClick={() => update(r.id, "approved")}
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => update(r.id, "rejected")}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-slate-500">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
