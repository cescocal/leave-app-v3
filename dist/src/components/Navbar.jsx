export default function Navbar({ user, onLogout }) {
  return (
    <header className="h-14 bg-white shadow flex items-center justify-between px-6">

      {/* Left side: Logo + Text */}
      <div className="flex items-center gap-2">
        <img
          src="/logo.png"
          alt="Logo"
          className="h-8 w-auto"
        />
        <span className="font-semibold text-cescoBlueDark">
          Leave Management
        </span>
      </div>

      {/* Right side: User + Logout */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-cescoGrey">
          {user?.username} ({user?.role})
        </span>

        <button
          onClick={onLogout}
          className="text-sm px-3 py-1 rounded bg-cescoBlue text-white hover:bg-cescoBlueDark"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
