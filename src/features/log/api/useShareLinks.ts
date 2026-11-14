import { useCallback } from "react";
import { useApi } from "../../../api/useApi";
import { oneLifeTokenHeaders } from "../../../api/oneLifeToken";
import { ShareLink, ShareLinkDays } from "../utils/shareLinks";

/**
 * Read-only share links for the log the service link `token` opens. The API only lets a
 * service link create, list or revoke them; a thrown ApiError means failure (the client has
 * already shown it, e.g. the 409 at the 5-link limit).
 */
export function useShareLinks(token: string) {
  const { get, post } = useApi();

  const listShareLinks = useCallback(async (): Promise<ShareLink[]> => {
    const result = await get<ShareLink[]>("GetShareLinks", oneLifeTokenHeaders(token));
    return Array.isArray(result) ? result : [];
  }, [get, token]);

  const createShareLink = useCallback(
    (days: ShareLinkDays) => post<ShareLink>("CreateShareLink", { days }, oneLifeTokenHeaders(token)),
    [post, token]
  );

  const revokeShareLink = useCallback(
    async (linkToken: string): Promise<void> => {
      await post("RevokeShareLink", { token: linkToken }, oneLifeTokenHeaders(token));
    },
    [post, token]
  );

  return { listShareLinks, createShareLink, revokeShareLink };
}
