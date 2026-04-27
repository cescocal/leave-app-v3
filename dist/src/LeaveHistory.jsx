import { useEffect, useState } from "react";
import axios from "axios";

export default function LeaveHistory() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:4000/leave/my", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRequests(res.data.requests);
    };

    load();
  }, []);

  return (
    <div>
      <h2>My Leave Requests</h2>

      <table>
        <thead>
          <tr>
            <th>Dates</th>
            <th>Type</th>
            <th>Reason</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {requests.map((r) => (
            <tr key={r.id}>
              <td>{r.start_date} → {r.end_date}</td>
              <td>{r.leave_type}</td>
              <td>{r.reason}</td>
              <td>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
