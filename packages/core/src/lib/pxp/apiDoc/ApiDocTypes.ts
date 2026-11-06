/*****************************************************************************
 * Copyright(c) 2026 Qorus Inc
 * All rights reserved
 *****************************************************************************
 * NAME: ApiDocTypes.ts
 * DEVELOPER: Rensi Arteaga
 * DESCRIPTION: Restricted JSON Schema subset for @ApiDoc (OpenAPI 3.0 + draft-07)
 * REVISIONS:
 * Date Change      ID              Author              Description
 * -----------      -----------     --------------      ------------------------------------
 * 05-Nov-2026                      Rensi Arteaga       Created
 ******************************************************************************/

export type ApiDocSchemaType =
  | 'object'
  | 'array'
  | 'string'
  | 'integer'
  | 'number'
  | 'boolean';

/** Keywords allowed by Tempo spec 04. No $ref, oneOf, anyOf, allOf, nullable, const. */
export interface ApiDocSchema {
  type: ApiDocSchemaType;
  properties?: { [key: string]: ApiDocSchema };
  required?: string[];
  items?: ApiDocSchema;
  enum?: Array<string | number>;
  additionalProperties?: boolean | ApiDocSchema;
  description?: string;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
}

export interface ApiDocSpec {
  operationId?: string;
  summary: string;
  description: string;
  params: ApiDocSchema;
  response?: ApiDocSchema;
  /** Whether the endpoint changes data. Independent of @ReadOnly (transactions). */
  readOnly: boolean;
  permission?: string | null;
  tags?: string[];
}

export interface ApiDocRouteEntry {
  module: string;
  controller: string;
  methodName: string;
  httpMethod: string;
  path: string;
  apiDoc: ApiDocSpec | null;
}
