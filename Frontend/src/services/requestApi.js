const BASE = "http://localhost:5000/api/requests";

export const createRequest = async (data) => {
  const token = localStorage.getItem("token");
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const fetchRequests = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(BASE, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
