/**
 * Server-only Vercel adapter for the existing Cloudflare D1 + R2 bindings.
 * No credentials are bundled into the browser. Both services stay disabled
 * until the operator sets Vercel environment variables.
 */
import { createHash, createHmac } from "node:crypto";

const sha256 = (value: string | Uint8Array) => createHash("sha256").update(value).digest("hex");
const sign = (key: string | Uint8Array, value: string) => createHmac("sha256", key).update(value).digest();

function d1Configuration() {
  const account = process.env.BAM_D1_ACCOUNT_ID;
  const database = process.env.BAM_D1_DATABASE_ID;
  const token = process.env.BAM_D1_API_TOKEN;
  if (!account || !database || !token) return null;
  if (!/^[a-f0-9]{32}$/i.test(account) || !/^[a-f0-9-]{32,36}$/i.test(database)) {
    throw Error("Invalid D1 identifiers");
  }
  return { account, database, token };
}

async function queryD1(sql: string, params: unknown[]) {
  const cfg = d1Configuration();
  if (!cfg) throw Error("D1 is not configured in Vercel");
  const endpoint = "https://api.cloudflare.com/client/v4/accounts/" +
    cfg.account + "/d1/database/" + cfg.database + "/query";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: "Bearer " + cfg.token, "Content-Type": "application/json" },
    body: JSON.stringify({ sql, params }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw Error("D1 request failed: HTTP " + response.status);
  const data = await response.json() as {
    success: boolean;
    errors?: Array<{message?: string}>;
    result?: Array<{success?: boolean; results?: Record<string, unknown>[]; meta?: {changes?: number}}>;
  };
  const result = data.result?.[0];
  if (!data.success || !result || result.success === false) {
    throw Error("D1 query failed: " + (data.errors?.[0]?.message ?? "unknown"));
  }
  return result;
}

function database() {
  return {
    prepare(sql: string) {
      let params: unknown[] = [];
      const statement = {
        bind(...args: unknown[]) { params = args; return statement; },
        async first<T = Record<string, unknown>>(): Promise<T | null> {
          const res = await queryD1(sql, params);
          return (res.results?.[0] as T | undefined) ?? null;
        },
        async all<T = Record<string, unknown>>() {
          const res = await queryD1(sql, params);
          return { results: (res.results ?? []) as T[] };
        },
        async run() {
          const res = await queryD1(sql, params);
          return { meta: { changes: res.meta?.changes ?? 0 } };
        },
      };
      return statement;
    },
  };
}

function r2Configuration() {
  const account = process.env.BAM_R2_ACCOUNT_ID;
  const bucket = process.env.BAM_R2_BUCKET;
  const accessKey = process.env.BAM_R2_ACCESS_KEY_ID;
  const secret = process.env.BAM_R2_SECRET_ACCESS_KEY;
  if (!account || !bucket || !accessKey || !secret) return null;
  if (!/^[a-f0-9]{32}$/i.test(account) || !/^[a-z0-9][a-z0-9.-]{1,62}$/i.test(bucket)) {
    throw Error("Invalid R2 identifiers");
  }
  return { account, bucket, accessKey, secret };
}

// Minimal AWS Signature V4 for the S3-compatible R2 GET/PUT operations.
async function r2Request(method: "GET" | "PUT", key: string, body?: Uint8Array, type?: string) {
  const cfg = r2Configuration();
  if (!cfg) throw Error("R2 is not configured in Vercel");
  if (!/^[a-f0-9-]{36}$/.test(key)) throw Error("Invalid R2 media key");
  const host = cfg.account + ".r2.cloudflarestorage.com";
  const path = "/" + cfg.bucket + "/" + key;
  const stamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const date = stamp.slice(0, 8);
  const digest = sha256(body ?? new Uint8Array());
  const headers: Record<string, string> = {
    "host": host, "x-amz-content-sha256": digest, "x-amz-date": stamp,
  };
  if (type) headers["content-type"] = type;
  const keys = Object.keys(headers).sort();
  const signedHeaders = keys.join(";");
  const canonicalHeaders = keys.map(k => k + ":" + headers[k] + "\n").join("");
  const canonical = [method, path, "", canonicalHeaders, signedHeaders, digest].join("\n");
  const scope = date + "/auto/s3/aws4_request";
  const stringToSign = ["AWS4-HMAC-SHA256", stamp, scope, sha256(canonical)].join("\n");
  const keyBytes = sign(sign(sign(sign("AWS4" + cfg.secret, date), "auto"), "s3"), "aws4_request");
  headers["authorization"] = "AWS4-HMAC-SHA256 Credential=" + cfg.accessKey + "/" + scope +
    ", SignedHeaders=" + signedHeaders + ", Signature=" + sign(keyBytes, stringToSign).toString("hex");
  return fetch("https://" + host + path, {
    method,
    headers,
    ...(body ? {body: body as BodyInit} : {}),
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
}

function bucket() {
  return {
    async put(key: string, bytes: Uint8Array, opts?: {httpMetadata?: {contentType?: string}}) {
      const response = await r2Request("PUT", key, bytes, opts?.httpMetadata?.contentType);
      if (!response.ok) throw Error("R2 upload failed: HTTP " + response.status);
      return {key};
    },
    async get(key: string) {
      const response = await r2Request("GET", key);
      if (response.status === 404) return null;
      if (!response.ok) throw Error("R2 download failed: HTTP " + response.status);
      return {
        body: response.body,
        httpMetadata: {contentType: response.headers.get("content-type") ?? undefined},
      };
    },
  };
}

export const env = {
  get DB() { return d1Configuration() ? database() : undefined; },
  get BUCKET() { return r2Configuration() ? bucket() : undefined; },
  get ADMIN_SETUP_CODE() { return process.env.ADMIN_SETUP_CODE; },
};
