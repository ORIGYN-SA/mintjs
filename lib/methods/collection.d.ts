import { OrigynResponse } from '../types/origynTypes';
import { Principal } from '@dfinity/principal';
export declare const getNftCollection: (arg?: [string, BigInt?, BigInt?][]) => Promise<OrigynResponse<CollectionInfoType, GetCollectionErrors>>;
export declare enum GetCollectionErrors {
    UNKNOWN_ERROR = 0,
    CANT_REACH_CANISTER = 1
}
export declare type CollectionInfoType = {
    multi_canister_count?: BigInt;
    managers?: Principal[];
    owner?: Principal;
    metadata?: any;
    logo?: string;
    name?: string;
    network?: Principal;
    fields?: [string, BigInt?, BigInt?][];
    token_ids_count?: BigInt;
    available_space?: BigInt;
    multi_canister?: Principal[];
    token_ids?: string[];
    total_supply?: BigInt;
    symbol?: string;
    allocated_storage?: BigInt;
};
