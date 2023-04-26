export const ORIGYN_LEDGER_ID = 'jwcfb-hyaaa-aaaaj-aac4q-cai';
export const IC_HOST = 'https://ic0.app/';

export const MAX_STAGE_CHUNK_SIZE = 2_048_000;
export const DEFAULT_MINT_BATCH_SIZE = 10;
export const MAX_CHUNK_UPLOAD_RETRIES = 5;
export const IMMUTABLE = true;

export const IS_NODE_CONTEXT = typeof process !== 'undefined' && process?.release?.name === 'node';
