import axios from "axios";

// Create an Axios instance with the base URL of your Django backend
const instance = axios.create({
  baseURL: "http://localhost:8000/api/", // replace with your backend URL if different
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach JWT access token
instance.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem("access");
    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  },
  (error) => {
    // handle request error
    return Promise.reject(error);
  }
);

export default instance;
