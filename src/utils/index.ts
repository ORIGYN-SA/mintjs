import crypto from 'crypto';
import { IS_NODE_CONTEXT } from './constants';

export const wait = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(ms);
    }, ms);
  });
};
export const getFileHash = (filePath: string): string => {
  if (IS_NODE_CONTEXT) {
    const fs = require('fs');
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  } else {
    // TODO: for web context
    return '';
  }
};
