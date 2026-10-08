# PXP-ND core
- Core module for pxp-nd

## 1.2.91

Correcciones encontradas en las pruebas de carga con la base de datos caída. Sin cambios de API ni de configuración.

### A. La respuesta de error ya no se cuelga si falla el log

Antes, en ambos handlers de ruta (con y sin autenticación), el `insertLog` del error se esperaba antes de llamar a `errorMiddleware`. Con la base caída `insertLog` fallaba, la excepción escapaba del `catch`, nunca se enviaba la respuesta y la request quedaba colgada hasta el timeout del cliente/ALB (en el log: `unhandledRejection PxpError: connect ECONNREFUSED`).

Ahora el log de error va en su propio `try/catch`: `errorMiddleware` **siempre** responde con el error original. Si el log falla se escribe `[pxp-core] error log failed <mensaje>` en consola y la respuesta sale sin `logId`.

### B. El log de éxito ya no genera `unhandledRejection`

El `insertLog` del camino de éxito de `ormMethodWrapper` no se espera (fire-and-forget) y no tenía `.catch`: si fallaba, el rechazo quedaba sin manejar y en Node ≥15 sin handler mata el proceso. Ahora tiene `.catch` que escribe `[pxp-core] success log failed <mensaje>`. (Los wrappers `Procedure` y `Sql` no registran log, no aplica.)

### C. La conexión que llega tarde tras un acquire timeout vuelve al pool

Con `db.acquireTimeoutMs`, cuando la conexión llegaba después del timeout se destruía. Esa conexión está limpia (nunca se abrió transacción), así que destruirla obligaba a mysql2 a abrir otra y dejaba una cola residual (observado: health en 503 unos 6 s después de una ráfaga de 40 requests). Ahora se devuelve al pool con `queryRunner.release()`. El timeout de request (`@Timeout`) sigue destruyendo la conexión, porque ahí sí puede haber una transacción abierta.

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

### Tests (`npm test`)

`test/db-timeouts.test.ts` (jest + ts-jest) prueba contra un MySQL **real y desechable**: comportamiento legado sin `db`, `db.acquireTimeoutMs` con un pool `write` de 1 conexión, y `@Timeout` (503, sin transacción abierta en `innodb_trx`, nada commiteado, el pool se recupera).

```bash
docker run --rm -d --name pxp-core-test-mysql -e MYSQL_ROOT_PASSWORD=test -e MYSQL_DATABASE=pxptest -p 33306:3306 mysql:8
npm test
docker stop pxp-core-test-mysql
```

Variables: `TEST_DB_HOST` (127.0.0.1), `TEST_DB_PORT` (33306), `TEST_DB_USER` (root), `TEST_DB_PASSWORD` (test), `TEST_DB_NAME` (pxptest). Usar solo una BD desechable: los tests crean las tablas `tsec_log` y `pxp_timeout_probe` y ocupan el pool con `SLEEP`, así que no apuntarlos a dev/beta/prod compartidas. Si la BD no responde, la suite se marca `skipped` (nunca falla por falta de BD).

`test/error-path.test.ts` no necesita MySQL: `insertLog` está mockeado para fallar y verifica que una ruta que lanza `PxpError(400)` responde 400 con el mensaje original (sin colgarse) y que el fallo del log de éxito no produce `unhandledRejection`.
