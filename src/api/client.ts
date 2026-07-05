import { dispatchToast } from "../shared/components/Toast/toastService";

const BASE_URL = process.env.REACT_APP_API_BASE_URL ?? "";
const FUNCTION_KEY = process.env.REACT_APP_API_KEY ?? "";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function buildHeaders(body?: BodyInit | null): HeadersInit {
  const headers: Record<string, string> = {};
  if (FUNCTION_KEY) headers["x-functions-key"] = FUNCTION_KEY;
  if (!(body instanceof FormData)) headers["Content-Type"] = "application/json";
  return headers;
}

interface FailureEnvelope {
  success: false;
  message?: string;
}

function isFailureEnvelope(data: unknown): data is FailureEnvelope {
  return typeof data === "object" && data !== null && (data as Record<string, unknown>).success === false;
}

function extractMessage(rawText: string, fallback: string): string {
  try {
    const parsed = JSON.parse(rawText);
    if (parsed && typeof parsed === "object" && typeof parsed.message === "string") {
      return parsed.message;
    }
  } catch {
    // not JSON, fall through to raw text
  }
  return rawText || fallback;
}

function notifyError(err: unknown): void {
  if (err instanceof ApiError && err.status === 404) return;
  const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
  dispatchToast(message, "error");
}

async function doFetch(path: string, init?: RequestInit): Promise<Response> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { ...buildHeaders(init?.body), ...init?.headers },
    });

    if (!res.ok) {
      const rawText = await res.text().catch(() => res.statusText);
      throw new ApiError(res.status, extractMessage(rawText, res.statusText));
    }

    return res;
  } catch (err) {
    notifyError(err);
    throw err;
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await doFetch(path, init);

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return undefined as T;
  }

  if (isFailureEnvelope(data)) {
    const err = new ApiError(res.status, data.message || "Request failed");
    notifyError(err);
    throw err;
  }

  return data as T;
}

async function apiFetchText(path: string, init?: RequestInit): Promise<string> {
  const res = await doFetch(path, init);
  return res.text();
}

export const apiClient = {
  get: <T>(path: string, headers?: Record<string, string>) => apiFetch<T>(path, { headers }),
  post: <T>(path: string, body: unknown, headers?: Record<string, string>) =>
    apiFetch<T>(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    }),
  postText: (path: string, body: unknown, headers?: Record<string, string>) =>
    apiFetchText(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    }),
};
