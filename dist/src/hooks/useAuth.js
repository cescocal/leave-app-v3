import { useEffect, useState } from "react";
import api from "../utils/api";

export default function useAuth() {
  const [user, setUser] = useState(null);

  const loadUser = async () => {
    try {
      const res = await api.get("/protected");
      setUser(res.data.user);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return { user, reload: loadUser };
}
