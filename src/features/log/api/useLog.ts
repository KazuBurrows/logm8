import { useCallback } from "react";
import { useApi } from "../../../api/useApi";
import { oneLifeTokenHeaders } from "../../../api/oneLifeToken";
import { UpdateAssetNfcTagRequest } from "../../../shared/types/global";
import { getCached, setCached, CACHE_TTL_MS } from "../../../shared/utils/sessionCache";

export function useLog() {
  const { loading, error, get, post } = useApi();

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

  // Sets up a new sticker with the setup link's token (from /tag/create?token=...). Resolves to
  // the new log's URL (the same token, now opening the log); a thrown ApiError means failure.
  const configureTag = useCallback(
    async (token: string, details: UpdateAssetNfcTagRequest): Promise<string | undefined> => {
      const result = await post<any>("ConfigureTag", details, oneLifeTokenHeaders(token));
      return typeof result === "string" ? undefined : result?.url;
    },
    [post]
  );

  return { loading, error, getLogData, getServiceRecordHierarchy, configureTag };

}
