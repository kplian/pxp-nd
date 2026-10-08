/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * Database timeout helpers.
 *
 * @summary Connection acquire timeout, request timeout error and physical connection destroy.
 * @author Favio Figueroa
 *
 * Created at     : 2026-10-08 - Favio Figueroa - EF-23 acquire timeout + @Timeout decorator
 * Last modified  : 2026-10-08 - Favio Figueroa - EF-23 late acquired connection is released to the pool, not destroyed (1.2.91)
 */
import { QueryRunner } from 'typeorm';
import { PxpError } from '../PxpError';

export class DbTimeoutError extends PxpError {
  kind: 'acquire' | 'request';
  timeoutMs: number;
  transactionCode: string | undefined;

  constructor(kind: 'acquire' | 'request', ms: number, transactionCode?: string) {
    super(503, `Database ${kind} timeout after ${ms} ms`);
    this.kind = kind;
    this.timeoutMs = ms;
    this.transactionCode = transactionCode;
  }
}

/**
 * Destroys the physical driver connection behind the query runner (so it never
 * goes back to the pool with an open transaction) and then releases the runner.
 * mysql2 removes a destroyed connection from its pool on its own.
 */
export async function destroyQueryRunner(queryRunner: QueryRunner): Promise<void> {
  const databaseConnection = (queryRunner as any).databaseConnection;
  if (databaseConnection && typeof databaseConnection.destroy === 'function') {
    databaseConnection.destroy();
  }
  try {
    await queryRunner.release();
  } catch (_) {
    // the connection was already destroyed; release failures are expected here
  }
}

/**
 * Acquires the query runner connection with an upper bound.
 * When ms is undefined or <= 0 this is exactly `await queryRunner.connect()`.
 */
export async function connectWithTimeout(
  queryRunner: QueryRunner,
  ms: number | undefined,
  transactionCode?: string
): Promise<void> {
  if (!ms || ms <= 0) {
    await queryRunner.connect();
    return;
  }

  let timer: NodeJS.Timeout | undefined;
  let timedOut = false;
  const connectPromise = queryRunner.connect();
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      timedOut = true;
      reject(new DbTimeoutError('acquire', ms, transactionCode));
    }, ms);
  });

  try {
    await Promise.race([connectPromise, timeoutPromise]);
  } catch (err) {
    if (timedOut) {
      // A late connection is pristine (no transaction was started on it), so it is returned
      // to the pool instead of destroyed: destroying it would force the driver to open a new
      // one and keep a residual queue after a burst. destroyQueryRunner stays for the
      // request-timeout path, where a transaction may still be open.
      connectPromise
        .then(async () => {
          try {
            await queryRunner.release();
          } catch (releaseErr) {
            console.error('[pxp-core] late connection release failed', releaseErr && (releaseErr as Error).message);
          }
        })
        .catch(() => {});
    }
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
