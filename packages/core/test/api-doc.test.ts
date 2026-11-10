/*****************************************************************************
 * Copyright(c) 2026 Qorus Inc
 * All rights reserved
 *****************************************************************************
 * NAME: api-doc.test.ts
 * DEVELOPER: Rensi Arteaga
 * DESCRIPTION: OpenAPI builder and @ApiDoc registry (documented routes only)
 * REVISIONS:
 * Date Change      ID              Author              Description
 * -----------      -----------     --------------      ------------------------------------
 * 05-Nov-2026                      Rensi Arteaga       Created
 *****************************************************************************/

import 'reflect-metadata';
import { Controller } from '../src/lib/pxp/Controller';
import { ApiDoc, ApiDocFor, Get, Post, ReadOnly } from '../src/lib/pxp/Decorators';
import { clearApiDocRegistry, getApiDocRegistry, registerMountedApiDocs } from '../src/lib/pxp/apiDoc/apiDocRegistry';
import {
  buildOpenApiDocument,
  hashOpenApiPaths,
  schemaContainsVendorField,
} from '../src/lib/pxp/apiDoc/buildOpenApiDocument';
import { ApiDocRouteEntry, ApiDocSpec } from '../src/lib/pxp/apiDoc/ApiDocTypes';

const lockDoc: ApiDocSpec = {
  summary: 'Lock state of a flow',
  description: 'Whether the flow is read-only for the user.',
  params: {
    type: 'object',
    properties: { flowId: { type: 'integer', minimum: 1 } },
    required: ['flowId'],
    additionalProperties: false,
  },
  readOnly: true,
  permission: null,
};

class FlowHQ extends Controller {
  @Get()
  @ReadOnly(true)
  @ApiDoc(lockDoc)
  async getFlowLockState(): Promise<unknown> {
    return {};
  }

  @Get()
  @ReadOnly(true)
  async hiddenList(): Promise<unknown> {
    return {};
  }
}

@ApiDocFor('add', {
  summary: 'Create a flow',
  description: 'Creates a flow.',
  params: {
    type: 'object',
    properties: { name: { type: 'string', minLength: 1 } },
    required: ['name'],
    additionalProperties: false,
  },
  readOnly: false,
  permission: null,
})
class DocumentedAdd extends Controller {
  @Post()
  @ReadOnly(false)
  async other(): Promise<unknown> {
    return {};
  }
}

describe('schemaContainsVendorField', () => {
  it('rejects vendorId at any depth', () => {
    expect(
      schemaContainsVendorField({
        type: 'object',
        properties: {
          nested: {
            type: 'object',
            properties: { vendorId: { type: 'integer' } },
          },
        },
      })
    ).toBe(true);
    expect(
      schemaContainsVendorField({
        type: 'object',
        properties: { flowId: { type: 'integer' } },
      })
    ).toBe(false);
    expect(
      schemaContainsVendorField({
        type: 'object',
        properties: { vendor_id: { type: 'integer' } },
      })
    ).toBe(true);
  });
});

