import { Routes, Route, Navigate } from "react-router-dom";
import useAuth from "./hooks/useAuth";

import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import AdminDashboard from "./pages/AdminDashboard";
import AdminLeaveApproval from "./pages/AdminLeaveApproval";
import AdminUsers from "./pages/AdminUsers";

import StaffDashboard from "./pages/StaffDashboard";
import LeaveForm from "./pages/LeaveForm";
import LeaveHistory from "./pages/LeaveHistory";

import SupervisorDashboard from "./pages/SupervisorDashboard";
import SupervisorApproval from "./pages/SupervisorApproval";

export default function App() {
  const { user, reload } = useAuth();

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  // If not logged in → show login page
  if (!user) return <Login onLogin={reload} />;

  return (
    <div className="h-screen flex flex-col">

      <Navbar user={user} onLogout={logout} />

      <div className="flex flex-1">
        <Sidebar role={user.role} />

        <main className="flex-1 p-6 overflow-auto bg-slate-100">
          <Routes>

            {/* -------------------------
                ADMIN ROUTES
            -------------------------- */}
            {user.role === "admin" && (
              <>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/approval" element={<AdminLeaveApproval />} />
                <Route path="/admin/users" element={<AdminUsers />} />

                <Route path="*" element={<Navigate to="/admin/dashboard" />} />
              </>
            )}

            {/* -------------------------
                SUPERVISOR ROUTES
            -------------------------- */}
            {user.role === "supervisor" && (
              <>
                {/* Supervisor-specific pages */}
                <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
                <Route path="/supervisor/approval" element={<SupervisorApproval />} />

                {/* Supervisors ALSO get staff pages */}
                <Route path="/staff/dashboard" element={<StaffDashboard />} />
                <Route path="/staff/new" element={<LeaveForm />} />
                <Route path="/staff/history" element={<LeaveHistory />} />

                <Route path="*" element={<Navigate to="/supervisor/dashboard" />} />
              </>
            )}

            {/* -------------------------
                STAFF ROUTES
            -------------------------- */}
            {user.role === "staff" && (
              <>
                <Route path="/staff/dashboard" element={<StaffDashboard />} />
                <Route path="/staff/new" element={<LeaveForm />} />
                <Route path="/staff/history" element={<LeaveHistory />} />

                <Route path="*" element={<Navigate to="/staff/dashboard" />} />
              </>
            )}

          </Routes>
        </main>
      </div>
    </div>
  );
}
