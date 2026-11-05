# How to document a PXP controller (`@ApiDoc`)

From `@pxp-nd/core` **1.2.94**. The OpenAPI document is built from these decorators. **A method without `@ApiDoc` does not appear** in the JSON. There is no `undocumented` list.

Tempo will serve the document from an authenticated route (for example `GET /api/hq-nd/ApiDescription/openapi`). This package only stores the descriptions and builds the JSON.

---

## 1. Document a method you wrote

Put `@ApiDoc` **on the same method** as `@Get` / `@Post`. Update the description in the same PR when you change parameters or behaviour.

```ts
import { Get, ReadOnly, ApiDoc } from '@pxp-nd/core';

@Get()
@ReadOnly(true)
@ApiDoc({
  summary: 'Lock state of a flow',
  description:
    'Whether the flow is read-only for the user. Vendor comes from the session, not from the request. Returns { flowId, vendorId, code, templateType, readOnly }.',
  params: {
    type: 'object',
    properties: {
      flowId: { type: 'integer', minimum: 1, description: 'Flow id.' },
    },
    required: ['flowId'],
    additionalProperties: false,
  },
  readOnly: true,
  permission: null,
})
async getFlowLockState(params: Record<string, any>): Promise<unknown> {
  // ...
}
```

`operationId` is optional. Default: `{module}.{Controller}.{method}`  
Example: `hq-nd.FlowHQ.getFlowLockState`.

If the **same method** answers GET and POST, the POST operation id gets the suffix `.post`.

---

## 2. Document Model CRUD (`add`, `list`, `edit`, `delete`)

Those routes are created by `@Model` / `Controller`. They are not methods in your file. Use a **class** decorator:

```ts
import { Model, ApiDocFor } from '@pxp-nd/core';

@Model('flow-nd/Flow')
@ApiDocFor('add', {
  summary: 'Create a flow',
  description: 'Creates a flow for the session vendor. Returns the saved row including flowId.',
  params: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 255 },
      templateType: { type: 'string', enum: ['flow', 'funnel'] },
      type: { type: 'string', enum: ['custom', 'template'] },
    },
    required: ['name', 'templateType', 'type'],
    additionalProperties: false,
  },
  readOnly: false,
  permission: null,
})
export default class Flow extends Controller {
  // ...
}
```

---

## 3. Fields of `@ApiDoc`

| Field | Required | Meaning |
| --- | --- | --- |
| `summary` | yes | One line |
| `description` | yes | What it does, main errors, response shape. Say that vendor comes from the session |
| `params` | yes | JSON Schema `type: "object"` of the fields the handler **reads** |
| `readOnly` | yes | `true` if the call **does not change data**. This is **not** `@ReadOnly` (that one is about DB transactions) |
| `permission` | no | `PERM_CODE` or `null`. Use `null` until codes are agreed |
| `response` | no | Schema of a `200` body |
| `operationId` | no | Stable id. Do not change it after clients use it |
| `tags` | no | Defaults to the module name (`hq-nd`, `flow-nd`, …) |

**Do not list `vendorId` or `_vendorId` in `params`.** The session vendor is used.

GET / DELETE: each top-level property of `params` becomes a **query** parameter.  
POST / PUT / PATCH: `params` is the JSON **body**.

---

## 4. Allowed schema keywords

Use only: `type` (one string), `properties`, `required`, `items`, `enum`, `additionalProperties`, `description`, `minimum`, `maximum`, `pattern`, `minLength`, `maxLength`.

Do **not** use: `$ref`, `oneOf`, `anyOf`, `allOf`, `nullable`, `const`, or `type: ['string', 'null']`.

---

## 5. What the client sees

- Only methods with `@ApiDoc` / `@ApiDocFor`.
- `info.version`: 12 hex characters, SHA-256 of the documented `paths`. It changes when a description changes, not when you add an undocumented controller.
- Swagger UI at `/explorer` is **off** unless `API_EXPLORER_ENABLED=Y` (or `apiExplorerEnabled: true` in `PxpApp` config). The UI then loads the **authenticated** OpenAPI URL (`API_EXPLORER_OPENAPI_URL`, default `/api/hq-nd/ApiDescription/openapi`).

---

## 6. Checklist in the PR

- [ ] Description sits next to the method (or `@ApiDocFor` on the class for Model CRUD).
- [ ] `params` matches what the handler actually reads.
- [ ] No `vendorId` / `_vendorId` in the schema.
- [ ] `readOnly` is about **data**, not `@ReadOnly`.
- [ ] If you changed parameters or behaviour of a documented method, you updated `@ApiDoc` in the same PR.
