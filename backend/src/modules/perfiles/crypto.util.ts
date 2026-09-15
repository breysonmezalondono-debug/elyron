import * as crypto from 'crypto';

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || 'elyron_academic_data_key_2026';

const KEY = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
const IV_LENGTH = 12;
const SEPARATOR = '.';

export const encryptSensitive = (value: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(value.trim(), 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    iv.toString('base64'),
    tag.toString('base64'),
    encrypted.toString('base64'),
  ].join(SEPARATOR);
};

export const decryptSensitive = (value: string): string => {
  try {
    const [ivB64, tagB64, dataB64] = value.split(SEPARATOR);
    if (!ivB64 || !tagB64 || !dataB64) return value;
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      KEY,
      Buffer.from(ivB64, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
    return Buffer.concat([
      decipher.update(Buffer.from(dataB64, 'base64')),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    return value;
  }
};

export const hashDocumento = (value: string): string =>
  crypto.createHash('sha256').update(value.trim()).digest('hex');
