/// <reference types="node" />
import { Principal } from '@dfinity/principal';
import { Buffer } from 'buffer';
export declare const DERIVATION_PATH = "m/44'/223'/0'/0";
export declare const ACCOUNT_DOMAIN_SEPERATOR = "\naccount-id";
export declare const SUB_ACCOUNT_ZERO: Buffer;
export declare const HARDENED_OFFSET = 2147483648;
export declare const getAccountId: (principal: Principal, subAccount?: number) => string;
