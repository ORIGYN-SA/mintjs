import { OrigynResponse, TransactionType } from '../types/origynTypes';
import { Principal } from '@dfinity/principal';
export declare const getNft: (token_id: string) => Promise<OrigynResponse<NftInfoStable, GetNftErrors>>;
export declare const stageNft: (token_id: string) => Promise<OrigynResponse<any, GetNftErrors>>;
export declare const mintNft: (token_id: string, principal: Principal) => Promise<OrigynResponse<any, GetNftErrors>>;
export declare const getNftHistory: (token_id: string, start?: BigInt, end?: BigInt) => Promise<OrigynResponse<TransactionType, GetNftErrors>>;
export declare enum GetNftErrors {
    UNKNOWN_ERROR = 0,
    CANT_REACH_CANISTER = 1
}
declare type NftInfoStable = {
    metadata: any;
    current_sale?: any;
};
export {};
