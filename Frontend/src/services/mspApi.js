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

export const fetchAllMsp = async () => {
  const res = await API.get("/msp");
  return res.data;
};

export const fetchMspByProduct = async (product) => {
  const encoded = encodeURIComponent(product);
  const res = await API.get(`/msp/${encoded}`);
  return res.data;
};

export const upsertMsp = async (payload) => {
  const res = await API.post("/msp", payload);
  return res.data;
};

export const fetchMspCatalog = async () => {
  const res = await API.get("/msp/catalog/all");
  return res.data;
};