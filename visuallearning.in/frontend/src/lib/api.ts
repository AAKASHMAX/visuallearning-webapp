import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("vl_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Pages a logged-out visitor is allowed to see. A background 401 here (e.g. the
// navbar notifications call) must NOT bounce them to login — otherwise anonymous
// visitors can't stay on /courses, /pricing, home or the demos (and can't see the
// free-trial offer). Gated pages still redirect on 401.
function isPublicPage(path: string) {
  return (
    path === "/" ||
    path === "/courses" ||
    path.startsWith("/pricing") ||
    path.startsWith("/demo") ||
    path.startsWith("/auth/")
  );
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      if (!isPublicPage(window.location.pathname)) {
        localStorage.removeItem("vl_token");
        localStorage.removeItem("vl_user");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
