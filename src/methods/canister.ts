import { OrigynNftActor, OrigynResponse } from '../types/methods';
import { OrigynClient } from '../origynClient';
import { createAdditionalActor } from '../utils/additional-actor';

export const getCansiterCycles = async (canisterId?: string): Promise<OrigynResponse<BigInt, GetCanisterError>> => {
  try {
    let { actor, canisterId: currentCanisterId } = OrigynClient.getInstance();

    if (canisterId && canisterId !== currentCanisterId) {
      actor = createAdditionalActor(canisterId) as unknown as OrigynNftActor;
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

export const getCansiterAvailableStorage = async (
  canisterId?: string,
): Promise<OrigynResponse<BigInt, GetCanisterError>> => {
  try {
    let { actor, canisterId: currentCanisterId } = OrigynClient.getInstance();

    if (canisterId && canisterId !== currentCanisterId) {
      actor = createAdditionalActor(canisterId) as unknown as OrigynNftActor;
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

export enum GetCanisterError {
  UNKNOWN_ERROR = 'UNKNOWN_EROR',
  CANT_REACH_CANISTER = 'CANT_REACH_CANISTER',
}
