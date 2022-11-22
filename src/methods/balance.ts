import { Principal } from '@dfinity/principal';
import { OrigynClient } from '../origynClient';
import { EscrowRecord, OrigynResponse, StakeRecord } from '../types/origynTypes';

export const getNftBalance = async (
  principal?: Principal | string,
): Promise<OrigynResponse<BalanceOfNftOrigyn, GetBalanceErrors>> => {
  try {
    const { actor, principal: _principal } = OrigynClient.getInstance();

    if (principal && typeof principal === 'string') {
      principal = Principal.fromText(principal);
    }

    if (!principal && !_principal) {
      return { err: { error_code: GetBalanceErrors.NO_PRINCIPAL_PROVIDED } };
    }

    const response = await actor.balance_of_nft_origyn({ principal: principal ?? _principal });
    if (response.ok || response.error) {
      return response;
    } else {
      return { err: { error_code: GetBalanceErrors.UNKNOWN_ERROR } };
    }
  } catch (e) {
    return { err: { error_code: GetBalanceErrors.CANT_REACH_CANISTER } };
  }
};

export enum GetBalanceErrors {
  UNKNOWN_ERROR,
  CANT_REACH_CANISTER,
  NO_PRINCIPAL_PROVIDED,
}

export type BalanceOfNftOrigyn = {
  nfts: string[];
  offers: EscrowRecord[];
  sales: EscrowRecord[];
  stake: StakeRecord[];
  multi_canister?: Principal[];
  escrow: EscrowRecord[];
};
