import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function LeaveForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const [workingDays, setWorkingDays] = useState(0);

  /* -----------------------------
     WORKING DAYS CALCULATION
  ------------------------------ */
  const calculateWorkingDays = (start, end) => {
    if (!start || !end) return 0;

    let startDate = new Date(start);
    let endDate = new Date(end);

    if (endDate < startDate) return 0;

    let count = 0;

    while (startDate <= endDate) {
      const day = startDate.getDay(); // 0=Sun, 6=Sat
      if (day !== 0 && day !== 6) count++;
      startDate.setDate(startDate.getDate() + 1);
    }

    return count;
  };

  useEffect(() => {
    setWorkingDays(calculateWorkingDays(form.start_date, form.end_date));
  }, [form.start_date, form.end_date]);

  /* -----------------------------
     CALENDAR GENERATION
  ------------------------------ */
  const generateCalendar = () => {
    if (!form.start_date) return [];

    const date = new Date(form.start_date);
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const calendar = [];
    let week = [];

    // Corrected line
    for (let i = 0; i < firstDay.getDay(); i++) {
      week.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      week.push(new Date(year, month, day));

      if (week.length === 7) {
        calendar.push(week);
        week = [];
      }
    }

    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      calendar.push(week);
    }

    return calendar;
  };

  const isInRange = (d) => {
    if (!d || !form.start_date || !form.end_date) return false;

    const start = new Date(form.start_date);
    const end = new Date(form.end_date);

    return d >= start && d <= end;
  };

  const isWorkingDay = (d) => {
    if (!d) return false;
    const day = d.getDay();
    return day !== 0 && day !== 6;
  };

  /* -----------------------------
     SUBMIT
  ------------------------------ */
  const submit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/leave", form);
      alert("Leave request submitted!");
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to submit leave request.");
    }
  };

  /* -----------------------------
     UI
  ------------------------------ */
  return (
    <div className="max-w-xl bg-white shadow rounded p-6">
      <h1 className="text-2xl font-semibold text-cescoBlueDark mb-4">
        New Leave Request
      </h1>

      <form className="space-y-4" onSubmit={submit}>
        {/* Leave Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Leave Type</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={form.leave_type}
            onChange={(e) => setForm({ ...form, leave_type: e.target.value })}
          >
            <option value="">Select type</option>
            <option value="annual">Annual Leave</option>
            <option value="medical">Medical Leave</option>
            <option value="unpaid">Unpaid Leave</option>
          </select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={form.start_date}
              onChange={(e) =>
                setForm({ ...form, start_date: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={form.end_date}
              onChange={(e) =>
                setForm({ ...form, end_date: e.target.value })
              }
            />
          </div>
        </div>

        {/* Working Days */}
        {workingDays > 0 && (
          <div className="p-3 bg-gray-100 rounded border text-sm">
            <strong>Working Days:</strong> {workingDays}
          </div>
        )}

        {/* Calendar Preview */}
        {form.start_date && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-cescoBlueDark mb-2">
              Calendar Preview
            </h2>

            <div className="grid grid-cols-7 text-center font-medium text-gray-600 mb-1">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            <div className="space-y-1">
              {generateCalendar().map((week, i) => (
                <div key={i} className="grid grid-cols-7 gap-1">
                  {week.map((d, idx) => {
                    const active = isInRange(d) && isWorkingDay(d);

                    return (
                      <div
                        key={idx}
                        className={`h-10 flex items-center justify-center rounded border text-sm
                          ${!d ? "bg-gray-100 border-gray-200" : ""}
                          ${d && !active ? "bg-white border-gray-300" : ""}
                          ${active ? "bg-green-200 border-green-500 font-semibold" : ""}
                        `}
                      >
                        {d ? d.getDate() : ""}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium mb-1">Reason</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows="4"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
        </div>

        {/* Submit */}
        <button className="px-4 py-2 bg-cescoBlue text-white rounded hover:bg-cescoBlueDark">
          Submit Request
        </button>
      </form>
    </div>
  );
}
