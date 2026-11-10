/*****************************************************************************
 * Copyright(c) 2026 Qorus Inc
 * All rights reserved
 *****************************************************************************
 * NAME: ValidateApiParams.ts
 * DESCRIPTION: Per-class / per-method override for @ApiDoc param validation mode.
 * REVISIONS:
 * Date Change      ID              Author              Description
 * -----------      -----------     --------------      ------------------------------------
 * 06-Nov-2026                      Rensi Arteaga       ValidateApiParams (1.2.97)
 ******************************************************************************/

import type { ApiParamValidationMode } from './validateApiDocParams';

const META_CLASS_DEFAULT = 'apiParamValidationClassDefault';
const META_BY_METHOD = 'apiParamValidationModeByMethod';

export type ValidateApiParamsOptions = {
  /**
   * Validation mode for this route when @ApiDoc.params is present.
   * Overrides API_PARAM_VALIDATION for this method (or whole class if used as class decorator).
   */
  mode: ApiParamValidationMode;
};

function setMethodMode(constructor: Function, methodName: string, mode: ApiParamValidationMode): void {
  const map =
    (Reflect.getMetadata(META_BY_METHOD, constructor) as Record<string, ApiParamValidationMode>) || {};
  map[methodName] = mode;
  Reflect.defineMetadata(META_BY_METHOD, map, constructor);
}

/**
 * Per-method or whole-controller override for param validation (vs global API_PARAM_VALIDATION).
 * Use on the **class** to set default for all methods, and/or on **methods** to override.
 *
 * @example
 * @ValidateApiParams({ mode: 'enforce' })
 * async myStats(params) { ... }
 */
export function ValidateApiParams(opts: ValidateApiParamsOptions): ClassDecorator & MethodDecorator {
  const handler = (target: unknown, propertyKey?: string | symbol): void => {
    const mode = opts.mode;
    if (propertyKey === undefined) {
      const ctor = target as Function;
      Reflect.defineMetadata(META_CLASS_DEFAULT, mode, ctor);
      return;
    }
    const methodName = String(propertyKey);
    const constructor = (target as { constructor: Function }).constructor;
    setMethodMode(constructor, methodName, mode);
  };
  return handler as ClassDecorator & MethodDecorator;
}

/**
 * Effective mode for a handler: method override, else class default, else undefined (use env only).
 */
export function getApiParamValidationOverride(
  constructor: Function,
  methodName: string
): ApiParamValidationMode | undefined {
  const byMethod =
    (Reflect.getMetadata(META_BY_METHOD, constructor) as Record<string, ApiParamValidationMode> | undefined) ||
    {};
  if (byMethod[methodName] !== undefined) {
    return byMethod[methodName];
  }
  const classDefault = Reflect.getMetadata(
    META_CLASS_DEFAULT,
    constructor
  ) as ApiParamValidationMode | undefined;
  if (classDefault !== undefined) {
    return classDefault;
  }
  return undefined;
}
