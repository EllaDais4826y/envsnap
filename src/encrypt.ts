import * as crypto from 'crypto';
import { EnvSnapshot } from './snapshot';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

export function deriveKey(passphrase: string, salt: Buffer): Buffer {
  return crypto.scryptSync(passphrase, salt, KEY_LENGTH);
}

export function encryptSnapshot(snapshot: EnvSnapshot, passphrase: string): string {
  const salt = crypto.randomBytes(16);
  const key = deriveKey(passphrase, salt);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const plaintext = JSON.stringify(snapshot);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
}

export function decryptSnapshot(data: string, passphrase: string): EnvSnapshot {
  const buf = Buffer.from(data, 'base64');

  const salt = buf.subarray(0, 16);
  const iv = buf.subarray(16, 32);
  const tag = buf.subarray(32, 32 + TAG_LENGTH);
  const encrypted = buf.subarray(32 + TAG_LENGTH);

  const key = deriveKey(passphrase, salt);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const plaintext = decipher.update(encrypted) + decipher.final('utf8');
  return JSON.parse(plaintext) as EnvSnapshot;
}
