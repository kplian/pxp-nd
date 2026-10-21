/**
 * logSink tests. No database.
 *
 * stdout writes one JSON line and returns a uuid without calling getManager.
 * both writes the line and inserts in the background; the caller is not blocked on the insert.
 * db (the default) still inserts and returns the numeric id.
 */
import 'reflect-metadata';
import http from 'http';
import { AddressInfo } from 'net';
import express from 'express';
import * as typeorm from 'typeorm';
import { insertLog, STDOUT_LOG_FIELD_MAX } from '../src/lib/pxp/utils/Security';
import { Controller } from '../src/lib/pxp/Controller';
import { Authentication, Post, ReadOnly } from '../src/lib/pxp/Decorators';
import { PxpError } from '../src/lib/pxp/PxpError';
import { IConfigPxpApp } from '../src/interfaces';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const baseArgs = (req: Record<string, unknown>, logConfig: Record<string, unknown> = {}) =>
  ['user', 'mac', '127.0.0.1', 'success', 'ok', 'mod', 'mod.tx', '', req, '{"ok":true}', '200', 12, logConfig] as const;

const pxpLines = (spy: jest.SpyInstance): any[] =>
  spy.mock.calls
    .map((call) => call[0])
    .filter((line) => typeof line === 'string' && line.includes('"pxpLog":true'))
    .map((line) => JSON.parse(line));

describe('insertLog sinks', () => {
  let logSpy: jest.SpyInstance;
  let getManager: jest.SpyInstance;
  let execute: jest.Mock;
  let values: jest.Mock;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    execute = jest.fn().mockResolvedValue({ identifiers: [{ logId: 7 }] });
    values = jest.fn();
    const qb = {
      insert: jest.fn(),
      into: jest.fn(),
      values,
      execute,
    };
    qb.insert.mockReturnValue(qb);
    qb.into.mockReturnValue(qb);
    values.mockReturnValue(qb);
    getManager = jest.spyOn(typeorm, 'getManager').mockReturnValue({ createQueryBuilder: () => qb } as any);
  });

  afterEach(() => {
    logSpy.mockRestore();
    getManager.mockRestore();
  });

  test('stdout returns a uuid, writes one line, and does not touch the database', async () => {
    const req = { card: '4111111111111111', keep: 'yes' };
    const id = await insertLog(...baseArgs(req, { card: 'cc_mask' }), 'stdout');

    expect(id).toMatch(UUID);
    expect(getManager).not.toHaveBeenCalled();
    expect(req).toEqual({ card: '4111111111111111', keep: 'yes' });

    const [line] = pxpLines(logSpy);
    expect(line.logId).toBe(id);
    expect(line.type).toBe('success');
    expect(line.user).toBe('user');
    expect(line.transaction).toBe('mod.tx');
    expect(line.status).toBe('200');
    expect(line.truncated).toBe(false);
    expect(line.request).toContain('************1111');
    expect(line.request).not.toContain('4111111111111111');
    expect(line.request).toContain('yes');
  });

  test('stdout drops masked-out fields and caps oversized bodies', async () => {
    const req = { favicon: 'png', note: 'x'.repeat(STDOUT_LOG_FIELD_MAX + 500) };
    await insertLog(...baseArgs(req, { favicon: null }), 'stdout');

    const [line] = pxpLines(logSpy);
    expect(line.request.startsWith('{"note":')).toBe(true);
    expect(line.request).not.toContain('favicon');
    expect(line.request.length).toBe(STDOUT_LOG_FIELD_MAX);
    expect(line.truncated).toBe(true);
    expect(req.favicon).toBe('png');
  });

  test('both returns the uuid before the insert finishes and stores __logId on the row', async () => {
    let release: (value: unknown) => void = () => undefined;
    execute.mockReturnValue(new Promise((resolve) => {
      release = resolve;
    }));

    const id = await Promise.race([
      insertLog(...baseArgs({ a: 1 }), 'both'),
      new Promise((_resolve, reject) => setTimeout(() => reject(new Error('waited for the database')), 200)),
    ]);

    expect(id).toMatch(UUID);
    const [line] = pxpLines(logSpy);
    expect(line.logId).toBe(id);
    expect(execute).toHaveBeenCalledTimes(1);

    const row = values.mock.calls[0][0][0];
    expect(JSON.parse(row.request).__logId).toBe(id);

    release({ identifiers: [{ logId: 7 }] });
  });

  test('db stays on the numeric id and writes no stdout line', async () => {
    const id = await insertLog(...baseArgs({ a: 1 }));

    expect(id).toBe(7);
    expect(getManager).toHaveBeenCalledTimes(1);
    expect(pxpLines(logSpy)).toEqual([]);
  });

  test('a failing background insert does not reject', async () => {
    execute.mockRejectedValue(new Error('connect ECONNREFUSED'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const unhandled: unknown[] = [];
    const onUnhandled = (reason: unknown) => unhandled.push(reason);
    process.on('unhandledRejection', onUnhandled);

    const id = await insertLog(...baseArgs({ a: 1 }), 'both');
    await new Promise((resolve) => setImmediate(resolve));

    expect(id).toMatch(UUID);
    expect(errorSpy).toHaveBeenCalledWith('[pxp-core] db log failed', 'connect ECONNREFUSED');
    expect(unhandled).toEqual([]);

    process.removeListener('unhandledRejection', onUnhandled);
    errorSpy.mockRestore();
  });
});

