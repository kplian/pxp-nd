/*****************************************************************************
 * Copyright(c) 2026 Qorus Inc
 * All rights reserved
 *****************************************************************************
 * NAME: assign-request-id.test.ts
 * DESCRIPTION: assignPxpRequestId middleware helper
 * REVISIONS:
 * ISSUE              DATE          AUTHOR          DESCRIPTION
 * security_flow_ownership_4  06-Nov-2026   Rensi Arteaga   Initial tests.
 ****************************************************************************/

import { assignPxpRequestId } from '../src/lib/pxp/middlewares/assignPxpRequestId';

describe('assignPxpRequestId', () => {
  it('generates id when no header', () => {
    const req: { headers: Record<string, string>; pxpRequestId?: string } = { headers: {} };
    const id = assignPxpRequestId(req);
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(10);
    expect(req.pxpRequestId).toBe(id);
  });

  it('reuses safe x-request-id', () => {
    const req: { headers: Record<string, string>; pxpRequestId?: string } = {
      headers: { 'x-request-id': 'abc-12345-zzz' },
    };
    expect(assignPxpRequestId(req)).toBe('abc-12345-zzz');
  });

  it('is idempotent', () => {
    const req: { headers: Record<string, unknown>; pxpRequestId?: string } = { headers: {} };
    const a = assignPxpRequestId(req);
    req.headers['x-request-id'] = 'other';
    expect(assignPxpRequestId(req)).toBe(a);
  });
});
