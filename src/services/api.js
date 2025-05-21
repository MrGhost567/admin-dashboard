import axios from "axios";

// ========== إعداد الاتصال الأساسي ==========

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// ========== التعامل مع CSRF ==========

let getOrRefreshCsrfToken = null;

const ensureCsrfToken = async () => {
  if (getOrRefreshCsrfToken) return getOrRefreshCsrfToken;

  getOrRefreshCsrfToken = axios
    .get(`${API_BASE_URL.replace("/api/v1", "")}/sanctum/csrf-cookie`, {
      withCredentials: true,
    })
    .then(() => {
      getOrRefreshCsrfToken = null;
    })
    .catch((err) => {
      getOrRefreshCsrfToken = null;
      throw err;
    });

  return getOrRefreshCsrfToken;
};

// ========== Interceptors ==========

// قبل كل طلب
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.method !== "get") {
    await ensureCsrfToken();
  }

  return config;
});

// بعد كل رد
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    if (error.response?.status === 419) {
      await ensureCsrfToken();
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

// ========== نظام المصادقة (Authentication) ==========

const Auth = {
  async login({ username, password }) {
    await ensureCsrfToken();
    const response = await api.post("/login", { username, password });

    const token = response.data.token;
    const user = response.data.user;

    if (!token || !user) {
      throw new Error("Login failed: Invalid credentials");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return user;
  },

  async logout() {
    await api.post("/logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem("token");
  },

  isAdmin() {
    const user = Auth.getUser();
    return user?.isAdmin === 1;
  },

  getCsrfToken: ensureCsrfToken,
};

// ========== التصدير ==========

export { Auth };
export default api;
