import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export class CryptoVault {
  private key: Buffer;

  constructor(sharedKey?: Buffer) {
    this.key = sharedKey || randomBytes(32);
  }

  public getKey(): Buffer {
    return this.key;
  }

  public encrypt(plainText: string): { iv: string; cipherText: string; authTag: string } {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return {
      iv: iv.toString('hex'),
      cipherText: encrypted,
      authTag,
    };
  }

  public decrypt(encrypted: { iv: string; cipherText: string; authTag: string }): string {
    const decipher = createDecipheriv('aes-256-gcm', this.key, Buffer.from(encrypted.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(encrypted.authTag, 'hex'));

    let decrypted = decipher.update(encrypted.cipherText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
