import { jwtDecode } from "jwt-decode"; // fixed import
import axios from "../api/anxios";

export async function refreshTokenIfExpired() {
  const access = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");

  if (!access || !refresh) return;

  const decoded = jwtDecode(access);
  const now = Date.now() / 1000;

  // if token expires within 1 hour — refresh it
  if (decoded.exp - now < 3600) {
    try {
      const res = await axios.post("token/refresh/", { refresh });
      localStorage.setItem("access", res.data.access);
    } catch (err) {
      console.error("Token refresh failed", err);
      // optionally log out the user if refresh fails
    }
  }
}
