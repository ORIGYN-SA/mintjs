/* eslint-disable no-prototype-builtins no-bitwise */
import crc32 from 'buffer-crc32';
import CryptoJS from 'crypto-js';
import { Buffer } from 'buffer';

export const arrayToBuffer = (arrayBuffer) => {
  const buffer = Buffer.alloc(arrayBuffer.byteLength);
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < buffer.length; ++i) {
    buffer[i] = view[i];
  }
  return buffer;
};
export const byteArrayToWordArray = (byteArray: Uint8Array) => {
  const wordArray = [] as any;
  let i;
  for (i = 0; i < byteArray.length; i += 1) {
    wordArray[(i / 4) | 0] |= byteArray[i] << (24 - 8 * i);
  }
  // eslint-disable-next-line
  const result = CryptoJS.lib.WordArray.create(wordArray, byteArray.length);
  return result;
};

export const wordToByteArray = (word, length): number[] => {
  const byteArray: number[] = [];
  const xFF = 0xff;
  if (length > 0) byteArray.push(word >>> 24);
  if (length > 1) byteArray.push((word >>> 16) & xFF);
  if (length > 2) byteArray.push((word >>> 8) & xFF);
  if (length > 3) byteArray.push(word & xFF);

  return byteArray;
};

export const wordArrayToByteArray = (wordArray, length) => {
  if (wordArray.hasOwnProperty('sigBytes') && wordArray.hasOwnProperty('words')) {
    length = wordArray.sigBytes;
    wordArray = wordArray.words;
  }

  let result: any[] = [];
  let bytes;
  let i = 0;
  while (length > 0) {
    bytes = wordToByteArray(wordArray[i], Math.min(4, length));
    length -= bytes.length;
    result = [...result, bytes];
    i++;
  }
  return [].concat.apply([], result);
};

export const intToHex = (val: number) => (val < 0 ? (Number(val) >>> 0).toString(16) : Number(val).toString(16));

export const bufferToHex = (buffer) => {
  return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, '0')).join('');
};

// We generate a CRC32 checksum, and trnasform it into a hexString
export const generateChecksum = (hash: Uint8Array) => {
  const crc = crc32.unsigned(Buffer.from(hash));
  const hex = intToHex(crc);
  return hex.padStart(8, '0');
};

export const formatBytes = (bytes: number, decimals: number = 2): string => {
  // credit: https://stackoverflow.com/a/18650828
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
