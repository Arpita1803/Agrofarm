import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const createComplaint = async (payload) => {
  const res = await API.post("/complaints", payload);
  return res.data;
};

export const fetchMyComplaints = async () => {
  const res = await API.get("/complaints/my");
  return res.data;
};

export const fetchAdminComplaints = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      params.append(key, value);
    }
  });

  const query = params.toString();
  const res = await API.get(`/complaints/admin/all${query ? `?${query}` : ""}`);
  return res.data;
};

export const updateComplaintByAdmin = async (complaintId, payload) => {
  const res = await API.patch(`/complaints/admin/${complaintId}`, payload);
  return res.data;
};
