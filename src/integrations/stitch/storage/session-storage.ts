//src/integrations/stitch/storage/session-storage.ts
export function setSessionNonce(nonce: string) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("stitchNonce", nonce);
  }
}
export function getSessionNonce(): string | null {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("stitchNonce");
  }
  return null;
}

export function setSessionVerifier(verifier: string) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("stitchVerifier", verifier);
  }
}

export function getSessionVerifier(): string | null {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("stitchVerifier");
  }
  return null;
}

//whenever we store an access token, we will also store when the token expires
export function setStitchAccessToken(token: string, expiryDate: number) {
  setItem("stitchToken", token);
  setItem("stitchTokenExpiry", expiryDate);
}

export function getStitchAccessToken(): {
  token: string | null;
  tokenExpiryTimestamp: string | null;
} {
  return {
    token: getItem("stitchToken"),
    tokenExpiryTimestamp: getItem("stitchTokenExpiry"),
  };
}

export function setRefreshToken(token: string) {
  setItem("stitchRefreshToken", token);
}

export function getRefreshToken(): string | null {
  return getItem("stitchRefreshToken");
}

export function setClientIdForSession(clientId: string) {
  setItem("clientId", clientId);
}
export function getClientIdForSession() {
  return getItem("clientId");
}

function setItem(key: string, value: any) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, value);
  }
}

function getItem(key: string): string | null {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem(key);
  }

  return null;
}

export function setAuthSessionVariables(
  clientId: string,
  nonce?: string,
  verifier?: string
) {
  setSessionNonce(nonce ?? "");
  setSessionVerifier(verifier ?? "");
  setClientIdForSession(clientId);
}
