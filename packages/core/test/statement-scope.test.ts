/**
 * db.transactionScope. No database.
 *
 * Omitted or 'handler': a write route checks out one query runner for the whole method.
 * 'statement': the method receives the pool manager and no query runner is opened,
 * so a wait inside the method does not hold a write connection.
 */
import 'reflect-metadata';
import http from 'http';
import { AddressInfo } from 'net';
import express from 'express';

jest.mock('../src/lib/pxp/utils/Security', () => ({
  ...jest.requireActual('../src/lib/pxp/utils/Security'),
  insertLog: jest.fn().mockResolvedValue(undefined),
}));

import * as typeorm from 'typeorm';
import { Controller } from '../src/lib/pxp/Controller';
import { Authentication, Log, Post, ReadOnly, Timeout } from '../src/lib/pxp/Decorators';
import { IConfigPxpApp } from '../src/interfaces';

const seen: { manager: unknown } = { manager: null };

class WriteProbe extends Controller {
  @Post()
  @ReadOnly(false)
  @Authentication(false)
  @Log(false)
  async save(_params: unknown, manager: unknown) {
    seen.manager = manager;
    await new Promise((resolve) => setTimeout(resolve, 20));
    return { ok: true };
  }

  @Post()
  @ReadOnly(false)
  @Authentication(false)
  @Log(false)
  @Timeout(40)
  async slow() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { ok: true };
  }
}

const queryRunner = {
  connect: jest.fn().mockResolvedValue(undefined),
  startTransaction: jest.fn().mockResolvedValue(undefined),
  commitTransaction: jest.fn().mockResolvedValue(undefined),
  rollbackTransaction: jest.fn().mockResolvedValue(undefined),
  release: jest.fn().mockResolvedValue(undefined),
  isTransactionActive: false,
  manager: { id: 'runner' },
};

const connection = {
  createQueryRunner: jest.fn(() => queryRunner),
  manager: { id: 'pool' },
};

const startApp = async (config: IConfigPxpApp) => {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res, next) => {
    req.start = new Date();
    next();
  });
  const controller = new WriteProbe('test', null, config);
  app.use('/', controller.router);
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return { server, base: `http://127.0.0.1:${port}/api/test/WriteProbe` };
};

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

const baseConfig: IConfigPxpApp = {
  apiPrefix: '/api',
  defaultDbSettings: 'Orm',
  middlewares: [],
  entities: {},
};

beforeEach(() => {
  seen.manager = null;
  queryRunner.connect.mockClear();
  queryRunner.startTransaction.mockClear();
  queryRunner.commitTransaction.mockClear();
  queryRunner.release.mockClear();
  connection.createQueryRunner.mockClear();
  jest.spyOn(typeorm, 'getConnection').mockReturnValue(connection as any);
  process.env.DB_WRITE_CONNECTION_NAME = 'write';
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('transactionScope', () => {
  it('keeps one write transaction around the whole method by default', async () => {
    const { server, base } = await startApp(baseConfig);
    try {
      const res = await call(`${base}/save`);
      expect(res.status).toBe(200);
      expect(res.json).toEqual({ ok: true });
      expect(connection.createQueryRunner).toHaveBeenCalledTimes(1);
      expect(queryRunner.startTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.release).toHaveBeenCalledTimes(1);
      expect(seen.manager).toBe(queryRunner.manager);
    } finally {
      server.close();
    }
  });

  it('does not check out a write connection for the whole method when scope is statement', async () => {
    const { server, base } = await startApp({
      ...baseConfig,
      db: { transactionScope: 'statement' },
    });
    try {
      const res = await call(`${base}/save`);
      expect(res.status).toBe(200);
      expect(connection.createQueryRunner).not.toHaveBeenCalled();
      expect(queryRunner.connect).not.toHaveBeenCalled();
      expect(seen.manager).toBe(connection.manager);
    } finally {
      server.close();
    }
  });

  it('answers 503 on @Timeout without opening a query runner in statement scope', async () => {
    const { server, base } = await startApp({
      ...baseConfig,
      db: { transactionScope: 'statement' },
    });
    try {
      const res = await call(`${base}/slow`);
      expect(res.status).toBe(503);
      expect(res.json.error.message).toMatch(/request timeout/);
      expect(connection.createQueryRunner).not.toHaveBeenCalled();
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 220));
      server.close();
    }
  });
});
