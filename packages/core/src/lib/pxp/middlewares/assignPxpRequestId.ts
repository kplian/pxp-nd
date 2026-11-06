/*****************************************************************************
 * Copyright(c) 2026 Qorus Inc
 * All rights reserved
 *****************************************************************************
 * NAME: assignPxpRequestId.ts
 * DESCRIPTION: Stable per-request id for log correlation (before insertLog / validation warnings).
 * REVISIONS:
 * ISSUE              DATE          AUTHOR          DESCRIPTION
 * security_flow_ownership_4  06-Nov-2026   Rensi Arteaga   Initial implementation.
 *****************************************************************************/

import crypto from 'crypto';

/** Same shape as stdout log ids in Security.ts (uuid v4). */
function randomUuidV4(): string {
  const bytes = crypto.randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const INCOMING_HEADER_NAMES = ['x-request-id', 'x-correlation-id'] as const;

function sanitizeIncomingId(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const t = value.trim();
  if (t.length < 8 || t.length > 128) {
    return null;
  }
  if (!/^[\w-]+$/.test(t)) {
    return null;
  }
  return t;
}

/**
 * Sets `req.pxpRequestId` on first access. Reuses a safe incoming header when present; otherwise generates a UUID.
 * Idempotent if called again on the same request.
 */
export function assignPxpRequestId(req: { headers?: Record<string, unknown>; pxpRequestId?: string }): string {
  if (typeof req.pxpRequestId === 'string' && req.pxpRequestId.length > 0) {
    return req.pxpRequestId;
  }
  const headers = req.headers || {};
  for (const name of INCOMING_HEADER_NAMES) {
    const raw = headers[name];
    const first = Array.isArray(raw) ? raw[0] : raw;
    const trusted = sanitizeIncomingId(first);
    if (trusted) {
      req.pxpRequestId = trusted;
      return trusted;
    }
  }
  const id = randomUuidV4();
  req.pxpRequestId = id;
  return id;
}
