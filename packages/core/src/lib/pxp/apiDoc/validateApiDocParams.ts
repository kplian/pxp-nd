/*****************************************************************************
 * Copyright(c) 2026 Qorus Inc
 * All rights reserved
 *****************************************************************************
 * NAME: validateApiDocParams.ts
 * DESCRIPTION: Optional validation of route params against @ApiDoc params schema (warn or enforce).
 * REVISIONS:
 * ISSUE              DATE          AUTHOR          DESCRIPTION
 * security_flow_ownership_4  06-Nov-2026   Rensi Arteaga   Permissive validation using ApiDoc JSON Schema subset.
 *****************************************************************************/

import type { ApiDocSchema, ApiDocSpec } from './ApiDocTypes';

export type ApiParamValidationMode = 'off' | 'warn' | 'enforce';

/** Env: API_PARAM_VALIDATION=off | warn | enforce (default warn = log only, do not reject). */
export function getApiParamValidationMode(): ApiParamValidationMode {
  const v = (process.env.API_PARAM_VALIDATION || 'warn').toLowerCase().trim();
  if (v === 'off' || v === 'false' || v === '0') {
    return 'off';
  }
  if (v === 'enforce' || v === 'error' || v === 'strict') {
    return 'enforce';
  }
  return 'warn';
}

function isProbablyFileUpload(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const o = value as Record<string, unknown>;
  if (typeof o.mimetype !== 'string') {
    return false;
  }
  return (
    typeof o.name === 'string' ||
    Buffer.isBuffer((o as { data?: unknown }).data) ||
    typeof (o as { mv?: unknown }).mv === 'function'
  );
}

/** Drop multipart file fields so JSON Schema does not treat them as plain objects. */
function stripFileLikeValues(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(input)) {
    if (isProbablyFileUpload(val)) {
      continue;
    }
    out[key] = val;
  }
  return out;
}

function normalizeScalar(value: unknown, schema: ApiDocSchema): { ok: boolean; value?: unknown; reason?: string } {
  const t = schema.type;
  if (t === 'string') {
    if (typeof value === 'string') {
      if (schema.minLength !== undefined && value.length < schema.minLength) {
        return { ok: false, reason: `minLength ${schema.minLength}` };
      }
      if (schema.maxLength !== undefined && value.length > schema.maxLength) {
        return { ok: false, reason: `maxLength ${schema.maxLength}` };
      }
      if (schema.pattern !== undefined) {
        try {
          const re = new RegExp(schema.pattern);
          if (!re.test(value)) {
            return { ok: false, reason: `pattern` };
          }
        } catch {
          return { ok: false, reason: 'invalid pattern in schema' };
        }
      }
      if (schema.enum !== undefined && !(schema.enum as unknown[]).includes(value)) {
        return { ok: false, reason: 'not in enum' };
      }
      return { ok: true, value };
    }
    if (value === null || value === undefined) {
      return { ok: false, reason: 'expected string' };
    }
    return { ok: false, reason: 'expected string' };
  }

  if (t === 'integer') {
    let n: number;
    if (typeof value === 'number' && Number.isInteger(value)) {
      n = value;
    } else if (typeof value === 'string' && /^-?\d+$/.test(value.trim())) {
      n = parseInt(value, 10);
    } else {
      return { ok: false, reason: 'expected integer' };
    }
    if (schema.minimum !== undefined && n < schema.minimum) {
      return { ok: false, reason: `minimum ${schema.minimum}` };
    }
    if (schema.maximum !== undefined && n > schema.maximum) {
      return { ok: false, reason: `maximum ${schema.maximum}` };
    }
    if (schema.enum !== undefined && !(schema.enum as unknown[]).includes(n)) {
      return { ok: false, reason: 'not in enum' };
    }
    return { ok: true, value: n };
  }

  if (t === 'number') {
    let n: number;
    if (typeof value === 'number' && !Number.isNaN(value)) {
      n = value;
    } else if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
      n = Number(value);
    } else {
      return { ok: false, reason: 'expected number' };
    }
    if (schema.minimum !== undefined && n < schema.minimum) {
      return { ok: false, reason: `minimum ${schema.minimum}` };
    }
    if (schema.maximum !== undefined && n > schema.maximum) {
      return { ok: false, reason: `maximum ${schema.maximum}` };
    }
    if (schema.enum !== undefined && !(schema.enum as unknown[]).includes(n)) {
      return { ok: false, reason: 'not in enum' };
    }
    return { ok: true, value: n };
  }

  if (t === 'boolean') {
    if (typeof value === 'boolean') {
      return { ok: true, value };
    }
    if (value === 'true' || value === '1' || value === 1) {
      return { ok: true, value: true };
    }
    if (value === 'false' || value === '0' || value === 0) {
      return { ok: true, value: false };
    }
    return { ok: false, reason: 'expected boolean' };
  }

  return { ok: false, reason: `unsupported schema type ${t}` };
}