class Audited extends Controller {
  @Post()
  @ReadOnly(true)
  @Authentication(false)
  async fail() {
    throw new PxpError(400, 'audit me');
  }

  @Post()
  @ReadOnly(true)
  @Authentication(false)
  async ok() {
    return { ok: true };
  }
}

const call = (url: string) =>
  new Promise<{ status: number; json: any }>((resolve, reject) => {
    const payload = '{}';
    const req = http.request(
      url,
      { method: 'POST', headers: { 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload) } },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => resolve({ status: res.statusCode as number, json: JSON.parse(raw) }));
      }
    );
    req.on('error', reject);
    req.end(payload);
  });

describe('controller with logSink stdout', () => {
  let server: http.Server;
  let base: string;
  let logSpy: jest.SpyInstance;
  let getManager: jest.SpyInstance;

  beforeAll(async () => {
    const config: IConfigPxpApp = {
      apiPrefix: '/api',
      defaultDbSettings: 'Orm',
      middlewares: [],
      entities: {},
      logSink: 'stdout',
    };
    const app = express();
    app.use(express.json());
    app.use((req: any, _res, next) => {
      req.start = new Date();
      next();
    });
    app.use('/', new Audited('test', null, config).router);
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address() as AddressInfo;
    base = `http://127.0.0.1:${port}/api/test/Audited`;
  });

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    getManager = jest.spyOn(typeorm, 'getManager').mockImplementation(() => {
      throw new Error('stdout sink must not ask for a connection');
    });
  });

  afterEach(() => {
    logSpy.mockRestore();
    getManager.mockRestore();
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  test('an error response carries the same uuid that was written to stdout', async () => {
    const r = await call(`${base}/fail`);

    expect(r.status).toBe(400);
    expect(r.json.error.message).toBe('audit me');
    expect(r.json.error.logId).toMatch(UUID);
    expect(getManager).not.toHaveBeenCalled();

    const [line] = pxpLines(logSpy);
    expect(line.logId).toBe(r.json.error.logId);
    expect(line.type).toBe('error');
    expect(line.status).toBe(400);
  });

  test('a successful request is logged and still answers 200', async () => {
    const r = await call(`${base}/ok`);
    await new Promise((resolve) => setImmediate(resolve));

    expect(r.status).toBe(200);
    expect(r.json).toEqual({ ok: true });
    expect(r.json.logId).toBeUndefined();
    expect(getManager).not.toHaveBeenCalled();

    const [line] = pxpLines(logSpy);
    expect(line.logId).toMatch(UUID);
    expect(line.type).toBe('success');
    expect(line.status).toBe('200');
  });
});
