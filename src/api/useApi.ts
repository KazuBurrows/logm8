import { useCallback, useState } from "react";
import { apiClient } from "./client";

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const get = useCallback(async <T>(path: string): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient.get<T>(path);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const post = useCallback(async <T>(path: string, body: unknown): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient.post<T>(path, body);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, get, post };
}
