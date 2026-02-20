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

export const createOrGetChat = async (payload) => {
  const res = await API.post("/chats", payload);
  return res.data;
};

export const fetchMyChats = async () => {
  const res = await API.get("/chats/my");
  return res.data;
};

export const fetchChatMessages = async (chatId) => {
  const res = await API.get(`/chats/${chatId}/messages`);
  return res.data;
};

export const sendChatMessage = async (chatId, text) => {
  const res = await API.post(`/chats/${chatId}/messages`, { text });
  return res.data;
};


export const submitChatDeal = async (chatId, payload) => {
  const res = await API.post(`/chats/${chatId}/deal`, payload);
  return res.data;
};
};
