// api.js
import axios from "axios";

// Base URL for API
const baseURL = import.meta.env.DEV ? "/api" : "/api"; // Dev: Vite proxy, Prod: Nginx

const api = axios.create({
  baseURL,
   headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // VERY IMPORTANT for cookies
});

export default api;
