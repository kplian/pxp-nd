/**
 * Regression and timeout tests for write transactions in ormMethodWrapper:
 *   1. no `db` config and no @Timeout: legacy behaviour (connect -> transaction -> commit -> release)
 *   2. `db.acquireTimeoutMs`: waiting for a busy pool fails with 503 and the pool recovers
 *   3. `@Timeout(ms)`: the request fails with 503, no transaction stays open, nothing is committed
 *
 * Requires a REAL, disposable MySQL. Connection settings (defaults target a local throwaway container):
 *   TEST_DB_HOST (127.0.0.1) TEST_DB_PORT (33306) TEST_DB_USER (root) TEST_DB_PASSWORD (test) TEST_DB_NAME (pxptest)
 *   docker run --rm -d -e MYSQL_ROOT_PASSWORD=test -e MYSQL_DATABASE=pxptest -p 33306:3306 mysql:8
 * If the database is not reachable the whole suite is skipped (it never fails for lack of a database).
 *
 * Harness: a Controller subclass mounted on a bare express app. A full PxpApp is not used because
 * its run() pulls in sessions, auth modules, swagger and dist/modules folder scanning, none of which
 * is involved in the code under test (Controller.initializeRoutes + ormMethodWrapper).
 */
import 'reflect-metadata';
import { execFileSync } from 'child_process';
import http from 'http';
import { AddressInfo } from 'net';
import express from 'express';
import { createConnections, Connection, EntityManager, getConnection } from 'typeorm';
import { Controller } from '../src/lib/pxp/Controller';
import { Post, ReadOnly, Timeout } from '../src/lib/pxp/Decorators';
import { IConfigPxpApp } from '../src/interfaces';
import Log from '../src/entities/Log';

const DB = {
  host: process.env.TEST_DB_HOST || '127.0.0.1',
  port: Number(process.env.TEST_DB_PORT || 33306),
  username: process.env.TEST_DB_USER || 'root',
  password: process.env.TEST_DB_PASSWORD || 'test',
  database: process.env.TEST_DB_NAME || 'pxptest',
};

// Synchronous reachability probe so the suite can be declared with describe.skip.
const probeDb = (): string | null => {
  const script = `
    const mysql = require('mysql2');
    const c = mysql.createConnection({ host: process.argv[1], port: +process.argv[2], user: process.argv[3],
      password: process.argv[4], database: process.argv[5], connectTimeout: 3000 });
    c.query('SELECT 1', (err) => { c.destroy(); if (err) { console.error(err.message); process.exit(1); } process.exit(0); });
  `;
  try {
    execFileSync(process.execPath, ['-e', script, DB.host, String(DB.port), DB.username, DB.password, DB.database], {
      cwd: __dirname,
      stdio: 'pipe',
      timeout: 10000,
    });
    return null;
  } catch (e) {
    return String((e as any).stderr || (e as any).message).trim();
  }
};

const dbError = probeDb();
if (dbError) {
  // eslint-disable-next-line no-console
  console.warn(
    `[db-timeouts.test] SKIPPED: test MySQL not reachable at ${DB.host}:${DB.port}/${DB.database} (${dbError}). ` +
      'Start one with: docker run --rm -d -e MYSQL_ROOT_PASSWORD=test -e MYSQL_DATABASE=pxptest -p 33306:3306 mysql:8'
  );
}
const describeDb = dbError ? describe.skip : describe;

class Slow extends Controller {
  @Post()
  @ReadOnly(false)
  async hold(params: any, manager: EntityManager) {
    await manager.query('SELECT SLEEP(?)', [Number(params.secs)]);
    return { ok: true };
  }

  // Writes a row first so the transaction is a real InnoDB transaction (visible in innodb_trx),
  // then outlives its @Timeout.
  @Post()
  @ReadOnly(false)
  @Timeout(500)
  async fast(params: any, manager: EntityManager) {
    await manager.query('INSERT INTO pxp_timeout_probe (marker) VALUES (?)', [String(params.marker)]);
    await manager.query('SELECT SLEEP(2)');
    return { ok: true };
  }
}

const baseConfig: IConfigPxpApp = {
  apiPrefix: '/api',
  defaultDbSettings: 'Orm',
  middlewares: [],
  entities: {},
};

const startApp = async (config: IConfigPxpApp) => {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res, next) => {
    req.start = new Date();
    next();
  });
  const controller = new Slow('test', null, config);
  app.use('/', controller.router);
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return { server, base: `http://127.0.0.1:${port}/api/test/Slow` };
};

