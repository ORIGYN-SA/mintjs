import { OrigynResponse } from '../types/methods';
import { OrigynClient } from '../origynClient';
import { createAdditionalActor } from '../utils/additional-actor';
import { ManageStorageResponse } from '../types';
import { Principal } from '@dfinity/principal';

export const getCanisterCycles = async (canisterId?: string): Promise<OrigynResponse<BigInt, GetCanisterError>> => {
  try {
    const { canisterId: currentCanisterId, isMainNet } = OrigynClient.getInstance();

    let { actor } = OrigynClient.getInstance();

    if (canisterId && canisterId !== currentCanisterId) {
      actor = await createAdditionalActor(isMainNet, canisterId);
    }

    const cycles = await actor.cycles();
    if (cycles) {
      return { ok: cycles };
    } else {
      return { err: { error_code: GetCanisterError.UNKNOWN_ERROR } };
    }
  } catch (e: any) {
    return { err: { error_code: GetCanisterError.CANT_REACH_CANISTER, text: e.message } };
  }
};

export const getCanisterAvailableStorage = async (
  canisterId?: string,
): Promise<OrigynResponse<BigInt, GetCanisterError>> => {
  try {
    const { canisterId: currentCanisterId, isMainNet } = OrigynClient.getInstance();
    let { actor } = OrigynClient.getInstance();

    if (canisterId && canisterId !== currentCanisterId) {
      actor = await createAdditionalActor(isMainNet, canisterId);
    }

    const response = await actor.storage_info_nft_origyn();
    if ('ok' in response) {
      return { ok: response?.ok?.available_space };
    } else {
      return { err: { error_code: GetCanisterError.UNKNOWN_ERROR } };
    }
  } catch (e: any) {
    return { err: { error_code: GetCanisterError.CANT_REACH_CANISTER, text: e.message } };
  }
};

export const setCanisterStorage = async (
  storage: number,
): Promise<OrigynResponse<ManageStorageResponse, GetCanisterError>> => {
  try {
    const { actor } = OrigynClient.getInstance();

    const response = await actor.manage_storage_nft_origyn({
      configure_storage: {
        heap: [BigInt(storage)],
      },
    });
    if ('ok' in response) {
      return { ok: response.ok };
    } else {
      return { err: { error_code: GetCanisterError.UNKNOWN_ERROR } };
    }
  } catch (e: any) {
    return { err: { error_code: GetCanisterError.CANT_REACH_CANISTER, text: e.message } };
  }
};

export const setCanisterOwner = async (
  principal: Principal | string,
): Promise<OrigynResponse<boolean, GetCanisterError>> => {
  try {
    const { actor } = OrigynClient.getInstance();

    if (typeof principal === 'string') {
      principal = Principal.fromText(principal);
    }
    const response = await actor.collection_update_nft_origyn({
      UpdateOwner: principal,
    });

    if ('ok' in response) {
      return { ok: true };
    } else {
      return { err: { error_code: GetCanisterError.UNKNOWN_ERROR } };
    }
  } catch (e: any) {
    return { err: { error_code: GetCanisterError.CANT_REACH_CANISTER, text: e.message } };
  }
};

export enum GetCanisterError {
  UNKNOWN_ERROR = 'UNKNOWN_EROR',
  CANT_REACH_CANISTER = 'CANT_REACH_CANISTER',
}
