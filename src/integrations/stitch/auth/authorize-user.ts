//src/integrations/stitch/auth/authorize-user.ts

import {
  generateRandomStateOrNonce,
  generateVerifierChallengePair,
  getUrlEncodedFormData,
} from "../../../utils/authorization-utils";
import { StitchConfiguration } from "../config";
import { StitchAuthorizationUrlParameters } from "../lib/types";

const stitchScopes: string[] = [
  "accountholders",
  "balances",
  "transactions",
  "accounts",
  "offline_access",
  "openid",
];

async function buildAuthorizationUrl(
  clientId: string
): Promise<{ url: string; nonce: string; verifier: string }> {
  const state = generateRandomStateOrNonce();
  const nonce = generateRandomStateOrNonce();
  const [verifier, challenge] = await generateVerifierChallengePair();
  const { redirectUri, identityServerUri } = StitchConfiguration;

  const search: StitchAuthorizationUrlParameters = {
    client_id: clientId,
    code_challenge: challenge!,
    code_challenge_method: "S256",
    redirect_uri: redirectUri!,
    scope: stitchScopes.join(" "),
    response_type: "code",
    nonce: nonce,
    state: state,
  };

  const searchString = getUrlEncodedFormData(search);

  if (!verifier) throw new Error("Verifier is undefined");

  const url = `${identityServerUri}/connect/authorize?${searchString}`;
  return {
    url,
    verifier,
    nonce,
  };
}

export async function getStitchAuthorizationCodeUrl() {
  const clientId = StitchConfiguration.clientId!;

  if (!clientId)
    throw new Error(
      "Client ID is undefined. It likely has not been set as an environment variable."
    );

  return buildAuthorizationUrl(clientId);
}
