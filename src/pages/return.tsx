//src/pages/return.tsx
import React from "react";
import { useRouter } from "next/router";
import {
  getSessionVerifier,
  getStitchAccessToken,
  setStitchAccessToken,
} from "../integrations/stitch/storage/session-storage";
import { NextPage } from "next";
import { useQuery } from "react-query";
import { retrieveTokenUsingAuthorizationCode } from "../integrations/stitch/auth/fetch-token";

const ReturnPage: NextPage = () => {
  const router = useRouter();
  //stitch appends this query param to the redirect url, we will need to use this to get the user token
  const { code } = router.query;
  //this is the verifier which we stored in the session storage when we redirected the user to stitch
  const verifier = getSessionVerifier();

  const { isLoading, error, data } = useQuery(
    "stitch-token",
    async () => {
      try {
        if (!code || !verifier) {
          throw new Error("Missing query string params");
        }
        const result = await retrieveTokenUsingAuthorizationCode(
          `${code}`,
          verifier
        );

        if (!result || "error" in result) {
          throw new Error(`Failed to fetch token with error ${result?.error}`);
        }
        const token = getStitchAccessToken();
        //we check if token was correctly stored
        if (!token) {
          throw new Error("The token was not stored correctly");
        }
        // we set the token in the session storage so that we can use it later
        await router.push("/dashboard");
      } catch (e) {
        console.error(e);
        return { error: e as Error };
      }
    },
    {
      //this query may run before the code query string param is read in, so we only run the query if the code is not null
      enabled: !!code,
    }
  );
  const errorMessage = () => {
    if (error && error instanceof Error) {
      return error.message;
    }
    return "Something went wrong";
  };

  const body = () => {
    if (isLoading) {
      return <p>Loading...</p>;
    }
    if (error) {
      return <p>{errorMessage()}</p>;
    }
    return <p>Something went wrong!</p>;
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      {body()}
    </div>
  );
};

export default ReturnPage;
