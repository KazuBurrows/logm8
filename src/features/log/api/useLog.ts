import { useCallback } from "react";
import { useApi } from "../../../api/useApi";

export function useLog() {
  const { loading, error, get } = useApi();

  const getLogData = useCallback(
    async (token: string): Promise<any> => {
      return await get(`GetLogData?token=${token}`, { Authorization: token, "X-Tag-Id": token });
    },
    [get]
  );

  const getServiceRecordHierarchy = useCallback(
    async (): Promise<any> => {
      return await get("GetServiceRecordHierarchy");
    },
    [get]
  );

  const submitTag = useCallback(
    async (jsonData: string, tagId: string): Promise<{ success: boolean; message?: string }> => {
      return await get(`SubmitTag?tag=${jsonData}`, { Authorization: tagId, "X-Tag-Id": tagId });
    },
    [get]
  );

  const getRedirectUrl = useCallback(
    async (eId: string): Promise<{ success: boolean; url?: string }> => {
      const reqString = JSON.stringify({ eId });
      return await get(`OneLifeUrlOneStepNoDecrypt?reqString=${reqString}`);
    },
    [get]
  );

  return { loading, error, getLogData, getServiceRecordHierarchy, submitTag, getRedirectUrl };

}
