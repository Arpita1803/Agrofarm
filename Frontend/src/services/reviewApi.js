import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const createReview = async (payload) => {
  const res = await API.post("/reviews", payload);
  return res.data;
};

export const fetchReviewsByOrder = async (orderId) => {
  const res = await API.get(`/reviews/order/${orderId}`);
  return res.data;
};

export const fetchMyGivenReviews = async () => {
  const res = await API.get("/reviews/my/given");
  return res.data;
};

export const fetchMyReceivedReviews = async () => {
  const res = await API.get("/reviews/my/received");
  return res.data;
};
