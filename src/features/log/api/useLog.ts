import { useCallback } from "react";
import { useApi } from "../../../api/useApi";
import { getCached, setCached } from "../../../shared/utils/sessionCache";

const CACHE_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

export function useLog() {
  const { loading, error, get } = useApi();

  const getLogData = useCallback(
    async (token: string): Promise<any> => {
      const cacheKey = `logData:${token}`;
      const cached = getCached<any>(cacheKey);
      if (cached) return cached;

      const data = await get<any>(`GetLogData?token=${token}`, { Authorization: token, "X-Tag-Id": token });
      setCached(cacheKey, data, CACHE_TTL_MS);
      setCached(`logHistory:${token}`, data.records ?? [], CACHE_TTL_MS);
      return data;
    },
    [get]
  );

  const getServiceRecordHierarchy = useCallback(
    async (): Promise<any> => {
      const cacheKey = "serviceRecordHierarchy";
      const cached = getCached<any>(cacheKey);
      if (cached) return cached;

      const data = await get("GetServiceOptionHierarchy");
      setCached(cacheKey, data, CACHE_TTL_MS);
      return data;
    },
    [get]
  );

  // A thrown ApiError means failure; on success the envelope's payload
  // (a plain message, or an object carrying one) is normalized to a string.
  const submitTag = useCallback(
    async (jsonData: string, tagId: string): Promise<string | undefined> => {
      const result = await get<any>(`SubmitTag?tag=${jsonData}`, { Authorization: tagId, "X-Tag-Id": tagId });
      return typeof result === "string" ? result : result?.message;
    },
    [get]
  );

  const getRedirectUrl = useCallback(
    async (eId: string): Promise<string | undefined> => {
      const reqString = JSON.stringify({ eId });
      const result = await get<any>(`OneLifeUrlOneStepNoDecrypt?reqString=${reqString}`);
      return typeof result === "string" ? result : result?.url;
    },
    [get]
  );

  return { loading, error, getLogData, getServiceRecordHierarchy, submitTag, getRedirectUrl };

}
