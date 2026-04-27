import { useEffect, useState } from "react";
import api from "../utils/api";
import Modal from "../components/Modal";
import { Button, Input, Select } from "../components/UI";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openReset, setOpenReset] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "staff",
    full_name: "",
    supervisor_id: ""
  });

  const [resetPassword, setResetPassword] = useState("");

  const load = () => {
    api.get("/admin/users").then((res) => {
      setUsers(res.data);

      // Supervisors = users with role "supervisor"
      const sup = res.data.filter((u) => u.role === "supervisor");
      setSupervisors(sup);
    });
  };

  useEffect(() => {
    load();
  }, []);

  /* -----------------------------
     CREATE USER
  ------------------------------ */
  const submitAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/users", form);

      setForm({
        username: "",
        password: "",
        role: "staff",
        full_name: "",
        supervisor_id: ""
      });

      setOpenAdd(false);
      load();
    } catch (err) {
      const msg = err.response?.data?.error || "";
      if (msg.includes("exists")) alert("Username already exists.");
      else alert("Failed to create user.");
    }
  };

  /* -----------------------------
     EDIT USER
  ------------------------------ */
  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/users/${selectedUser.id}`, {
        full_name: selectedUser.full_name,
        role: selectedUser.role,
        supervisor_id: selectedUser.supervisor_id || null
      });

      setOpenEdit(false);
      load();
    } catch (err) {
      alert("Failed to update user.");
    }
  };

  /* -----------------------------
     RESET PASSWORD
  ------------------------------ */
  const submitReset = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/users/${selectedUser.id}/reset-password`, {
        new_password: resetPassword,
      });

      setResetPassword("");
      setOpenReset(false);
      load();
    } catch (err) {
      alert("Failed to reset password.");
    }
  };

  /* -----------------------------
     DELETE USER
  ------------------------------ */
  const submitDelete = async () => {
    try {
      await api.delete(`/admin/users/${selectedUser.id}`);
      setOpenDelete(false);
      load();
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  /* -----------------------------
     ACTION HANDLER
  ------------------------------ */
  const openMenuAction = (user, action) => {
    setSelectedUser({ ...user });

    if (action === "edit") setOpenEdit(true);
    if (action === "delete") setOpenDelete(true);
    if (action === "reset") setOpenReset(true);
  };

  

return (
  <div className="space-y-6">

    {/* Header */}
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-cescoBlueDark">
        User Management
      </h1>

      <Button variant="primary" onClick={() => setOpenAdd(true)}>
        + Add User
      </Button>
    </div>

    {/* USER CARDS */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((u) => (
        <div
          key={u.id}
          className={`bg-white rounded-lg p-5 border border-gray-300 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between ${
            u.active === 0 ? "opacity-60" : ""
          }`}
        >
          {/* User Info */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-cescoBlueDark">
              {u.full_name}
            </h2>

            <p className="text-sm text-gray-600">
              <strong>Username:</strong> {u.username}
            </p>

            <p className="text-sm text-gray-600 capitalize">
              <strong>Role:</strong> {u.role}
            </p>

            {u.supervisor_id && (
              <p className="text-sm text-gray-600">
                <strong>Supervisor:</strong>{" "}
                {users.find((x) => x.id === u.supervisor_id)?.full_name || "—"}
              </p>
            )}
          </div>

          {/* Toggle Active */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {u.active ? "Active" : "Inactive"}
            </span>

            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={u.active === 1}
                onChange={() =>
                  api
                    .put(`/admin/users/${u.id}/toggle`, {
                      active: u.active ? 0 : 1,
                    })
                    .then(load)
                }
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-green-500 relative transition">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
              </div>
            </label>
          </div>

          {/* Icon Action Buttons */}
          <div className="mt-4 pt-4 border-t flex justify-between text-2xl">
            <button
              className="text-blue-600 hover:text-blue-800 transition transform hover:scale-110"
              onClick={() => openMenuAction(u, "edit")}
              title="Edit User"
            >
              ✏️
            </button>

            <button
              className="text-yellow-600 hover:text-yellow-800 transition transform hover:scale-110"
              onClick={() => openMenuAction(u, "reset")}
              title="Reset Password"
            >
              🔑
            </button>

            <button
              className="text-red-600 hover:text-red-800 transition transform hover:scale-110"
              onClick={() => openMenuAction(u, "delete")}
              title="Delete User"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>

    {/* -----------------------------
        ADD USER MODAL
    ------------------------------ */}
    <Modal open={openAdd} title="Add New User" onClose={() => setOpenAdd(false)}>
      <form className="space-y-4" onSubmit={submitAdd}>
        <Input
          label="Full Name"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />

        <Input
          label="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />

        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <Select
          label="Role"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="staff">Staff</option>
          <option value="supervisor">Supervisor</option>
          <option value="admin">Admin</option>
        </Select>

        {form.role === "staff" && (
          <Select
            label="Supervisor"
            value={form.supervisor_id}
            onChange={(e) =>
              setForm({ ...form, supervisor_id: e.target.value })
            }
          >
            <option value="">-- Select Supervisor --</option>
            {supervisors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name}
              </option>
            ))}
          </Select>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={() => setOpenAdd(false)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save User
          </Button>
        </div>
      </form>
    </Modal>

    {/* -----------------------------
        EDIT USER MODAL
    ------------------------------ */}
    <Modal open={openEdit} title="Edit User" onClose={() => setOpenEdit(false)}>
      {selectedUser && (
        <form className="space-y-4" onSubmit={submitEdit}>
          <Input
            label="Full Name"
            value={selectedUser.full_name}
            onChange={(e) =>
              setSelectedUser({ ...selectedUser, full_name: e.target.value })
            }
          />

          <Select
            label="Role"
            value={selectedUser.role}
            onChange={(e) =>
              setSelectedUser({ ...selectedUser, role: e.target.value })
            }
          >
            <option value="staff">Staff</option>
            <option value="supervisor">Supervisor</option>
            <option value="admin">Admin</option>
          </Select>

          {selectedUser.role === "staff" && (
            <Select
              label="Supervisor"
              value={selectedUser.supervisor_id || ""}
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  supervisor_id: e.target.value,
                })
              }
            >
              <option value="">-- Select Supervisor --</option>
              {supervisors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
            </Select>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setOpenEdit(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      )}
    </Modal>

    {/* -----------------------------
        RESET PASSWORD MODAL
    ------------------------------ */}
    <Modal open={openReset} title="Reset Password" onClose={() => setOpenReset(false)}>
      <form className="space-y-4" onSubmit={submitReset}>
        <Input
          label="New Password"
          type="password"
          value={resetPassword}
          onChange={(e) => setResetPassword(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={() => setOpenReset(false)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Reset Password
          </Button>
        </div>
      </form>
    </Modal>

    {/* -----------------------------
        DELETE USER CONFIRMATION
    ------------------------------ */}
    <Modal open={openDelete} title="Delete User" onClose={() => setOpenDelete(false)}>
      <p className="mb-4">
        Are you sure you want to delete{" "}
        <strong>{selectedUser?.full_name}</strong>?
      </p>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => setOpenDelete(false)}>
          Cancel
        </Button>
        <Button variant="danger" onClick={submitDelete}>
          Delete
        </Button>
      </div>
    </Modal>

  </div>
);
}
