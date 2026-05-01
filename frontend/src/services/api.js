const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const request = async (path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
  };

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload;
};

export const expenseApi = {
  list: () => request("/expenses"),
  create: (body) => request("/expenses", { method: "POST", body }),
  update: (id, body) => request(`/expenses/${id}`, { method: "PUT", body }),
  remove: (id) => request(`/expenses/${id}`, { method: "DELETE" })
};
