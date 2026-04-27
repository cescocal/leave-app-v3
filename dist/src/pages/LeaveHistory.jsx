import { useEffect, useState } from "react";
import api from "../utils/api";

export default function LeaveHistory() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api
      .get("/staff/leave")
      .then((res) => {
        console.log("Leave history response:", res.data);
        const data =
          Array.isArray(res.data)
            ? res.data
            : res.data.requests || res.data.rows || [];
        setRows(data);
      })
      .catch((err) => {
        console.error("Failed to load leave history", err);
      });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-cescoBlueDark mb-4">
        My Leave History
      </h1>

      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cescoBlueLight text-cescoBlueDark">
            <tr>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Dates</th>
              <th className="p-3 text-left">Reason</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-3">{r.leave_type}</td>
                <td className="p-3">
                  {r.start_date} → {r.end_date}
                </td>
                <td className="p-3">{r.reason || "—"}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      r.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : r.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-slate-500">
                  No leave history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
