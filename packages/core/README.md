# PXP-ND core
- Core module for pxp-nd

## 1.2.90

Release de resiliencia de conexiones a base de datos. **Sin configurar nada, el comportamiento es idéntico a 1.2.89**: todas las opciones nuevas son opt-in.

### `db.acquireTimeoutMs` (opcional)

Tiempo máximo, en milisegundos, que una ruta no-readonly espera para obtener una conexión del pool antes de fallar.

```ts
new PxpApp({
  // ...
  db: { acquireTimeoutMs: 5000 },
});
```

- Si vence, la request responde **503** con el mensaje `Database acquire timeout after N ms`.
- Solo se dispara cuando el pool está agotado; con conexiones libres no agrega latencia.
- `undefined` o `0` = comportamiento legacy (espera indefinida).

### Decorador `@Timeout(ms)` y opción de ruta `timeoutMs`

Límite de duración por ruta. Se puede usar el decorador o la opción en la definición de la ruta:

```ts
@Post('/save')
@Timeout(30000)
async save(params: any) { /* ... */ }

// o bien
@Post('/save', { timeoutMs: 30000 })
```

Al vencer el tiempo:
- La request responde **503**.
- La conexión física se destruye, por lo que MySQL hace rollback de la transacción abierta.
- El handler puede seguir ejecutándose en segundo plano, pero ya sin acceso a la base de datos.
- Se registra la línea de log `[pxp-core] timeout-abandoned <transactionCode>`.

Sin decorador ni `timeoutMs`, la ruta no tiene límite (igual que 1.2.89).

### Fix: fuga de conexiones si falla `startTransaction()`

Antes, si `startTransaction()` lanzaba un error, la conexión obtenida del pool nunca se liberaba y con el tiempo el pool quedaba agotado. Ahora la conexión se libera siempre.

### Clon del controlador por request (`controllerForRequest`)

Portado desde 1.2.89: cada request trabaja sobre un clon del controlador, de modo que requests concurrentes ya no se pisan `user`, `headers` ni `transactionCode`.

### Proyectos afectados

Dependen de core con `^1.2.x`, así que tomarán esta versión en su próximo `npm install`:

- tempo
- conductor-nd
- go-pxp-nd
- Api_Boa_ND
- electrica360_nd
- cleaners-pxp-nd

Sin configurar `db.acquireTimeoutMs` ni `@Timeout`/`timeoutMs`, ninguno de ellos cambia de comportamiento respecto a 1.2.89.
