import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const fetchMyOrders = async () => {
  try {
    const res = await API.get("/orders/my");
    return res.data;
  } catch (error) {
    console.error("Fetch my orders error:", error.response?.data || error.message);
    return [];
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const res = await API.patch(`/orders/${orderId}/status`, { status });
    return res.data;
  } catch (error) {
    console.error("Update order status error:", error.response?.data || error.message);
    throw error;
  }
};
