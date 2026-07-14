import axios from "axios";

const api = axios.create({
  baseURL: "https://ledgersplit.onrender.com/api",   // ← ye change kar
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ledgersplit_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
