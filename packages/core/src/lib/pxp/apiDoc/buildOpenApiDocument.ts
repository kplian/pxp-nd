/*****************************************************************************
 * Copyright(c) 2026 Qorus Inc
 * All rights reserved
 *****************************************************************************
 * NAME: buildOpenApiDocument.ts
 * DEVELOPER: Rensi Arteaga
 * DESCRIPTION: Build OpenAPI 3.0.3 from documented routes only.
 * REVISIONS:
 * Date Change      ID              Author              Description
 * -----------      -----------     --------------      ------------------------------------
 * 05-Nov-2026                      Rensi Arteaga       Created
 ******************************************************************************/

import { createHash } from 'crypto';
import { ApiDocRouteEntry, ApiDocSchema, ApiDocSpec } from './ApiDocTypes';

const FORBIDDEN_VENDOR_KEYS = new Set(['vendorId', '_vendorId']);

export function schemaContainsVendorField(schema: ApiDocSchema | undefined): boolean {
  if (!schema || typeof schema !== 'object') {
    return false;
  }
  if (schema.properties) {
    for (const key of Object.keys(schema.properties)) {
      if (FORBIDDEN_VENDOR_KEYS.has(key)) {
        return true;
      }
      if (schemaContainsVendorField(schema.properties[key])) {
        return true;
      }
    }
  }
  if (schema.items && schemaContainsVendorField(schema.items)) {
    return true;
  }
  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    return schemaContainsVendorField(schema.additionalProperties);
  }
  return false;
}

function defaultOperationId(entry: ApiDocRouteEntry, spec: ApiDocSpec, postSuffix: boolean): string {
  if (spec.operationId) {
    return postSuffix && !spec.operationId.endsWith('.post')
      ? `${spec.operationId}.post`
      : spec.operationId;
  }
  const base = `${entry.module}.${entry.controller}.${entry.methodName}`;
  return postSuffix ? `${base}.post` : base;
}

function parametersFromObjectSchema(schema: ApiDocSchema): unknown[] {
  const properties = schema.properties || {};
  const required = new Set(schema.required || []);
  return Object.keys(properties).map((name) => ({
    name,
    in: 'query',
    required: required.has(name),
    schema: properties[name],
    description: properties[name].description,
  }));
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    return Object.keys(obj)
      .sort()
      .reduce((acc: Record<string, unknown>, key) => {
        acc[key] = sortKeysDeep(obj[key]);
        return acc;
      }, {});
  }
  return value;
}

export function hashOpenApiPaths(paths: Record<string, unknown>): string {
  const canonical = JSON.stringify(sortKeysDeep(paths));
  return createHash('sha256').update(canonical).digest('hex').slice(0, 12);
}

/**
 * Only routes with @ApiDoc appear. Undocumented controllers are omitted.
 */
export function buildOpenApiDocument(
  entries: ApiDocRouteEntry[],
  info: { title?: string; description?: string } = {}
): Record<string, unknown> {
  const documented = entries.filter((e) => e.apiDoc != null);
  const methodPairs = new Map<string, Set<string>>();
  for (const entry of documented) {
    const key = `${entry.module}.${entry.controller}.${entry.methodName}`;
    if (!methodPairs.has(key)) {
      methodPairs.set(key, new Set());
    }
    methodPairs.get(key).add(String(entry.httpMethod).toLowerCase());
  }

  const paths: Record<string, Record<string, unknown>> = {};

  for (const entry of documented) {
    const spec = entry.apiDoc as ApiDocSpec;
    const pairKey = `${entry.module}.${entry.controller}.${entry.methodName}`;
    const verbs = methodPairs.get(pairKey);
    const http = String(entry.httpMethod).toLowerCase();
    const postSuffix = verbs != null && verbs.has('get') && verbs.has('post') && http === 'post';
    const operationId = defaultOperationId(entry, spec, postSuffix);
    const tags = spec.tags && spec.tags.length ? spec.tags : [entry.module];

    const operation: Record<string, unknown> = {
      operationId,
      summary: spec.summary,
      description: spec.description,
      tags,
      'x-read-only': spec.readOnly,
      'x-permission': spec.permission === undefined ? null : spec.permission,
    };

    if (http === 'get' || http === 'delete') {
      operation.parameters = parametersFromObjectSchema(spec.params);
    } else {
      operation.requestBody = {
        required: true,
        content: {
          'application/json': {
            schema: spec.params,
          },
        },
      };
    }

    operation.responses = {
      '200': {
        description: 'Success',
        ...(spec.response
          ? { content: { 'application/json': { schema: spec.response } } }
          : {}),
      },
    };

    if (!paths[entry.path]) {
      paths[entry.path] = {};
    }
    paths[entry.path][http] = operation;
  }

  const sortedPathKeys = Object.keys(paths).sort();
  const sortedPaths: Record<string, unknown> = {};
  for (const key of sortedPathKeys) {
    sortedPaths[key] = paths[key];
  }

  const version = hashOpenApiPaths(sortedPaths);

  return {
    openapi: '3.0.3',
    info: {
      title: info.title || 'PXP ND API',
      description: info.description || 'Documented controller methods',
      version,
    },
    paths: sortedPaths,
  };
}
