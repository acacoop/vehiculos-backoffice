import {
  PublicClientApplication,
  type AccountInfo,
  EventType,
  type AuthenticationResult,
} from "@azure/msal-browser";

const CLIENT_ID = import.meta.env.VITE_ENTRA_CLIENT_ID as string | undefined;
const TENANT_ID = import.meta.env.VITE_ENTRA_TENANT_ID as string | undefined;
const REDIRECT_URI =
  (import.meta.env.VITE_ENTRA_REDIRECT_URI as string | undefined) ||
  window.location.origin;
const RAW_API_SCOPE = import.meta.env.VITE_API_SCOPE as string | undefined;

export const API_SCOPES: string[] = RAW_API_SCOPE
  ? RAW_API_SCOPE.split(/[ ,]+/).filter(Boolean)
  : ["User.Read"];

const authority = TENANT_ID
  ? `https://login.microsoftonline.com/${TENANT_ID}`
  : "https://login.microsoftonline.com/common";

if (!CLIENT_ID) {
  console.warn(
    "VITE_ENTRA_CLIENT_ID is not set. Authentication will not work until configured.",
  );
}
if (!TENANT_ID) {
  console.warn(
    "VITE_ENTRA_TENANT_ID is not set. Defaulting to 'common' authority; set the tenant ID for best security.",
  );
}
if (!RAW_API_SCOPE) {
  console.warn(
    "VITE_API_SCOPE is not set. Falling back to 'User.Read'. Define it to request your API scope.",
  );
}

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: CLIENT_ID || "",
    authority,
    redirectUri: REDIRECT_URI,
    postLogoutRedirectUri: REDIRECT_URI,
    navigateToLoginRequestUrl: false, // Prevent MSAL from navigating after login
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: true, // Help with popup/redirect state persistence
  },
  system: {
    allowRedirectInIframe: false, // Prevent iframe redirect issues
  },
});

let initialized = false;
let callbackRegistered = false;

export async function initMsal(): Promise<void> {
  if (!initialized) {
    await msalInstance.initialize();
    initialized = true;
  }

  // Process any redirect/popup hash - handles auth responses from redirects
  try {
    const response = await msalInstance.handleRedirectPromise();
    if (response?.account) {
      msalInstance.setActiveAccount(response.account);
    }
  } catch (error) {
    // Clean up stale auth hash if present
    console.error("Error handling redirect promise:", error);
    if (
      window.location.hash.includes("code=") ||
      window.location.hash.includes("error=")
    ) {
      window.history.replaceState(null, "", window.location.pathname || "/");
    }
  }

  if (!callbackRegistered) {
    // Keep active account in sync after successful interactions
    msalInstance.addEventCallback((event) => {
      if (
        event.eventType === EventType.LOGIN_SUCCESS ||
        event.eventType === EventType.SSO_SILENT_SUCCESS ||
        event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS
      ) {
        const payload = event.payload as AuthenticationResult | null;
        if (payload?.account) {
          msalInstance.setActiveAccount(payload.account);
        }
      }
    });
    callbackRegistered = true;
  }
}

export function getActiveAccount(): AccountInfo | null {
  const active = msalInstance.getActiveAccount();
  if (active) return active;
  const accounts = msalInstance.getAllAccounts();
  return accounts.length ? accounts[0] : null;
}

export async function ensureActiveAccount(): Promise<AccountInfo | null> {
  const account = getActiveAccount();
  if (account) return account;
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length) {
    msalInstance.setActiveAccount(accounts[0]);
    return accounts[0];
  }
  return null;
}

export async function getAccessToken(): Promise<string | undefined> {
  try {
    const account = await ensureActiveAccount();
    if (!account || API_SCOPES.length === 0) {
      window.location.href = "/login";
      return undefined;
    }
    const silentParams = {
      account,
      scopes: API_SCOPES,
    } as const;
    try {
      const result = await msalInstance.acquireTokenSilent(silentParams);
      return result.accessToken;
    } catch (e) {
      // Silent token failed - use popup
      console.warn("Silent token acquisition failed, using popup:", e);
      try {
        const result = await msalInstance.acquireTokenPopup({
          scopes: API_SCOPES,
          account,
        });
        return result.accessToken;
      } catch (popupError) {
        console.error("Popup failed, going to login:", popupError);
        window.location.href = "/login";
        return undefined;
      }
    }
  } catch (error) {
    console.error("Error crítico obteniendo token:", error);
    window.location.href = "/login";
    return undefined;
  }
}

export async function login(): Promise<void> {
  try {
    const res = await msalInstance.loginPopup({
      scopes: API_SCOPES,
      prompt: "select_account",
    });
    if (res.account) {
      msalInstance.setActiveAccount(res.account);
    }
  } catch (error) {
    console.error("Login popup failed:", error);
    throw error;
  }
}

export async function appLogout(): Promise<void> {
  const accounts = msalInstance.getAllAccounts();

  for (const acc of accounts) {
    await msalInstance.clearCache({ account: acc });
  }

  msalInstance.setActiveAccount(null);
}

export function isAuthenticated(): boolean {
  return !!getActiveAccount();
}
