import { useEffect, useState } from "react";
import api from "../utils/api";

export default function SupervisorDashboard() {
  const [summary, setSummary] = useState({
    pending_requests: 0,
    staff_requests: []
  });

  useEffect(() => {
    api.get("/supervisor/leave/summary").then(res => {
      setSummary(res.data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-cescoBlueDark">
        Supervisor Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-sm text-slate-500">Pending Approvals</h2>
          <p className="text-3xl font-bold text-yellow-600">
            {summary.pending_requests}
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-semibold text-cescoBlueDark mb-3">
          Staff Leave Requests
        </h2>

        {summary.staff_requests.length === 0 ? (
          <p className="text-gray-500">No leave requests from your staff.</p>
        ) : (
          <ul className="space-y-2">
            {summary.staff_requests.map((r) => (
              <li key={r.id} className="border p-3 rounded">
                <strong>{r.full_name}</strong>
                <br />
                {r.start_date} → {r.end_date}
                <br />
                Status: {r.status || "pending"}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
