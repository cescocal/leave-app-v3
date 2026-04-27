import { useEffect, useState } from "react";
import api from "../utils/api";

export default function Calendar() {
  const [month, setMonth] = useState(new Date());
  const [events, setEvents] = useState([]);

  const load = async () => {
    const year = month.getFullYear();
    const m = month.getMonth() + 1;
    const res = await api.get(`/admin/calendar?year=${year}&month=${m}`);
    setEvents(res.data.events || []);
  };

  useEffect(() => {
    load();
  }, [month]);

  return (
    <div className="bg-white rounded shadow p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-cescoBlueDark">
          {month.toLocaleString("default", { month: "long" })} {month.getFullYear()}
        </h2>

        <div className="space-x-2">
          <button
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1))}
            className="px-2 py-1 text-sm rounded border border-slate-300 hover:bg-slate-100"
          >
            ◀
          </button>
          <button
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1))}
            className="px-2 py-1 text-sm rounded border border-slate-300 hover:bg-slate-100"
          >
            ▶
          </button>
        </div>
      </div>

      <div className="grid gap-2">
        {events.length === 0 && (
          <p className="text-sm text-slate-500">No leave recorded for this month.</p>
        )}

        {events.map((e) => (
          <div
            key={e.id}
            className="border border-cescoBlueLight rounded px-3 py-2 text-sm flex justify-between"
          >
            <div>
              <div className="font-semibold text-cescoBlueDark">{e.username}</div>
              <div className="text-slate-600">
                {e.start_date} → {e.end_date} ({e.leave_type})
              </div>
            </div>

            <span
              className={`text-xs px-2 py-1 rounded ${
                e.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : e.status === "rejected"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {e.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
