import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ role }) {
  const location = useLocation();

  // ADMIN MENU
  const adminItems = [
    { path: "/admin/dashboard", label: "Dashboard" },
    { path: "/admin/approval", label: "Leave Approval" },
    { path: "/admin/users", label: "User Management" },
  ];

  // STAFF MENU (also used by supervisors)
  const staffItems = [
    { path: "/staff/dashboard", label: "Dashboard" },
    { path: "/staff/new", label: "New Leave Request" },
    { path: "/staff/history", label: "My Leave History" },
  ];

  // SUPERVISOR MENU (extra items)
  const supervisorItems = [
    { path: "/supervisor/dashboard", label: "Supervisor Dashboard" },
    { path: "/supervisor/approval", label: "Staff Leave Approval" },
  ];

  let items = [];

  if (role === "admin") {
    items = adminItems;
  } else if (role === "supervisor") {
    // Supervisors get staff menu + supervisor menu
    items = [...staffItems, ...supervisorItems];
  } else {
    // Staff only
    items = staffItems;
  }

  return (
    <aside className="w-60 bg-white border-r border-slate-200 h-[calc(100vh-3.5rem)]">
      <nav className="p-3 space-y-1">
        {items.map((item) => {
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 rounded text-sm ${
                active
                  ? "bg-cescoBlue text-white"
                  : "text-cescoGrey hover:bg-cescoBlueLight"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
