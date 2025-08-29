import {
  PublicClientApplication,
  type AccountInfo,
  InteractionRequiredAuthError,
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
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
});

let initialized = false;
let callbackRegistered = false;

export async function initMsal(): Promise<void> {
  if (!initialized) {
    await msalInstance.initialize();
    initialized = true;
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
  // Process any redirect hash if present
  await msalInstance.handleRedirectPromise();
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
    if (!account || API_SCOPES.length === 0) return undefined;
    const silentParams = {
      account,
      scopes: API_SCOPES,
    } as const;
    try {
      const result = await msalInstance.acquireTokenSilent(silentParams);
      return result.accessToken;
    } catch (e) {
      if (e instanceof InteractionRequiredAuthError) {
        // Prefer popup to match desired UX, fallback to redirect in case of blockers
        try {
          const result = await msalInstance.acquireTokenPopup({
            scopes: API_SCOPES,
          });
          return result.accessToken;
        } catch {
          await msalInstance.loginRedirect({
            scopes: API_SCOPES,
            prompt: "select_account",
          });
          return undefined;
        }
      }
      throw e;
    }
  } catch {
    // As a last resort, redirect to login
    await msalInstance.loginRedirect({
      scopes: API_SCOPES,
      prompt: "select_account",
    });
    return undefined;
  }
}

export async function login(): Promise<void> {
  try {
    const res = await msalInstance.loginPopup({
      scopes: API_SCOPES,
      prompt: "select_account",
    });
    if (res.account) msalInstance.setActiveAccount(res.account);
  } catch {
    await msalInstance.loginRedirect({
      scopes: API_SCOPES,
      prompt: "select_account",
    });
  }
}

export async function appLogout(): Promise<void> {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) {
    msalInstance.setActiveAccount(null);
    return;
  }
  for (const acc of accounts) {
    await msalInstance.clearCache({ account: acc });
  }
  msalInstance.setActiveAccount(null);
}

export function isAuthenticated(): boolean {
  return !!getActiveAccount();
}
