//src/integrations/stitch/auth/fetch-token.ts
import { getUrlEncodedFormData } from "../../../utils/authorization-utils";
import { StitchConfiguration } from "../config";
import {
  GeneratePrivateKeyJWTResponse,
  StitchAccessTokenResponse,
} from "../lib/types";
import {
  getClientIdForSession,
  setRefreshToken,
  setStitchAccessToken,
} from "../storage/session-storage";

async function generatePrivateKeyJwt(clientId: string) {
  const body = {
    clientId: clientId,
  };
  const result = await fetch("/api/stitch/generate-private-key-jwt", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const json = (await result.json()) as GeneratePrivateKeyJWTResponse;

  if ("error" in json) {
    throw new Error(json.error);
  }
  return json.token;
}

export async function retrieveTokenUsingAuthorizationCode(
  authorizationCode: string,
  codeVerifier: string
): Promise<StitchAccessTokenResponse | undefined> {
  try {
    const { redirectUri, identityServerUri } = StitchConfiguration;

    const clientId = getClientIdForSession();

    if (clientId === null) {
      throw new Error(
        "ClientId was not found in storage. It needs to be set before the authorization redirect. This allows us to determine whether the real or test client was used."
      );
    }
    const clientAssertionToken = await generatePrivateKeyJwt(clientId);
    const body = {
      grant_type: "authorization_code",
      client_id: clientId,
      code: authorizationCode,
      redirect_uri: redirectUri!,
      code_verifier: codeVerifier,
      client_assertion_type:
        "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
      client_assertion: clientAssertionToken.trim(),
    };
    const bodyString = getUrlEncodedFormData(body);

    const response = await fetch(`${identityServerUri}/connect/token`, {
      method: "post",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: bodyString,
    });

    const tokenResponse = (await response.json()) as StitchAccessTokenResponse;
    console.log("tokenResponse", tokenResponse);
    if (response.status != 200 || "error" in tokenResponse) {
      if ("error" in tokenResponse) {
        throw new Error(tokenResponse.error);
      }

      throw new Error("Failed to fetch token with unknown error");
    }
    //we add the token expiry date to now to get the date where the token will expire
    const now = new Date().toISOString();
    const expiryDate = new Date(now).setSeconds(
      new Date(now).getSeconds() + tokenResponse.expires_in
    );
    //set the token in the session storage
    setStitchAccessToken(tokenResponse.access_token, expiryDate);
    setRefreshToken(tokenResponse.refresh_token);

    return tokenResponse;
  } catch (e) {
    console.error(e);
    throw e;
  }
}
