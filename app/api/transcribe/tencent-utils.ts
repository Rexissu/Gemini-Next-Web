import { NextResponse } from 'next/server';

const getHash = (message: string, encoding: 'hex' = 'hex') => {
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256');
  return hash.update(message).digest(encoding);
};

const sha256 = (message: string, secret: string = '', encoding?: 'hex') => {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  return hmac.update(message).digest(encoding);
};

interface TencentAPIParams {
  endpoint: string;
  service: string;
  action: string;
  version: string;
  payload: any;
  region?: string;
}

export const createSignature = (params: {
  secretId: string;
  secretKey: string;
  endpoint: string;
  service: string;
  action: string;
  payload: any;
  region?: string;
}) => {
  const { secretId, secretKey, endpoint, service, action, payload, region } = params;
  const timestamp = Math.floor(Date.now() / 1000);
  const date = new Date(timestamp * 1000).toISOString().split('T')[0];
  const payloadString = JSON.stringify(payload);

  const hashedRequestPayload = getHash(payloadString);
  const httpRequestMethod = "POST";
  const canonicalUri = "/";
  const canonicalQueryString = "";
  const canonicalHeaders = "content-type:application/json; charset=utf-8\n"
    + "host:" + endpoint + "\n"
    + "x-tc-action:" + action.toLowerCase() + "\n";
  const signedHeaders = "content-type;host;x-tc-action";

  const canonicalRequest = httpRequestMethod + "\n"
    + canonicalUri + "\n"
    + canonicalQueryString + "\n"
    + canonicalHeaders + "\n"
    + signedHeaders + "\n"
    + hashedRequestPayload;

  const algorithm = "TC3-HMAC-SHA256";
  const hashedCanonicalRequest = getHash(canonicalRequest);
  const credentialScope = date + "/" + service + "/" + "tc3_request";
  const stringToSign = algorithm + "\n" +
    timestamp + "\n" +
    credentialScope + "\n" +
    hashedCanonicalRequest;

  const kDate = sha256(date, 'TC3' + secretKey);
  const kService = sha256(service, kDate);
  const kSigning = sha256('tc3_request', kService);
  const signature = sha256(stringToSign, kSigning, 'hex');

  return {
    authorization: algorithm + " " +
      "Credential=" + secretId + "/" + credentialScope + ", " +
      "SignedHeaders=" + signedHeaders + ", " +
      "Signature=" + signature,
    timestamp: timestamp.toString()
  };
};

export const callTencentAPI = async (params: TencentAPIParams) => {
  const SECRET_ID = (process.env.TENCENT_CLOUD_SECRET_ID as string) || '';
  const SECRET_KEY = (process.env.TENCENT_CLOUD_SECRET_KEY as string) || '';

  const { endpoint, service, action, version, payload, region } = params;
  
  const { authorization, timestamp } = createSignature({
    secretId: SECRET_ID,
    secretKey: SECRET_KEY,
    endpoint,
    service,
    action,
    payload,
    region
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    'X-TC-Version': version,
    'X-TC-Action': action,
    'X-TC-Timestamp': timestamp,
    'Authorization': authorization
  };

  if (region) {
    headers['X-TC-Region'] = region;
  }

  return fetch(`https://${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
};
