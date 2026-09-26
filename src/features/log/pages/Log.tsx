import { useLocation, useNavigate } from "react-router-dom";
import { LogDataProvider, useLogData } from "../context/LogDataContext";

import LogHistoryPanel from "../components/LogHistoryPanel";
import LogInfo from "../components/LogInfo";
import MinimalFooter from "../../home/MinimalFooter";
import { LoadingScreen } from "../../../shared/components/LoadingScreen";

function LogPageContent() {
  const { isRetrievingData, tag, viewMode } = useLogData();

  if (isRetrievingData) {
    return <LoadingScreen text={"Retrieving Data..."} />;
  }

  return (
    <div className="relative overflow-hidden bg-slate-950 min-h-screen flex flex-col">
      {/* <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_rgba(28,51,182,0.3)_0%,_rgba(28,51,182,0)_5%)] pointer-events-none z-10" /> */}
      {/* Decorative ambient glow */}
        <div className="absolute -top-24 -right-16 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-32 -left-20 w-56 h-56 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
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

  return (
    <div>
      <LogDataProvider token={token} onNotFound={() => navigate("/404")}>
        <LogPageContent />
      </LogDataProvider>
    </div>
  );
}
