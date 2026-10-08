/**
 * Error/log path tests for Controller route handlers. No database needed.
 *
 * `insertLog` (src/lib/pxp/utils/Security) is mocked to reject, simulating a log database that is down:
 *   1. a route that throws PxpError(400) must still answer 400 with the original message, in both
 *      the unauthenticated and the authenticated route handler (before 1.2.91 the request hung forever)
 *   2. a successful route must answer 200 and the failed fire-and-forget success log must not become
 *      an unhandledRejection
 *
 * Harness: same as db-timeouts.test.ts (Controller subclass mounted on a bare express app). All routes
 * are @ReadOnly(true), so ormMethodWrapper never touches a connection.
 */
import 'reflect-metadata';
import http from 'http';
import { AddressInfo } from 'net';
import express from 'express';

jest.mock('../src/lib/pxp/utils/Security', () => ({
  ...jest.requireActual('../src/lib/pxp/utils/Security'),
  insertLog: jest.fn(),
}));

import { insertLog } from '../src/lib/pxp/utils/Security';
import { Controller } from '../src/lib/pxp/Controller';
import { Authentication, Post, ReadOnly } from '../src/lib/pxp/Decorators';
import { PxpError } from '../src/lib/pxp/PxpError';
import { IConfigPxpApp } from '../src/interfaces';

const insertLogMock = insertLog as jest.MockedFunction<typeof insertLog>;

class Broken extends Controller {
  @Post()
  @ReadOnly(true)
  @Authentication(false)
  async publicFail() {
    throw new PxpError(400, 'public route failed on purpose');
  }

  @Post()
  @ReadOnly(true)
  async privateFail() {
    throw new PxpError(400, 'private route failed on purpose');
  }

  @Post()
  @ReadOnly(true)
  async ok() {
    return { ok: true };
  }
}

const config: IConfigPxpApp = {
  apiPrefix: '/api',
  defaultDbSettings: 'Orm',
  middlewares: [],
  entities: {},
};

// Plain http client with a hard deadline so a hanging handler fails the test instead of the runner.
const call = (url: string, deadlineMs = 2000) =>
  new Promise<{ status: number; json: any; ms: number }>((resolve, reject) => {
    const t0 = Date.now();
    const payload = '{}';
    const req = http.request(
      url,
      { method: 'POST', headers: { 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload) } },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => resolve({ status: res.statusCode as number, json: JSON.parse(raw), ms: Date.now() - t0 }));
      }
    );
    req.setTimeout(deadlineMs, () => {
      req.destroy(new Error(`no response within ${deadlineMs} ms (handler hung)`));
    });
    req.on('error', reject);
    req.end(payload);
  });

describe('Controller error path with a failing insertLog (no database)', () => {
  let server: http.Server;
  let base: string;
  const unhandled: unknown[] = [];
  const onUnhandled = (reason: unknown) => unhandled.push(reason);
  let consoleError: jest.SpyInstance;

  beforeAll(async () => {
    process.on('unhandledRejection', onUnhandled);
    const app = express();
    app.use(express.json());
    app.use((req: any, _res, next) => {
      req.start = new Date();
      next();
    });
    app.use('/', new Broken('test', null, config).router);
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address() as AddressInfo;
    base = `http://127.0.0.1:${port}/api/test/Broken`;
  });

  beforeEach(() => {
    insertLogMock.mockReset();
    insertLogMock.mockRejectedValue(new Error('connect ECONNREFUSED 127.0.0.1:3306'));
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => consoleError.mockRestore());

  afterAll(async () => {
    process.removeListener('unhandledRejection', onUnhandled);
    await new Promise((r) => server.close(r));
  });

  test.each([
    ['unauthenticated handler', 'publicFail', 'public route failed on purpose'],
    ['authenticated handler', 'privateFail', 'private route failed on purpose'],
  ])('%s: PxpError(400) is answered with 400 and the original message', async (_label, path, message) => {
    const r = await call(`${base}/${path}`);

    expect(r.status).toBe(400);
    expect(r.json.error.code).toBe(400);
    expect(r.json.error.message).toBe(message);
    expect(r.json.error.logId).toBeUndefined();
    expect(r.ms).toBeLessThan(2000);
    expect(insertLogMock).toHaveBeenCalledTimes(1);
    expect(insertLogMock.mock.calls[0][3]).toBe('error');
    expect(consoleError).toHaveBeenCalledWith('[pxp-core] error log failed', 'connect ECONNREFUSED 127.0.0.1:3306');
  });

  test('success path: 200 and the failed success log is caught (no unhandledRejection)', async () => {
    const r = await call(`${base}/ok`);

    expect(r.status).toBe(200);
    expect(r.json).toEqual({ ok: true });
    // let the rejected fire-and-forget log settle
    await new Promise((resolve) => setImmediate(resolve));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(insertLogMock).toHaveBeenCalledTimes(1);
    expect(insertLogMock.mock.calls[0][3]).toBe('success');
    expect(consoleError).toHaveBeenCalledWith('[pxp-core] success log failed', 'connect ECONNREFUSED 127.0.0.1:3306');
    expect(unhandled).toEqual([]);
  });
});
