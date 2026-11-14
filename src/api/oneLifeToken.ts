/**
 * The header the API reads a log link's token from (its OneLifeTokenMiddleware). Send it on
 * every call made on behalf of a `/log?token=…` (or `/tag/create?token=…`) link.
 */
export const ONE_LIFE_TOKEN_HEADER = "X-OneLife-Token";

export function oneLifeTokenHeaders(token: string | null | undefined): Record<string, string> {
  return token ? { [ONE_LIFE_TOKEN_HEADER]: token } : {};
}
