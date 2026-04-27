import { useState } from "react";
import axios from "axios";

export default function LeaveForm() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [type, setType] = useState("annual");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  const submitLeave = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:4000/leave",
        {
          start_date: start,
          end_date: end,
          leave_type: type,
          reason,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("Leave request submitted!");
    } catch (err) {
      setMessage("Error submitting leave");
    }
  };

  return (
    <div>
      <h2>Submit Leave Request</h2>

      <form onSubmit={submitLeave}>
        <label>Start Date</label>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />

        <label>End Date</label>
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />

        <label>Leave Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="annual">Annual</option>
          <option value="medical">Medical</option>
          <option value="unpaid">Unpaid</option>
        </select>

        <label>Reason</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} />

        <button type="submit">Submit</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
