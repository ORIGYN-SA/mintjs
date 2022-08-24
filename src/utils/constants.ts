import { IcTokenType } from './../types/origynTypes';
import { Principal } from '@dfinity/principal';

export const ORIGYN_CANISTER_ID = 'frfol-iqaaa-aaaaj-acogq-cai';
export const ORIGYN_LEDGER_ID = 'jwcfb-hyaaa-aaaaj-aac4q-cai';
export const IC_HOST = 'https://ic0.app/';

export const OGY_TOKEN: IcTokenType = {
  fee: 200_000n,
  decimals: 8n,
  canister: Principal.fromText(ORIGYN_LEDGER_ID),
  standard: {
    Ledger: null,
  },
  symbol: 'OGY',
};
