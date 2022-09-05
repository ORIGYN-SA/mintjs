import { OrigynResponse, TransactionType } from '../types/origynTypes';
import { OrigynClient } from '../origynClient';
import { Principal } from '@dfinity/principal';

export const getNft = async (token_id: string): Promise<OrigynResponse<NftInfoStable, GetNftErrors>> => {
  try {
    const actor = OrigynClient.getInstance().actor;
    const response: any = await actor.nft_origyn(token_id);
    if (response.ok || response.error) {
      return response;
    } else {
      return { err: { error_code: GetNftErrors.UNKNOWN_ERROR } };
    }
  } catch (e) {
    return { err: { error_code: GetNftErrors.CANT_REACH_CANISTER } };
  }
};

export const stageNft = async (token_id: string): Promise<OrigynResponse<any, GetNftErrors>> => {
  try {
    const actor = OrigynClient.getInstance().actor;
    const response = await actor?.stage_nft_origyn({
      metadata: {
        Class: [{ name: 'id', value: { Text: token_id }, immutable: true }],
      },
    });
    if (response.ok || response.error) {
      return response;
    } else {
      return { err: { error_code: GetNftErrors.UNKNOWN_ERROR } };
    }
  } catch (e) {
    return { err: { error_code: GetNftErrors.CANT_REACH_CANISTER } };
  }
};

export const mintNft = async (token_id: string, principal: Principal): Promise<OrigynResponse<any, GetNftErrors>> => {
  try {
    const actor = OrigynClient.getInstance().actor;
    const response = await actor.mint_nft_origyn(token_id, {
      principal,
    });
    if (response.ok || response.error) {
      return response;
    } else {
      return { err: { error_code: GetNftErrors.UNKNOWN_ERROR } };
    }
  } catch (e) {
    return { err: { error_code: GetNftErrors.CANT_REACH_CANISTER } };
  }
};

export const getNftHistory = async (
  token_id: string,
  start?: BigInt,
  end?: BigInt,
): Promise<OrigynResponse<TransactionType, GetNftErrors>> => {
  try {
    const actor = OrigynClient.getInstance().actor;
    const args = {
      start: start ? [start] : [],
      end: end ? [end] : [],
    };
    const response = await actor.history_nft_origyn(token_id, args.start, args.end);
    if (response.ok || response.error) {
      return response;
    } else {
      return { err: { error_code: GetNftErrors.UNKNOWN_ERROR } };
    }
  } catch (e) {
    return { err: { error_code: GetNftErrors.CANT_REACH_CANISTER } };
  }
};

export enum GetNftErrors {
  UNKNOWN_ERROR,
  CANT_REACH_CANISTER,
}

type NftInfoStable = {
  metadata: any;
  current_sale?: any;
};
