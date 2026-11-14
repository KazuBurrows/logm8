import React, { useCallback, useEffect, useState } from "react";
import { BottomSheet } from "../../../shared/components/BottomSheet";
import { dispatchToast } from "../../../shared/components/Toast/toastService";
import { useShareLinks } from "../api/useShareLinks";
import {
  activeShareLinkCount,
  DEFAULT_SHARE_LINK_DAYS,
  formatLinkExpiry,
  isGuestScan,
  MAX_SHARE_LINKS,
  SHARE_LINK_DAYS,
  ShareLink,
  ShareLinkDays,
} from "../utils/shareLinks";

export interface ShareLinksSheetProps {
  isOpen: boolean;
  /** Should be stable (e.g. useCallback), it is an effect dependency. */
  onClose: () => void;
  /** The service link's token; only a service link can manage share links. */
  token: string;
}

const segment = (active: boolean) =>
  `flex min-h-11 items-center justify-center rounded-full px-3 text-base transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-accent ${
    active ? "bg-accent text-accent-fg" : "text-fg-soft"
  }`;
const smallButton =
  "min-h-11 px-4 rounded-full bg-raised border border-line text-fg text-sm disabled:opacity-50";

async function copyLink(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    dispatchToast("Link copied.", "success");
  } catch {
    dispatchToast("Couldn't copy the link. Press and hold it to copy instead.", "error");
  }
}

/** Create, copy and revoke read-only links to this vehicle's log. */
export function ShareLinksSheet({ isOpen, onClose, token }: ShareLinksSheetProps) {
  const { listShareLinks, createShareLink, revokeShareLink } = useShareLinks(token);

  const [links, setLinks] = useState<ShareLink[] | null>(null);
  const [days, setDays] = useState<ShareLinkDays>(DEFAULT_SHARE_LINK_DAYS);
  const [created, setCreated] = useState<ShareLink | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setLinks(await listShareLinks());
    } catch {
      setLinks([]);
    }
  }, [listShareLinks]);

  useEffect(() => {
    if (!isOpen) return;
    setCreated(null);
    setLinks(null);
    load();
  }, [isOpen, load]);

  const atLimit = activeShareLinkCount(links ?? []) >= MAX_SHARE_LINKS;

  const create = async () => {
    setBusy(true);
    try {
      const link = await createShareLink(days);
      setCreated(link);
      setLinks((prev) =>
        [...(prev ?? []), link].sort((a, b) => Date.parse(a.expiresAt) - Date.parse(b.expiresAt))
      );
    } catch {
      // Shown by the API client (e.g. the limit of 5 active links).
      await load();
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (link: ShareLink) => {
    setBusy(true);
    try {
      await revokeShareLink(link.token);
      dispatchToast("Link revoked.", "success");
    } catch {
      // Shown by the API client; a 404 means it had already gone.
    } finally {
      setLinks((prev) => (prev ?? []).filter((l) => l.token !== link.token));
      if (created?.token === link.token) setCreated(null);
      setBusy(false);
    }
  };

  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Share read-only link">
      <div className="flex flex-col gap-6 px-2 pt-1 pb-2">
        <p className="text-sm text-fg-soft">
          Anyone with the link can view this vehicle's log, including receipts, but can't change
          anything. You can revoke it at any time.
        </p>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-semibold text-fg-soft mb-2">Link lasts</legend>
          <div className="grid grid-cols-3 gap-1 p-1 rounded-full bg-raised">
            {SHARE_LINK_DAYS.map((d) => (
              <label key={d} className="cursor-pointer">
                <input
                  type="radio"
                  name="share-link-days"
                  className="peer sr-only"
                  checked={days === d}
                  onChange={() => setDays(d)}
                />
                <span className={segment(days === d)}>{d === 1 ? "1 day" : `${d} days`}</span>
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={create}
            disabled={busy || links === null || atLimit}
            className="h-12 rounded-full bg-accent text-accent-fg text-base font-medium disabled:opacity-60"
          >
            Create link
          </button>
          {atLimit && (
            <p className="text-sm text-fg-muted">
              This vehicle has {MAX_SHARE_LINKS} active links. Revoke one to make another.
            </p>
          )}
        </fieldset>

        {created && (
          <section aria-label="New link" className="flex flex-col gap-2 rounded-card bg-surface border border-line p-3">
            <label className="text-sm text-fg-muted" htmlFor="new-share-link">
              New link, expires {formatLinkExpiry(created.expiresAt)}
            </label>
            <input
              id="new-share-link"
              readOnly
              value={created.url}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full min-h-11 rounded-card bg-raised px-3 text-sm text-fg outline-none"
            />
            <div className="flex gap-2">
              <button type="button" className={smallButton} onClick={() => copyLink(created.url)}>
                Copy
              </button>
              {canShare && (
                <button
                  type="button"
                  className={smallButton}
                  onClick={() => navigator.share({ title: "Vehicle service log", url: created.url }).catch(() => {})}
                >
                  Share
                </button>
              )}
            </div>
          </section>
        )}

        <section aria-labelledby="active-links-heading" className="flex flex-col gap-2">
          <h4 id="active-links-heading" className="text-sm font-semibold text-fg-soft">
            Active links
          </h4>
          {links === null ? (
            <p className="text-sm text-fg-muted">Loading…</p>
          ) : links.length === 0 ? (
            <p className="text-sm text-fg-muted">No active links.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {links.map((link) => {
                const scan = isGuestScan(link);
                return (
                  <li
                    key={link.token}
                    className="flex items-center justify-between gap-2 rounded-card bg-surface border border-line px-3 py-2"
                  >
                    <span className="min-w-0 text-sm">
                      <span className="block text-fg">{scan ? "Guest scan" : "Read-only link"}</span>
                      <span className="block text-fg-muted">
                        {scan ? "Ends" : "Expires"} {formatLinkExpiry(link.expiresAt)}
                      </span>
                    </span>
                    <span className="flex shrink-0 gap-2">
                      {!scan && (
                        <button type="button" className={smallButton} onClick={() => copyLink(link.url)}>
                          Copy
                        </button>
                      )}
                      <button
                        type="button"
                        className={smallButton}
                        disabled={busy}
                        onClick={() => revoke(link)}
                        aria-label={`Revoke ${scan ? "guest scan" : "read-only link"} expiring ${formatLinkExpiry(link.expiresAt)}`}
                      >
                        Revoke
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </BottomSheet>
  );
}
