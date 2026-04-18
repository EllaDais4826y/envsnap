import { encryptSnapshot, decryptSnapshot } from './encrypt';
import { EnvSnapshot } from './snapshot';

const mockSnapshot: EnvSnapshot = {
  name: 'test-snap',
  timestamp: '2024-01-01T00:00:00.000Z',
  variables: {
    NODE_ENV: 'production',
    API_KEY: 'super-secret-key',
    PORT: '3000',
  },
};

describe('encryptSnapshot', () => {
  it('returns a base64 string', () => {
    const result = encryptSnapshot(mockSnapshot, 'passphrase123');
    expect(typeof result).toBe('string');
    expect(() => Buffer.from(result, 'base64')).not.toThrow();
  });

  it('produces different output on each call (random IV/salt)', () => {
    const a = encryptSnapshot(mockSnapshot, 'passphrase123');
    const b = encryptSnapshot(mockSnapshot, 'passphrase123');
    expect(a).not.toBe(b);
  });
});

describe('decryptSnapshot', () => {
  it('round-trips a snapshot correctly', () => {
    const encrypted = encryptSnapshot(mockSnapshot, 'my-secret');
    const decrypted = decryptSnapshot(encrypted, 'my-secret');
    expect(decrypted).toEqual(mockSnapshot);
  });

  it('throws with wrong passphrase', () => {
    const encrypted = encryptSnapshot(mockSnapshot, 'correct-pass');
    expect(() => decryptSnapshot(encrypted, 'wrong-pass')).toThrow();
  });

  it('throws with tampered ciphertext', () => {
    const encrypted = encryptSnapshot(mockSnapshot, 'passphrase');
    const buf = Buffer.from(encrypted, 'base64');
    buf[buf.length - 1] ^= 0xff;
    expect(() => decryptSnapshot(buf.toString('base64'), 'passphrase')).toThrow();
  });
});
