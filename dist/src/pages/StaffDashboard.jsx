import { useEffect, useState } from "react";
import api from "../utils/api";
import { Button } from "../components/UI";

export default function StaffDashboard() {
  const [summary, setSummary] = useState({
    total_days_used: 0,
    pending_requests: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/staff/leave/summary")
      .then((res) => {
        setSummary(res.data);
      })
      .catch(() => {
        // fallback if API fails
        setSummary({
          total_days_used: 0,
          pending_requests: 0,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-cescoBlueDark">
        Staff Dashboard
      </h1>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Total Leave Days Used */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-sm text-slate-500">Leave Days Used</h2>
          <p className="text-3xl font-bold text-cescoBlue">
            {loading ? "…" : summary.total_days_used}
          </p>
        </div>

        {/* Pending Requests */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-sm text-slate-500">Pending Requests</h2>
          <p className="text-3xl font-bold text-yellow-600">
            {loading ? "…" : summary.pending_requests}
          </p>
        </div>

      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-semibold text-cescoBlueDark mb-3">
          Quick Actions
        </h2>

        <Button
          variant="primary"
          onClick={() => (window.location.href = "/leave/apply")}
        >
          Apply for Leave
        </Button>
      </div>
    </div>
  );
}
