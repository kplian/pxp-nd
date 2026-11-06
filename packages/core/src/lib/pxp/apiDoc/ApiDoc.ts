/*****************************************************************************
 * Copyright(c) 2026 Qorus Inc
 * All rights reserved
 *****************************************************************************
 * NAME: ApiDoc.ts
 * DEVELOPER: Rensi Arteaga
 * DESCRIPTION: Method and class decorators that attach OpenAPI descriptions.
 * REVISIONS:
 * Date Change      ID              Author              Description
 * -----------      -----------     --------------      ------------------------------------
 * 05-Nov-2026                      Rensi Arteaga       Created
 ******************************************************************************/

import { ApiDocSpec } from './ApiDocTypes';

function storeApiDoc(constructor: Function, methodName: string, doc: ApiDocSpec): void {
  if (!Reflect.hasMetadata('apiDoc', constructor)) {
    Reflect.defineMetadata('apiDoc', {}, constructor);
  }
  const map = Reflect.getMetadata('apiDoc', constructor) as { [id: string]: ApiDocSpec };
  map[methodName] = doc;
  Reflect.defineMetadata('apiDoc', map, constructor);
}

/** Description next to a controller method. */
export function ApiDoc(doc: ApiDocSpec) {
  return (target: any, propertyKey: string): void => {
    storeApiDoc(target.constructor, propertyKey, doc);
  };
}

/**
 * Description for a Model CRUD method that is not declared on the class
 * (add, list, edit, delete).
 */
export function ApiDocFor(methodName: string, doc: ApiDocSpec): ClassDecorator {
  return (target: Function): void => {
    storeApiDoc(target, methodName, doc);
  };
}

export function getControllerApiDocs(constructor: Function): { [id: string]: ApiDocSpec } {
  return (
    (Reflect.getMetadata('apiDoc', constructor) as { [id: string]: ApiDocSpec }) || {}
  );
}
