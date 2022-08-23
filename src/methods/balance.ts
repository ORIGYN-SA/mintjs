import { Principal } from '@dfinity/principal';
import { OrigynClient } from '../origynClient';
import { EscrowRecord, OrigynResponse, StakeRecord } from '../types/origynTypes';

export const getNftBalance = async (): Promise<OrigynResponse<BalanceOfNftOrigyn, GetBalanceErrors>> => {
  try {
    const { actor, principal } = OrigynClient.getInstance();

    if (!principal) {
      return { err: { error_code: GetBalanceErrors.NO_PRINCIPAL_PROVIDED } };
    }

    const response = await actor.balance_of_nft_origyn({ principal });
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
