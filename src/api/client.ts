import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { dispatchToast } from "../shared/components/Toast/toastService";

const BASE_URL = process.env.REACT_APP_API_BASE_URL ?? "";
const FUNCTION_KEY = process.env.REACT_APP_API_KEY ?? "";

export class ApiError extends Error {
  status: number;
  title?: string;
  conflictingIds?: number[];

  constructor(status: number, message: string, title?: string, conflictingIds?: number[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.title = title;
    this.conflictingIds = conflictingIds;
  }
}

/**
 * Every response now comes wrapped by ApiResponseFactory as
 * { title, status, detail, extensions }. The Functions worker's JSON
 * serializer casing isn't guaranteed, so reads check both casings; the
 * "item"/"id"/"ids" extension keys are literal Dictionary<string,object>
 * keys server-side and are always lowercase.
 */
function field<T>(body: unknown, name: string): T | undefined {
  if (!body || typeof body !== "object") return undefined;
  const pascal = name[0].toUpperCase() + name.slice(1);
  const record = body as Record<string, unknown>;
  return (record[name] ?? record[pascal]) as T | undefined;
}

function isEnvelope(body: unknown): boolean {
  return field(body, "detail") !== undefined || field(body, "extensions") !== undefined;
}

function unwrapPayload(body: unknown): unknown {
  if (!isEnvelope(body)) return body;

  const extensions = field<Record<string, unknown>>(body, "extensions");
  if (extensions) {
    if ("item" in extensions) return extensions.item;
    if ("id" in extensions) return extensions.id;
    if (Object.keys(extensions).length > 0) return extensions;
  }
  return field<string>(body, "detail");
}

function extractApiError(err: AxiosError): ApiError {
  const body = err.response?.data;
  const status = err.response?.status ?? 0;
  const detail = field<string>(body, "detail");
  const title = field<string>(body, "title");
  const extensions = field<Record<string, unknown>>(body, "extensions");
  const conflictingIds = status === 409 ? (extensions?.ids as number[] | undefined) : undefined;

  return new ApiError(
    status,
    detail || title || err.message || "Something went wrong. Please try again.",
    title,
    conflictingIds
  );
}

function notifyError(err: unknown): void {
  if (err instanceof ApiError && err.status === 404) return;
  const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
  dispatchToast(message, "error");
}

const http: AxiosInstance = axios.create({ baseURL: BASE_URL });

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const isFormData = config.data instanceof FormData;

  try {
    const res = await http.request({
      ...config,
      headers: {
        ...(FUNCTION_KEY ? { "x-functions-key": FUNCTION_KEY } : {}),
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...config.headers,
      },
    });
    return unwrapPayload(res.data) as T;
  } catch (err) {
    const apiErr = axios.isAxiosError(err)
      ? extractApiError(err)
      : err instanceof Error
      ? err
      : new Error(String(err));
    notifyError(apiErr);
    throw apiErr;
  }
}

export const apiClient = {
  get: <T>(path: string, headers?: Record<string, string>) =>
    request<T>({ method: "GET", url: path, headers }),
  post: <T>(path: string, body: unknown, headers?: Record<string, string>) =>
    request<T>({ method: "POST", url: path, data: body, headers }),
  postText: (path: string, body: unknown, headers?: Record<string, string>) =>
    request<string>({ method: "POST", url: path, data: body, headers }),
};