function validateAgainstSchema(
  value: unknown,
  schema: ApiDocSchema,
  path: string
): string[] {
  const errors: string[] = [];

  if (schema.type === 'object') {
    if (value === null || value === undefined || typeof value !== 'object' || Array.isArray(value)) {
      errors.push(`${path || '$'}: expected object`);
      return errors;
    }
    const obj = value as Record<string, unknown>;
    const props = schema.properties || {};
    const additional = schema.additionalProperties;

    for (const key of Object.keys(obj)) {
      if (!(key in props)) {
        if (additional === false) {
          errors.push(`${path}.${key}: unknown property`);
        } else if (additional && typeof additional === 'object' && additional.type) {
          errors.push(...validateAgainstSchema(obj[key], additional as ApiDocSchema, `${path}.${key}`));
        }
      }
    }

    if (schema.required) {
      for (const req of schema.required) {
        if (!(req in obj) || obj[req] === undefined) {
          errors.push(`${path}.${req}: required`);
        }
      }
    }

    for (const key of Object.keys(props)) {
      if (!(key in obj) || obj[key] === undefined) {
        continue;
      }
      errors.push(...validateAgainstSchema(obj[key], props[key], `${path}.${key}`));
    }

    return errors;
  }

  if (schema.type === 'array') {
    if (!Array.isArray(value)) {
      errors.push(`${path || '$'}: expected array`);
      return errors;
    }
    if (!schema.items) {
      return errors;
    }
    value.forEach((item, i) => {
      errors.push(...validateAgainstSchema(item, schema.items as ApiDocSchema, `${path}[${i}]`));
    });
    return errors;
  }

  const scalar = normalizeScalar(value, schema);
  if (!scalar.ok) {
    errors.push(`${path || '$'}: ${scalar.reason || 'invalid value'}`);
  }
  return errors;
}

export interface ApiParamValidationContext {
  module: string;
  controller: string;
  methodName: string;
  path: string;
  /** Stable per-request id (set in PxpApp before routes). Join with insertLog payload via __pxpRequestId. */
  pxpRequestId?: string;
  /** Correlation id when already known (e.g. after insertLog). */
  logId?: number | string;
}

/**
 * Validates merged params (query + body + route) against @ApiDoc params when present.
 * - warn: console.warn structured JSON line, never throw
 * - enforce: throw PxpError 400 on mismatch
 * - off: no-op
 */
export function maybeValidateApiDocParams(
  params: Record<string, unknown>,
  apiDoc: ApiDocSpec | null | undefined,
  ctx: ApiParamValidationContext,
  throwFn: (status: number, message: string) => void,
  /** When set (e.g. from @ValidateApiParams), overrides API_PARAM_VALIDATION for this route. */
  modeOverride?: ApiParamValidationMode
): void {
  const mode = modeOverride !== undefined ? modeOverride : getApiParamValidationMode();
  if (mode === 'off' || !apiDoc || !apiDoc.params) {
    return;
  }

  const schema = apiDoc.params;
  if (schema.type !== 'object') {
    return;
  }

  const candidate = stripFileLikeValues(params);
  const errors = validateAgainstSchema(candidate, schema, '$');

  if (errors.length === 0) {
    return;
  }

  const payload = {
    level: 'WARNING',
    code: 'API_PARAM_VALIDATION',
    mode,
    operationId: apiDoc.operationId || null,
    ...ctx,
    errors,
    message: 'Request params do not match @ApiDoc schema',
  };

  if (mode === 'warn') {
    console.warn(`[pxp-core] ${JSON.stringify(payload)}`);
    return;
  }

  throwFn(400, `${payload.message}: ${errors.join('; ')}`);
}