// Plain http client (the jest node environment does not expose global fetch).
const call = (url: string, body: Record<string, unknown>) =>
  new Promise<{ status: number; json: any; ms: number }>((resolve, reject) => {
    const t0 = Date.now();
    const payload = JSON.stringify(body);
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
    req.on('error', reject);
    req.end(payload);
  });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describeDb('ormMethodWrapper db timeouts (real MySQL)', () => {
  let connections: Connection[] = [];
  const servers: http.Server[] = [];
  const timings: string[] = [];

  beforeAll(async () => {
    process.env.DB_WRITE_CONNECTION_NAME = 'write';
    process.env.DB_LOG_CONNECTION_NAME = 'default';
    connections = await createConnections([
      { name: 'default', type: 'mysql', ...DB, entities: [Log], synchronize: true, logging: false },
      { name: 'write', type: 'mysql', ...DB, entities: [], synchronize: false, logging: false, extra: { connectionLimit: 1 } },
    ]);
    const def = getConnection('default');
    await def.query(
      'CREATE TABLE IF NOT EXISTS pxp_timeout_probe (id INT AUTO_INCREMENT PRIMARY KEY, marker VARCHAR(64) NOT NULL) ENGINE=InnoDB'
    );
  });

  afterAll(async () => {
    for (const s of servers) await new Promise((r) => s.close(r));
    // ormMethodWrapper writes the success log fire-and-forget (not awaited); let in-flight inserts finish
    // before closing the log connection, otherwise they reject unhandled and crash the runner.
    await sleep(1000);
    for (const c of connections) if (c.isConnected) await c.close();
    // eslint-disable-next-line no-console
    console.log(`[db-timeouts.test] timings:\n  ${timings.join('\n  ')}`);
  });

  test('1. legacy: no db config, no @Timeout -> hold secs=1 returns 200 in ~1 s', async () => {
    const { server, base } = await startApp({ ...baseConfig });
    servers.push(server);

    const r = await call(`${base}/hold`, { secs: 1 });
    timings.push(`case1 hold(1): ${r.status} in ${r.ms} ms`);

    expect(r.status).toBe(200);
    expect(r.json).toEqual({ ok: true });
    expect(r.ms).toBeGreaterThanOrEqual(950);
    expect(r.ms).toBeLessThan(2000);
  });

  test('2. db.acquireTimeoutMs=1000 -> second write on a busy 1-connection pool gets 503 in ~1 s; pool recovers', async () => {
    const { server, base } = await startApp({ ...baseConfig, db: { acquireTimeoutMs: 1000 } });
    servers.push(server);

    const first = call(`${base}/hold`, { secs: 5 });
    await sleep(200);
    const second = await call(`${base}/hold`, { secs: 0 });
    timings.push(`case2 second hold(0): ${second.status} in ${second.ms} ms -> ${second.json?.error?.message}`);

    expect(second.status).toBe(503);
    expect(second.json.error.message).toBe('Database acquire timeout after 1000 ms');
    expect(second.ms).toBeGreaterThanOrEqual(950);
    expect(second.ms).toBeLessThan(1800);

    const firstRes = await first;
    timings.push(`case2 first hold(5): ${firstRes.status} in ${firstRes.ms} ms`);
    expect(firstRes.status).toBe(200);
    expect(firstRes.ms).toBeGreaterThanOrEqual(4500);

    // The late connection handed to the timed-out waiter is released back to the pool (not leaked): a new call succeeds.
    const third = await call(`${base}/hold`, { secs: 0 });
    timings.push(`case2 third hold(0): ${third.status} in ${third.ms} ms`);
    expect(third.status).toBe(200);
    expect(third.ms).toBeLessThan(1000);

    const pool: any = (getConnection('write').driver as any).pool;
    timings.push(
      `case2 write pool after: all=${pool._allConnections.length} free=${pool._freeConnections.length} queued=${pool._connectionQueue.length}`
    );
    expect(pool._connectionQueue.length).toBe(0);
    expect(pool._allConnections.length).toBeLessThanOrEqual(1);
    expect(pool._freeConnections.length).toBe(pool._allConnections.length);
  });

  test('3. @Timeout(500) -> 503 in ~0.5 s, no open transaction, nothing committed, pool recovers', async () => {
    const { server, base } = await startApp({ ...baseConfig });
    servers.push(server);
    const warn = jest.spyOn(console, 'warn');
    const marker = `t${Date.now()}`;

    const r = await call(`${base}/fast`, { marker });
    timings.push(`case3 fast: ${r.status} in ${r.ms} ms -> ${r.json?.error?.message}`);

    expect(r.status).toBe(503);
    expect(r.json.error.message).toBe('Database request timeout after 500 ms');
    expect(r.ms).toBeGreaterThanOrEqual(450);
    expect(r.ms).toBeLessThan(1200);
    expect(warn).toHaveBeenCalledWith('[pxp-core] timeout-abandoned test.slow.fast');
    warn.mockRestore();

    const def = getConnection('default');
    let open = -1;
    const t0 = Date.now();
    while (Date.now() - t0 < 3000) {
      const [row] = await def.query('SELECT COUNT(*) AS n FROM information_schema.innodb_trx');
      open = Number(row.n);
      if (open === 0) break;
      await sleep(100);
    }
    timings.push(`case3 innodb_trx open after ${Date.now() - t0} ms: ${open}`);
    expect(open).toBe(0);

    // MySQL rolled the abandoned transaction back server-side: the row was never committed.
    const [committed] = await def.query('SELECT COUNT(*) AS n FROM pxp_timeout_probe WHERE marker = ?', [marker]);
    expect(Number(committed.n)).toBe(0);

    const after = await call(`${base}/hold`, { secs: 0 });
    timings.push(`case3 hold(0) after: ${after.status} in ${after.ms} ms`);
    expect(after.status).toBe(200);
  });
});
