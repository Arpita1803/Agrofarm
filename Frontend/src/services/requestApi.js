import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// attach token if exists
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const createRequest = async (data) => {
  try {
    const res = await API.post("/requests", data);
    return res.data;
  } catch (error) {
    console.error("Create request error:", error.response?.data || error.message);
    throw error;
  }
};

export const fetchRequests = async () => {
  try {
    const res = await API.get("/requests");
    return res.data;
  } catch (error) {
    console.error("Fetch requests error:", error.response?.data || error.message);
    return [];
  }
};
