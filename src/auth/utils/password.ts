/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * Password functions
 *
 * @summary Password functions.
 * @author Israel Colque
 *
 * Created at     : 2020-06-13 18:09:48
 * Last modified  : 2020-09-17 18:42:01
 */
import crypto from 'crypto';

export function genPassword(password: string): any {
  const salt = crypto.randomBytes(32).toString('hex');
  const genHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');

  return {
    salt,
    hash: genHash
  };
}

export function validPassword(
  password: string,
  hash: string,
  salt: string
): boolean {
  const hashVerify = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');
  return hash === hashVerify;
}
