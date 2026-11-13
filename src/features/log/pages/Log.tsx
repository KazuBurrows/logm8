import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogDataProvider, useLogData, UserMode } from "../context/LogDataContext";

import LogHistoryPanel from "../components/LogHistoryPanel";
import LogInfo from "../components/LogInfo";
import { LogSkeleton } from "../components/LogSkeleton";
import MinimalFooter from "../../home/MinimalFooter";
import { AmbientGlow } from "../../../shared/components/AmbientGlow";

function LogPageContent() {
  const { isRetrievingData, tag, viewMode } = useLogData();

  if (isRetrievingData) {
    return <LogSkeleton />;
  }

  return (
    <div
      className={`relative bg-canvas text-fg min-h-screen flex flex-col ${
        // Room below the footer so the floating add button never covers it or the last record.
        viewMode === UserMode[0] ? "pb-[calc(5.5rem+env(safe-area-inset-bottom))]" : "pb-[env(safe-area-inset-bottom)]"
      }`}
    >
      <AmbientGlow />
      <LogInfo tag={tag} viewMode={viewMode}></LogInfo>
      <div className="flex-1">
        <LogHistoryPanel></LogHistoryPanel>
      </div>
      <MinimalFooter />
    </div>
  );
}

export default function Log() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token") ?? ""; // Extract the 'token' value
  const navigate = useNavigate();

  // Dark page background (also set before the bundle by public/theme-boot.js),
  // so overscroll and the gaps between loading states never show white.
  useEffect(() => {
    document.documentElement.classList.add("bg-canvas");
    return () => document.documentElement.classList.remove("bg-canvas");
  }, []);

  return (
    <div>
      <LogDataProvider token={token} onNotFound={() => navigate("/404")}>
        <LogPageContent />
      </LogDataProvider>
    </div>
  );
}
