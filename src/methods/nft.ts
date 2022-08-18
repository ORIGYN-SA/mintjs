import { createActor, createAgent } from '../identity/actor';
import { OrigynResponse } from '../types/origynTypes';

export const getNft = async (token_id: string): Promise<OrigynResponse<NftInfoStable, GetNftErrors>> => {
  try {
    const actor = createActor(createAgent());
    const response: any = await actor.nft_origyn(token_id);
    if (response.ok || response.error) {
      console.log(response);
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
