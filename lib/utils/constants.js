"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OGY_TOKEN = exports.IC_HOST = exports.ORIGYN_LEDGER_ID = exports.ORIGYN_CANISTER_ID = void 0;
const principal_1 = require("@dfinity/principal");
exports.ORIGYN_CANISTER_ID = 'frfol-iqaaa-aaaaj-acogq-cai';
exports.ORIGYN_LEDGER_ID = 'jwcfb-hyaaa-aaaaj-aac4q-cai';
exports.IC_HOST = 'https://ic0.app/';
exports.OGY_TOKEN = {
    fee: 200000n,
    decimals: 8n,
    canister: principal_1.Principal.fromText(exports.ORIGYN_LEDGER_ID),
    standard: {
        Ledger: null,
    },
    symbol: 'OGY',
};
