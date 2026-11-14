import { useCallback } from "react";
import { useApi } from "../../../api/useApi";
import { oneLifeTokenHeaders } from "../../../api/oneLifeToken";
import { getCached, setCached, CACHE_TTL_MS } from "../../../shared/utils/sessionCache";

export function useLog() {
  const { loading, error, get } = useApi();

  // With lastUpdated, the server only returns records with LastModified >= lastUpdated;
  // records are cached per tag by LogDataProvider (see logCache.ts), not here.
  const getLogData = useCallback(
    async (token: string, lastUpdated?: string): Promise<any> => {
      const since = lastUpdated ? `&lastUpdated=${encodeURIComponent(lastUpdated)}` : "";
      // The token stays in the query too, for API versions that read it from there.
      return get<any>(`GetLogData?token=${encodeURIComponent(token)}${since}`, oneLifeTokenHeaders(token));
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
