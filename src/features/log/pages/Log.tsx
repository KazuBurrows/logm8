import { useLocation, useNavigate } from "react-router-dom";
import { LogDataProvider, useLogData } from "../context/LogDataContext";

import LogHistory from "../components/LogHistory";
import LogInfo from "../components/LogInfo";
import { LoadingScreen } from "../../../shared/components/LoadingScreen";

function LogPageContent() {
  const { isRetrievingData, tag, viewMode } = useLogData();

  if (isRetrievingData) {
    return <LoadingScreen text={"Retrieving Data..."} />;
  }

  return (
    <div className="relative overflow-hidden bg-slate-950">
      <LogInfo tag={tag}></LogInfo>
      <LogHistory viewMode={viewMode}></LogHistory>
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
