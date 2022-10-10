import { OrigynResponse } from '../types/origynTypes';
import { OrigynClient } from '../origynClient';
import { Principal } from '@dfinity/principal';

export const getNftCollection = async (
  arg?: [string, BigInt?, BigInt?][],
): Promise<OrigynResponse<CollectionInfoType, GetCollectionErrors>> => {
  try {
    const actor = OrigynClient.getInstance().actor;
    const response: any = await actor.collection_nft_origyn(arg ?? []);
    if (response.ok || response.error) {
      return response;
    } else {
      return { err: { error_code: GetCollectionErrors.UNKNOWN_ERROR } };
    }
  } catch (e: any) {
    return { err: { error_code: GetCollectionErrors.CANT_REACH_CANISTER, text: e.message } };
  }
};

export enum GetCollectionErrors {
  UNKNOWN_ERROR,
  CANT_REACH_CANISTER,
}

export type CollectionInfoType = {
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
