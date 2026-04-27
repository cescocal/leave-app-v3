import { useState } from "react";
import api from "../utils/api";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      onLogin();
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-cescoBlueLight px-4">

      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-sm text-center">

        {/* Logo */}
        <img
          src="/logo.png"
          alt="Company Logo"
          className="w-20 h-20 mx-auto mb-4"
        />

        <h1 className="text-xl font-semibold text-cescoBlueDark mb-6">
          Leave Management System
        </h1>

        <form className="space-y-4 text-left" onSubmit={submit}>
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-cescoBlue"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-cescoBlue"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <button
            className="w-full bg-cescoBlue text-white py-2 rounded hover:bg-cescoBlueDark"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
