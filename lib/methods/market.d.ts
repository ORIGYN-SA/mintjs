import { AccountType } from './../types/origynTypes';
import { OrigynResponse, IcTokenType, TransactionType } from '../types/origynTypes';
import { Principal } from '@dfinity/principal';
export declare const startAuction: (args: StartAuctionArgs) => Promise<OrigynResponse<TransactionType, BaseErrors>>;
export declare const sendEscrow: (args: SendEscrowArgs) => Promise<OrigynResponse<TransactionType, SendEscrowErrors>>;
export declare const endSale: (token_id: string) => Promise<OrigynResponse<any, BaseErrors>>;
export declare const withdrawEscrow: (escrow: EscrowActionArgs) => Promise<OrigynResponse<any, BaseErrors>>;
export declare const rejectEscrow: (escrow: EscrowActionArgs) => Promise<OrigynResponse<any, BaseErrors>>;
export declare enum BaseErrors {
    UNKNOWN_ERROR = 0,
    CANT_REACH_CANISTER = 1,
    NO_PRINCIPAL = 2
}
export declare enum SendEscrowErrors {
    UNKNOWN_ERROR = 0,
    CANT_REACH_CANISTER = 1,
    CANT_GET_ACCOUNT_ID = 2,
    NO_PRINCIPAL = 3
}
declare type EscrowActionArgs = {
    amount: BigInt;
    buyer: AccountType;
    ic_token?: IcTokenType;
    seller: AccountType;
    token_id: string;
};
declare type StartAuctionArgs = {
    buyNowPrice?: number;
    endDate: number;
    priceStep: number;
    startPrice: number;
    token_id: string;
    ic_token?: IcTokenType;
};
declare type SendEscrowArgs = {
    ic_token?: IcTokenType;
    lock_to_date?: number;
    sale_id?: string;
    to: Principal | string;
    token_id: string;
    amount: number;
};
export {};
