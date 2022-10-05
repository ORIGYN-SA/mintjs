import { Principal } from '@dfinity/principal';
import { EscrowRecord, OrigynResponse, StakeRecord } from '../types/origynTypes';
export declare const getNftBalance: (principal?: Principal | string) => Promise<OrigynResponse<BalanceOfNftOrigyn, GetBalanceErrors>>;
export declare enum GetBalanceErrors {
    UNKNOWN_ERROR = 0,
    CANT_REACH_CANISTER = 1,
    NO_PRINCIPAL_PROVIDED = 2
}
export declare type BalanceOfNftOrigyn = {
    nfts: string[];
    offers: EscrowRecord[];
    sales: EscrowRecord[];
    stake: StakeRecord[];
    multi_canister?: Principal[];
    escrow: EscrowRecord[];
};
