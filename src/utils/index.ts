import crypto from 'crypto';

export const wait = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(ms);
    }, ms);
  });
};
export const getFileHash = (fileBuffer?: Buffer): string => {
  if (!fileBuffer) return '';

  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
};
