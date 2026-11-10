/**
 * transactionCodeFormat and permissionFunction context tests. No database.
 *
 * 'path' (default) keeps the legacy lowercased code built from the route path.
 * 'class' builds `${module}.${ClassName}.${methodName}`, case preserved, no route params.
 * permissionFunction receives a third argument with request data.
 */
import 'reflect-metadata';
import http from 'http';
import { AddressInfo } from 'net';
import express from 'express';
import { Controller } from '../src/lib/pxp/Controller';
import { Authentication, Get, Post, ReadOnly } from '../src/lib/pxp/Decorators';
import { IConfigPxpApp, IPermissionContext } from '../src/interfaces';

class Demo extends Controller {
  @Post('/doThing/:id')
  @Get('/doThing/:id')
  @ReadOnly(true)
  async doThing() {
    return { code: this.transactionCode };
  }

  @Post()
  @ReadOnly(true)
  @Authentication(false)
  async open() {
    return { code: this.transactionCode };
  }
}

const call = (url: string, method: 'GET' | 'POST' = 'POST') =>
  new Promise<{ status: number; json: any }>((resolve, reject) => {
    const payload = method === 'POST' ? '{}' : '';
    const headers: Record<string, string | number> =
      method === 'POST' ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload) } : {};
    const req = http.request(url, { method, headers }, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => resolve({ status: res.statusCode as number, json: JSON.parse(raw) }));
    });
    req.on('error', reject);
    req.end(payload);
  });

type PermissionFn = (user: any, transaction: string, context?: IPermissionContext) => Promise<boolean>;

const startServer = async (permissionFunction: PermissionFn, transactionCodeFormat?: 'path' | 'class') => {
  const config: IConfigPxpApp = {
    apiPrefix: '/api',
    defaultDbSettings: 'Orm',
    middlewares: [
      (req: any, _res: any, next: any) => {
        req.user = { userId: 1, username: 'tester' };
        next();
      },
    ],
    entities: {},
    logSink: 'stdout',
    permissionFunction,
    ...(transactionCodeFormat ? { transactionCodeFormat } : {}),
  };
  const app = express();
  app.use(express.json());
  app.use((req: any, _res, next) => {
    req.start = new Date();
    next();
  });
  app.use('/', new Demo('mod', null, config).router);
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return { server, base: `http://127.0.0.1:${port}/api/mod/Demo` };
};

describe('transaction code format and permission context', () => {
  let logSpy: jest.SpyInstance;
  let server: http.Server | undefined;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(async () => {
    logSpy.mockRestore();
    if (server) {
      const s = server;
      server = undefined;
      await new Promise((resolve) => s.close(resolve));
    }
  });

  test('without the option the code is the lowercased route path', async () => {
    const permissionFunction = jest.fn<Promise<boolean>, Parameters<PermissionFn>>().mockResolvedValue(true);
    const started = await startServer(permissionFunction);
    server = started.server;

    const r = await call(`${started.base}/doThing/42`);

    expect(r.status).toBe(200);
    expect(r.json.code).toBe('mod.demo.dothing.:id');
    expect(permissionFunction.mock.calls[0][1]).toBe('mod.demo.dothing.:id');
  });

  test("with 'class' the code is module.ClassName.methodName", async () => {
    const permissionFunction = jest.fn<Promise<boolean>, Parameters<PermissionFn>>().mockResolvedValue(true);
    const started = await startServer(permissionFunction, 'class');
    server = started.server;

    const r = await call(`${started.base}/doThing/42`);

    expect(r.status).toBe(200);
    expect(r.json.code).toBe('mod.Demo.doThing');
    expect(permissionFunction.mock.calls[0][1]).toBe('mod.Demo.doThing');
  });

  test("with 'class' two verbs on the same method give the same code", async () => {
    const permissionFunction = jest.fn<Promise<boolean>, Parameters<PermissionFn>>().mockResolvedValue(true);
    const started = await startServer(permissionFunction, 'class');
    server = started.server;

    const viaPost = await call(`${started.base}/doThing/1`, 'POST');
    const viaGet = await call(`${started.base}/doThing/2`, 'GET');

    expect(viaPost.status).toBe(200);
    expect(viaGet.status).toBe(200);
    expect(viaPost.json.code).toBe('mod.Demo.doThing');
    expect(viaGet.json.code).toBe(viaPost.json.code);
  });

  test('permissionFunction receives the request context', async () => {
    const permissionFunction = jest.fn<Promise<boolean>, Parameters<PermissionFn>>().mockResolvedValue(true);
    const started = await startServer(permissionFunction, 'class');
    server = started.server;

    await call(`${started.base}/doThing/7?x=1`, 'GET');

    expect(permissionFunction).toHaveBeenCalledTimes(1);
    const [user, transaction, context] = permissionFunction.mock.calls[0];
    expect(user.username).toBe('tester');
    expect(transaction).toBe('mod.Demo.doThing');
    expect(context?.httpMethod).toBe('GET');
    expect(context?.path).toBe('/api/mod/Demo/doThing/7?x=1');
    expect(typeof context?.requestId).toBe('string');
    expect(context?.ip).toBeDefined();
  });

  test('a false permissionFunction answers 403', async () => {
    const permissionFunction = jest.fn<Promise<boolean>, Parameters<PermissionFn>>().mockResolvedValue(false);
    const started = await startServer(permissionFunction, 'class');
    server = started.server;

    const r = await call(`${started.base}/doThing/42`);

    expect(r.status).toBe(403);
    expect(permissionFunction).toHaveBeenCalledTimes(1);
  });

  test('an @Authentication(false) route does not call permissionFunction', async () => {
    const permissionFunction = jest.fn<Promise<boolean>, Parameters<PermissionFn>>().mockResolvedValue(false);
    const started = await startServer(permissionFunction, 'class');
    server = started.server;

    const r = await call(`${started.base}/open`);

    expect(r.status).toBe(200);
    expect(r.json.code).toBe('mod.Demo.open');
    expect(permissionFunction).not.toHaveBeenCalled();
  });
});
