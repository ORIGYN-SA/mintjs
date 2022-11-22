import { AccountType } from './../types/origynTypes';
import { OrigynResponse, IcTokenType, TransactionType } from '../types/origynTypes';
import { OrigynClient } from '../origynClient';
import { OGY_TOKEN } from '../utils/constants';
import { Principal } from '@dfinity/principal';

export const startAuction = async (args: StartAuctionArgs): Promise<OrigynResponse<TransactionType, BaseErrors>> => {
  const { token_id, startPrice, priceStep, buyNowPrice, endDate, ic_token } = args;

  try {
    const actor = OrigynClient.getInstance().actor;
    const response = await actor.market_transfer_nft_origyn({
      token_id,
      sales_config: {
        pricing: {
          auction: {
            start_price: BigInt(startPrice * 1e8),
            token: {
              ic: ic_token ?? OGY_TOKEN,
            },
            reserve: [],
            start_date: BigInt(Math.floor(new Date().getTime() * 1e6)),
            min_increase: {
              amount: BigInt(priceStep * 1e8),
            },
            allow_list: [],
            buy_now: buyNowPrice ? [BigInt(buyNowPrice * 1e8)] : [],
            end_date: BigInt(new Date(endDate).getTime() * 1e6),
            ending: {
              date: BigInt(new Date(endDate).getTime() * 1e6),
            },
          },
        },
        escrow_receipt: [],
      },
    });
    if (response.ok || response.error) {
      return response;
    } else {
      return { err: { error_code: BaseErrors.UNKNOWN_ERROR } };
    }
  } catch (e) {
    return { err: { error_code: BaseErrors.CANT_REACH_CANISTER } };
  }
};

export const sendEscrow = async (args: SendEscrowArgs): Promise<OrigynResponse<TransactionType, SendEscrowErrors>> => {
  const { token_id, amount, sale_id, to, ic_token } = args;

  try {
    const actor = OrigynClient.getInstance().actor;
    const principal = OrigynClient.getInstance().principal;
    if (!principal) {
      return { err: { error_code: SendEscrowErrors.NO_PRINCIPAL } };
    }

    const saleInfo = await actor.sale_info_nft_origyn({ deposit_info: [] });
    const { account_id } = saleInfo?.ok?.deposit_info ?? {};
    if (saleInfo.err || !account_id) {
      return { err: { error_code: SendEscrowErrors.CANT_GET_ACCOUNT_ID } };
    }

    // TODO: send transaction
    const transactionHeight = 0n; // to be taken from transaction response

    const response = await actor.escrow_nft_origyn({
      token_id,
      deposit: {
        token: {
          ic: ic_token ?? OGY_TOKEN,
        },
        trx_id: [{ nat: BigInt(transactionHeight) }],
        seller: {
          to,
        },
        buyer: { principal },
        amount: BigInt(amount * 1e8),
        sale_id: sale_id ? [sale_id] : [],
      },
      lock_to_date: [],
    });

    if (response.ok || response.error) {
      return response;
    } else {
      return { err: { error_code: SendEscrowErrors.UNKNOWN_ERROR } };
    }
  } catch (e) {
    return { err: { error_code: SendEscrowErrors.CANT_REACH_CANISTER } };
  }
};

export const endSale = async (token_id: string): Promise<OrigynResponse<any, BaseErrors>> => {
  try {
    const actor = OrigynClient.getInstance().actor;
    const response = await actor.end_sale_nft_origyn(token_id);
    if (response.ok || response.error) {
      return response;
    } else {
      return { err: { error_code: BaseErrors.UNKNOWN_ERROR } };
    }
  } catch (e) {
    return { err: { error_code: BaseErrors.CANT_REACH_CANISTER } };
  }
};

export const withdrawEscrow = async (escrow: EscrowActionArgs): Promise<OrigynResponse<any, BaseErrors>> => {
  try {
    const { actor, principal } = OrigynClient.getInstance();
    if (!principal) {
      return { err: { error_code: BaseErrors.NO_PRINCIPAL } };
    }
    const response = await actor?.sale_nft_origyn({
      withdraw: {
        escrow: {
          ...escrow,
          withdraw_to: { principal },
        },
      },
    });
    if (response.ok || response.error) {
      return response;
    } else {
      return { err: { error_code: BaseErrors.UNKNOWN_ERROR } };
    }
  } catch (e) {
    return { err: { error_code: BaseErrors.CANT_REACH_CANISTER } };
  }
};

export const rejectEscrow = async (escrow: EscrowActionArgs): Promise<OrigynResponse<any, BaseErrors>> => {
  try {
    const { actor, principal } = OrigynClient.getInstance();
    if (!principal) {
      return { err: { error_code: BaseErrors.NO_PRINCIPAL } };
    }
    const response = await actor?.sale_nft_origyn({
      reject: {
        escrow: {
          ...escrow,
          withdraw_to: { principal },
        },
      },
    });
    if (response.ok || response.error) {
      return response;
    } else {
      return { err: { error_code: BaseErrors.UNKNOWN_ERROR } };
    }
  } catch (e) {
    return { err: { error_code: BaseErrors.CANT_REACH_CANISTER } };
  }
};

export enum BaseErrors {
  UNKNOWN_ERROR,
  CANT_REACH_CANISTER,
  NO_PRINCIPAL,
}

export enum SendEscrowErrors {
  UNKNOWN_ERROR,
  CANT_REACH_CANISTER,
  CANT_GET_ACCOUNT_ID,
  NO_PRINCIPAL,
}

type EscrowActionArgs = {
  amount: BigInt;
  buyer: AccountType;
  ic_token?: IcTokenType;
  seller: AccountType;
  token_id: string;
};
type StartAuctionArgs = {
  buyNowPrice?: number;
  endDate: number;
  priceStep: number;
  startPrice: number;
  token_id: string;
  ic_token?: IcTokenType;
};

type SendEscrowArgs = {
  ic_token?: IcTokenType;
  lock_to_date?: number;
  sale_id?: string;
  to: Principal | string;
  token_id: string;
  amount: number;
};
