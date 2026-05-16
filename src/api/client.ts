const BASE_URL = process.env.REACT_APP_API_BASE_URL ?? "";
const FUNCTION_KEY = process.env.REACT_APP_API_KEY ?? "";

function buildHeaders(body?: BodyInit | null): HeadersInit {
  const headers: Record<string, string> = {};
  if (FUNCTION_KEY) headers["x-functions-key"] = FUNCTION_KEY;
  if (!(body instanceof FormData)) headers["Content-Type"] = "application/json";
  return headers;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { ...buildHeaders(init?.body), ...init?.headers },
  });

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${message}`);
  }

  return res.json() as Promise<T>;
}

async function apiFetchText(path: string, init?: RequestInit): Promise<string> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { ...buildHeaders(init?.body), ...init?.headers },
  });

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${message}`);
  }

  return res.text();
}

export const apiClient = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  postText: (path: string, body: unknown) =>
    apiFetchText(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
};