describe('buildOpenApiDocument', () => {
  const documented: ApiDocRouteEntry = {
    module: 'hq-nd',
    controller: 'FlowHQ',
    methodName: 'getFlowLockState',
    httpMethod: 'get',
    path: '/api/hq-nd/FlowHQ/getFlowLockState',
    apiDoc: lockDoc,
  };

  const undocumented: ApiDocRouteEntry = {
    module: 'hq-nd',
    controller: 'FlowHQ',
    methodName: 'hiddenList',
    httpMethod: 'get',
    path: '/api/hq-nd/FlowHQ/hiddenList',
    apiDoc: null,
  };

  it('omits routes without @ApiDoc', () => {
    const doc = buildOpenApiDocument([documented, undocumented]);
    const paths = doc.paths as Record<string, unknown>;
    expect(Object.keys(paths)).toEqual(['/api/hq-nd/FlowHQ/getFlowLockState']);
    expect(paths['/api/hq-nd/FlowHQ/hiddenList']).toBeUndefined();
  });

  it('sets operationId, x-read-only and query parameters for GET', () => {
    const doc = buildOpenApiDocument([documented]);
    const op = (doc.paths as any)['/api/hq-nd/FlowHQ/getFlowLockState'].get;
    expect(op.operationId).toBe('hq-nd.FlowHQ.getFlowLockState');
    expect(op['x-read-only']).toBe(true);
    expect(op['x-permission']).toBeNull();
    expect(op.parameters[0].name).toBe('flowId');
    expect(op.parameters[0].in).toBe('query');
    expect(op.parameters[0].required).toBe(true);
  });

  it('suffixes .post when the same method is GET and POST', () => {
    const getEntry: ApiDocRouteEntry = {
      ...documented,
      methodName: 'getFlowRender',
      httpMethod: 'get',
      path: '/api/flow-nd/Flow/getFlowRender',
      apiDoc: { ...lockDoc, summary: 'Editor board' },
    };
    const postEntry: ApiDocRouteEntry = {
      ...getEntry,
      httpMethod: 'post',
      module: 'flow-nd',
      controller: 'Flow',
    };
    getEntry.module = 'flow-nd';
    getEntry.controller = 'Flow';
    const doc = buildOpenApiDocument([getEntry, postEntry]);
    const pathItem = (doc.paths as any)['/api/flow-nd/Flow/getFlowRender'];
    expect(pathItem.get.operationId).toBe('flow-nd.Flow.getFlowRender');
    expect(pathItem.post.operationId).toBe('flow-nd.Flow.getFlowRender.post');
    expect(pathItem.post.requestBody.content['application/json'].schema).toBeDefined();
  });

  it('uses a stable info.version over paths and changes when a description changes', () => {
    const a = buildOpenApiDocument([documented]);
    const b = buildOpenApiDocument([documented]);
    expect(a.info).toEqual(b.info);
    expect(typeof (a.info as any).version).toBe('string');
    expect((a.info as any).version).toHaveLength(12);
    const changed = buildOpenApiDocument([
      { ...documented, apiDoc: { ...lockDoc, summary: 'Changed' } },
    ]);
    expect((changed.info as any).version).not.toBe((a.info as any).version);
    expect(hashOpenApiPaths((a.paths as any))).toBe((a.info as any).version);
  });

  it('returns empty paths when nothing is documented', () => {
    const doc = buildOpenApiDocument([undocumented]);
    expect(doc.paths).toEqual({});
    expect(doc.openapi).toBe('3.0.3');
  });
});

describe('Controller registry', () => {
  const pxpConfig = { apiPrefix: '/api', defaultDbSettings: 'Orm' as const, middlewares: [] as any[] };

  beforeEach(() => {
    clearApiDocRegistry();
  });

  it('does not register a controller created by hand', () => {
    for (let i = 0; i < 100; i += 1) {
      new FlowHQ('hq-nd/FlowHQ', null, pxpConfig);
    }
    expect(getApiDocRegistry()).toEqual([]);
  });

  it('registers each mounted method and path once', () => {
    const ctrl = new FlowHQ('hq-nd', null, pxpConfig);
    registerMountedApiDocs(ctrl);
    registerMountedApiDocs(ctrl);
    const registered = getApiDocRegistry();
    expect(registered.filter((r) => r.methodName === 'getFlowLockState')).toHaveLength(1);
    expect(registered.map((r) => r.methodName)).toContain('hiddenList');
    const hidden = registered.find((r) => r.methodName === 'hiddenList');
    expect(hidden.apiDoc).toBeNull();
    expect(registered.find((r) => r.path.includes('/FlowHQ/FlowHQ/'))).toBeUndefined();
    const doc = buildOpenApiDocument(registered);
    expect(Object.keys(doc.paths as object)).toEqual([
      '/api/hq-nd/FlowHQ/getFlowLockState',
    ]);
  });
});

describe('duplicate operationId', () => {
  const first: ApiDocRouteEntry = {
    module: 'hq-nd',
    controller: 'FlowHQ',
    methodName: 'basicFlowList',
    httpMethod: 'get',
    path: '/api/hq-nd/FlowHQ/basicFlowList',
    apiDoc: lockDoc,
  };
  const phantom: ApiDocRouteEntry = {
    ...first,
    path: '/api/hq-nd/FlowHQ/FlowHQ/basicFlowList',
  };
  const previous = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = previous;
  });

  it('fails outside production', () => {
    process.env.NODE_ENV = 'test';
    expect(() => buildOpenApiDocument([phantom, first])).toThrow(/Duplicate operationId/);
  });

  it('keeps the first operation in production', () => {
    process.env.NODE_ENV = 'production';
    const err = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const doc = buildOpenApiDocument([first, phantom]);
    expect(Object.keys(doc.paths as object)).toEqual(['/api/hq-nd/FlowHQ/basicFlowList']);
    expect(err).toHaveBeenCalled();
    err.mockRestore();
  });
});
