import { useLocation, useNavigate } from "react-router-dom";
import { LogDataProvider, useLogData } from "../context/LogDataContext";

import LogHistoryPanel from "../components/LogHistoryPanel";
import LogInfo from "../components/LogInfo";
import MinimalFooter from "../../home/MinimalFooter";
import { LoadingScreen } from "../../../shared/components/LoadingScreen";
import { AmbientGlow } from "../../../shared/components/AmbientGlow";

function LogPageContent() {
  const { isRetrievingData, tag, viewMode } = useLogData();

  if (isRetrievingData) {
    return <LoadingScreen text={"Retrieving Data..."} />;
  }

  return (
    <div className="relative overflow-hidden bg-canvas text-fg min-h-screen flex flex-col">
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

  return (
    <div>
      <LogDataProvider token={token} onNotFound={() => navigate("/404")}>
        <LogPageContent />
      </LogDataProvider>
    </div>
  );
}
