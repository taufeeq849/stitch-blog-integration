//src/pages/api/stitch/generate-private-key-jwt.ts

import { randomBytes } from "crypto";
import { readFileSync } from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import { sign, SignOptions } from "jsonwebtoken";

function getKeyId(cert: string) {
  // Get the key ID from the certificate
  const lines = cert.split("\n").filter((x) => x.includes("localKeyID:"))[0];
  if (!lines) {
    throw new Error("No localKeyID found in certificate");
  }
  return lines.replace("localKeyID:", "").replace(/\W/g, "");
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    console.log(req.body);

    // we will pass the client id in through the body of the request
    const { clientId } = JSON.parse(req.body);
    if (!clientId) throw new Error("ClientId is required");

    const pemCert = readFileSync(
      "./src/integrations/stitch/certificates/certificate.pem"
    ).toString("utf-8");

    const issuer = clientId;
    const subject = clientId;
    const audience = "https://secure.stitch.money/connect/token";
    const keyid = getKeyId(pemCert);
    const jwtid = randomBytes(16).toString("hex");

    const options: SignOptions = {
      keyid,
      jwtid,
      notBefore: "0",
      issuer,
      subject,
      audience,
      expiresIn: "5m", // For this example this value is set to 5 minutes, but for machine usage should generally be a lot shorter
      algorithm: "RS256",
    };

    const token = sign({}, pemCert, options);
    console.log(token);
    return res.status(200).json({
      token: token,
    });
  } catch (e: Error | any) {
    console.error(e);
    return res.status(500).json({
      error: e.message,
    });
  }
};
