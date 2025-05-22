import * as crypto from 'crypto';

const ENCRYPT_ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

export function encrypt(text: string, encryptKey): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ENCRYPT_ALGORITHM,
    Buffer.from(encryptKey),
    iv,
  );
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const ivBase64 = iv.toString('base64');
  return `${ivBase64}:${encrypted}`;
}

export function decrypt(encryptedWithIv: string, encryptKey): string {
  const [ivBase64, encrypted] = encryptedWithIv.split(':');
  if (!ivBase64 || !encrypted) {
    throw new Error('Invalid enrtyped token format');
  }
  const iv = Buffer.from(ivBase64, 'base64');
  const decipher = crypto.createDecipheriv(
    ENCRYPT_ALGORITHM,
    Buffer.from(encryptKey),
    iv,
  );
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
