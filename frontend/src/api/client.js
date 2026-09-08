import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 25000, // 25s timeout to catch spun-down backends
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ledgersplit_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("ledgersplit_token");
      window.dispatchEvent(new Event("unauthorizedRedirect"));
    }
    // Handle network error or timeout when backend service is waking up or unreachable
    if (error.code === "ECONNABORTED" || error.message?.includes("Network Error") || error.message?.includes("timeout") || !error.response) {
      if (!error.response) {
        error.response = {
          data: {
            message: "The backend server is taking longer than expected to respond (it may be waking up from sleep on Render, or offline). Please check Render Dashboard or try again in a moment."
          }
        };
      }
    }
    return Promise.reject(error);
  }
);

export default api;