// Тонкий клиент для нашего API. Сессия живёт в httpOnly-cookie,
// поэтому достаточно credentials: "include".

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = "GET", body } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (response.status === 204) return null;

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(
      data?.error || `Ошибка запроса (${response.status})`,
      response.status,
      data?.details,
    );
  }
  return data;
}

export const api = {
  auth: {
    register: (email, password) =>
      request("/auth/register", { method: "POST", body: { email, password } }),
    login: (email, password) =>
      request("/auth/login", { method: "POST", body: { email, password } }),
    logout: () => request("/auth/logout", { method: "POST" }),
    me: () => request("/auth/me").then((data) => data.user),
  },
  tasks: {
    list: () => request("/tasks"),
    create: (task) => request("/tasks", { method: "POST", body: task }),
    update: (id, task) =>
      request(`/tasks/${id}`, { method: "PATCH", body: task }),
    remove: (id) => request(`/tasks/${id}`, { method: "DELETE" }),
  },
  categories: {
    list: () => request("/categories"),
    create: (category) =>
      request("/categories", { method: "POST", body: category }),
    update: (id, category) =>
      request(`/categories/${id}`, { method: "PATCH", body: category }),
    remove: (id) => request(`/categories/${id}`, { method: "DELETE" }),
  },
  tags: {
    list: () => request("/tags"),
    create: (tag) => request("/tags", { method: "POST", body: tag }),
    update: (id, tag) => request(`/tags/${id}`, { method: "PATCH", body: tag }),
    remove: (id) => request(`/tags/${id}`, { method: "DELETE" }),
  },
};

export default api;
