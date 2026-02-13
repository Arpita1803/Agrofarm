export const decodeTokenPayload = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return {};

    const payload = token.split('.')[1];
    if (!payload) return {};

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(normalized)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );

    return JSON.parse(json);
  } catch {
    return {};
  }
};

export const getCurrentUser = () => {
  const payload = decodeTokenPayload();
  return {
    role: localStorage.getItem('role') || payload?.role,
    userId: payload?.id || payload?.userId || payload?._id,
    name: localStorage.getItem('name') || payload?.name,
  };
};
