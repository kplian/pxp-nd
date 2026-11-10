/*****************************************************************************
 * Copyright(c) 2026 Qorus Inc
 * All rights reserved
 *****************************************************************************
 * NAME: apiDocRegistry.ts
 * DEVELOPER: Rensi Arteaga
 * DESCRIPTION: In-memory list of registered controller routes for OpenAPI.
 * REVISIONS:
 * Date Change      ID              Author              Description
 * -----------      -----------     --------------      ------------------------------------
 * 05-Nov-2026                      Rensi Arteaga       Created
 * 10-Nov-2026                      Rensi Arteaga       Dedupe by method and path; mount-only registration
 ******************************************************************************/

import { ApiDocRouteEntry } from './ApiDocTypes';

let entries: ApiDocRouteEntry[] = [];

function routeKey(entry: Pick<ApiDocRouteEntry, 'httpMethod' | 'path'>): string {
  return `${String(entry.httpMethod).toUpperCase()} ${entry.path}`;
}

export function clearApiDocRegistry(): void {
  entries = [];
}

/** Keeps the first entry for a method and path. A later duplicate is ignored. */
export function registerApiDocRoute(entry: ApiDocRouteEntry): void {
  const key = routeKey(entry);
  if (entries.some((existing) => routeKey(existing) === key)) {
    return;
  }
  entries.push(entry);
}

/** Register the routes of a controller PxpApp actually loaded. A hand-built controller is not registered. */
export function registerMountedApiDocs(controller: { apiDocRouteEntries?: ApiDocRouteEntry[] }): void {
  for (const entry of controller.apiDocRouteEntries || []) {
    registerApiDocRoute(entry);
  }
}

export function getApiDocRegistry(): ApiDocRouteEntry[] {
  return entries.slice();
}
