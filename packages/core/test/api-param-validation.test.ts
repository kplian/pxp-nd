/*****************************************************************************
 * Copyright(c) 2026 Qorus Inc
 * All rights reserved
 *****************************************************************************
 * NAME: api-param-validation.test.ts
 * DESCRIPTION: @ApiDoc param validation (warn / enforce / off)
 * REVISIONS:
 * ISSUE              DATE          AUTHOR          DESCRIPTION
 * security_flow_ownership_4  06-Nov-2026   Rensi Arteaga   Initial tests for validateApiDocParams.
 *****************************************************************************/

import 'reflect-metadata';
import {
  getApiParamValidationMode,
  maybeValidateApiDocParams,
} from '../src/lib/pxp/apiDoc/validateApiDocParams';
import {
  ValidateApiParams,
  getApiParamValidationOverride,
} from '../src/lib/pxp/apiDoc/ValidateApiParams';
import { ApiDocSpec } from '../src/lib/pxp/apiDoc/ApiDocTypes';
import { PxpError } from '../src/lib/pxp/PxpError';

const schemaDoc: ApiDocSpec = {
  summary: 'test',
  description: 'test',
  readOnly: true,
  permission: null,
  params: {
    type: 'object',
    properties: {
      flowId: { type: 'integer', minimum: 1 },
    },
    required: ['flowId'],
    additionalProperties: false,
  },
};

const ctx = {
  module: 'hq-nd',
  controller: 'FlowHQ',
  methodName: 'getFlowLockState',
  path: '/api/hq-nd/FlowHQ/getFlowLockState',
};

describe('getApiParamValidationMode', () => {
  const orig = process.env.API_PARAM_VALIDATION;

  afterEach(() => {
    if (orig === undefined) {
      delete process.env.API_PARAM_VALIDATION;
    } else {
      process.env.API_PARAM_VALIDATION = orig;
    }
  });

  it('defaults to warn', () => {
    delete process.env.API_PARAM_VALIDATION;
    expect(getApiParamValidationMode()).toBe('warn');
  });

  it('respects off', () => {
    process.env.API_PARAM_VALIDATION = 'off';
    expect(getApiParamValidationMode()).toBe('off');
  });

  it('respects enforce', () => {
    process.env.API_PARAM_VALIDATION = 'enforce';
    expect(getApiParamValidationMode()).toBe('enforce');
  });
});

describe('maybeValidateApiDocParams', () => {
  const orig = process.env.API_PARAM_VALIDATION;

  afterEach(() => {
    if (orig === undefined) {
      delete process.env.API_PARAM_VALIDATION;
    } else {
      process.env.API_PARAM_VALIDATION = orig;
    }
  });

  it('does nothing when mode is off', () => {
    process.env.API_PARAM_VALIDATION = 'off';
    expect(() =>
      maybeValidateApiDocParams({ flowId: 'bad' } as unknown as Record<string, unknown>, schemaDoc, ctx, (s, m) => {
        throw new PxpError(s, m);
      })
    ).not.toThrow();
  });

  it('warn mode does not throw on mismatch', () => {
    process.env.API_PARAM_VALIDATION = 'warn';
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    maybeValidateApiDocParams({ flowId: 'not-a-number' } as unknown as Record<string, unknown>, schemaDoc, ctx, (s, m) => {
      throw new PxpError(s, m);
    });
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('enforce mode throws PxpError 400', () => {
    process.env.API_PARAM_VALIDATION = 'enforce';
    expect(() =>
      maybeValidateApiDocParams({ flowId: 'x' } as unknown as Record<string, unknown>, schemaDoc, ctx, (s, m) => {
        throw new PxpError(s, m);
      })
    ).toThrow(PxpError);
    try {
      maybeValidateApiDocParams({ flowId: 'x' } as unknown as Record<string, unknown>, schemaDoc, ctx, (s, m) => {
        throw new PxpError(s, m);
      });
    } catch (e: unknown) {
      expect((e as PxpError).statusCode).toBe(400);
    }
  });

  it('accepts string integer for query-style input', () => {
    process.env.API_PARAM_VALIDATION = 'enforce';
    expect(() =>
      maybeValidateApiDocParams({ flowId: '42' } as unknown as Record<string, unknown>, schemaDoc, ctx, (s, m) => {
        throw new PxpError(s, m);
      })
    ).not.toThrow();
  });

  it('mode override enforce throws when env is warn', () => {
    process.env.API_PARAM_VALIDATION = 'warn';
    expect(() =>
      maybeValidateApiDocParams(
        { flowId: 'x' } as unknown as Record<string, unknown>,
        schemaDoc,
        ctx,
        (s, m) => {
          throw new PxpError(s, m);
        },
        'enforce'
      )
    ).toThrow(PxpError);
  });

  it('mode override off skips validation when env is enforce', () => {
    process.env.API_PARAM_VALIDATION = 'enforce';
    expect(() =>
      maybeValidateApiDocParams(
        { flowId: 'x' } as unknown as Record<string, unknown>,
        schemaDoc,
        ctx,
        (s, m) => {
          throw new PxpError(s, m);
        },
        'off'
      )
    ).not.toThrow();
  });
});

describe('getApiParamValidationOverride', () => {
  it('returns method override over class default', () => {
    @ValidateApiParams({ mode: 'warn' })
    class C1 {
      @ValidateApiParams({ mode: 'enforce' })
      m1(): void {
        return;
      }
      m2(): void {
        return;
      }
    }
    expect(getApiParamValidationOverride(C1, 'm1')).toBe('enforce');
    expect(getApiParamValidationOverride(C1, 'm2')).toBe('warn');
  });
});
