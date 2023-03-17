import { Principal } from '@dfinity/principal';
import { OrigynClient } from '../origynClient';
import { OrigynResponse } from '../types/methods';
import { BalanceResponse } from '../types/origyn-nft';

export const getNftBalance = async (
  principal?: Principal | string,
): Promise<OrigynResponse<BalanceResponse, GetBalanceErrors>> => {
  try {
    const { actor, principal: _principal } = OrigynClient.getInstance();

    let p: Principal | undefined;

    if (principal) {
      if (typeof principal === 'string') {
        p = Principal.fromText(principal);
      } else {
        p = principal;
      }
    } else if (_principal) {
      if (typeof _principal === 'string') {
        p = Principal.fromText(_principal);
      } else {
        p = _principal;
      }
    }

    if (!p) {
      return { err: { error_code: GetBalanceErrors.NO_PRINCIPAL_PROVIDED } };
    }

    return await actor.balance_of_nft_origyn({ principal: p });
  } catch (e) {
    return { err: { error_code: GetBalanceErrors.CANT_REACH_CANISTER } };
  }
};

export enum GetBalanceErrors {
  UNKNOWN_ERROR,
  CANT_REACH_CANISTER,
  NO_PRINCIPAL_PROVIDED,
}
