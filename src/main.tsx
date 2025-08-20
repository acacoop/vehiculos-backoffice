import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance, initMsal } from "./common/auth";

(async () => {
  await initMsal();
  createRoot(document.getElementById("root")!).render(
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>,
  );
})();
