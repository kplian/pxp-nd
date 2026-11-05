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
 ******************************************************************************/

import { ApiDocRouteEntry } from './ApiDocTypes';

let entries: ApiDocRouteEntry[] = [];

export function clearApiDocRegistry(): void {
  entries = [];
}

export function registerApiDocRoute(entry: ApiDocRouteEntry): void {
  entries.push(entry);
}

export function getApiDocRegistry(): ApiDocRouteEntry[] {
  return entries.slice();
}
