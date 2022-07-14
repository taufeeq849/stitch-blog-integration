//src/pages/index.tsx

import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { getStitchAuthorizationCodeUrl } from "../integrations/stitch/auth/authorize-user";
import { StitchConfiguration } from "../integrations/stitch/config";
import { setAuthSessionVariables } from "../integrations/stitch/storage/session-storage";

const Home: NextPage = () => {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);

  const redirectUserToStitch = async () => {
    try {
      const result = await getStitchAuthorizationCodeUrl();
      setAuthSessionVariables(
        StitchConfiguration.clientId!,
        result.nonce,
        result.verifier
      );
      await router.push(result.url);
    } catch (e: Error | any) {
      setError(e.message ?? "Unknown error");
    }
  };
  return (
    <>
      <Head>
        <title>Query Bank Data</title>
      </Head>
      <div className="w-screen h-screen flex flex-col justify-center items-center p-4">
        <h1 className="text-xl font-bold pb-2">Stitch Integration</h1>
        <button
          onClick={redirectUserToStitch}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Grant Access
        </button>
        {error && <p className="text-red-500 pt-2">{error}</p>}
      </div>
    </>
  );
};

export default Home;
