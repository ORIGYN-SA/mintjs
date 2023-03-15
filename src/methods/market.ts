import { AccountType } from '../types/methods';
import { OrigynResponse, IcTokenType } from '../types/methods';
import { OrigynClient } from '../origynClient';
import { OGY_TOKEN } from '../utils/constants';
import { Principal } from '@dfinity/principal';
import {
  Account,
  CandyValue,
  ICTokenSpec,
  ManageSaleRequest,
  ManageSaleResponse,
  MarketTransferRequest,
  MarketTransferRequestReponse,
} from '../types/origyn-nft';

const convertToken = (token: IcTokenType): ICTokenSpec => {
  let standard: any = { ICRC1: null };
  if (token.standard.Ledger) {
    standard = { Ledger: null };
  } else if (token.standard.DIP20) {
    standard = { DIP20: null };
  } else if (token.standard.EXTFungible) {
    standard = { EXTFungible: null };
  }

  return {
    fee: token.fee,
    decimals: token.decimals,
    canister: token.canister,
    standard,
    symbol: token.symbol,
  };
};

const convertAccount = (account: AccountType): Account => {
  if (account.account_id) {
    return { account_id: account.account_id };
  } else if (account.principal) {
    return { principal: account.principal };
  } else if (account.extensible) {
    return { extensible: account.extensible as CandyValue };
  } else if (account.account && account.account.of && account.account.sub_account) {
    return {
      account: {
        owner: account.account.of,
        sub_account: [account.account.sub_account],
      },
    };
  }

  throw new Error('invalid account');
};

export const startAuction = async (
  args: StartAuctionArgs,
): Promise<OrigynResponse<MarketTransferRequestReponse, BaseErrors>> => {
  const { token_id, startPrice, priceStep, buyNowPrice, endDate, ic_token } = args;

  try {
    const actor = OrigynClient.getInstance().actor;

    const params: MarketTransferRequest = {
      token_id,
      sales_config: {
        pricing: {
          auction: {
            start_price: BigInt(startPrice * 10 ** Number(ic_token?.decimals)),
            token: {
              ic: convertToken(ic_token ?? OGY_TOKEN),
            },
            reserve: [],
            start_date: BigInt(Math.floor(new Date().getTime() * 1e6)),
            min_increase: {
              amount: BigInt(priceStep * 10 ** Number(ic_token?.decimals)),
            },
            allow_list: [],
            buy_now: buyNowPrice ? [BigInt(buyNowPrice * 10 ** Number(ic_token?.decimals))] : [],
            ending: {
              date: BigInt(new Date(endDate).getTime() * 1e6),
            },
          },
        },
        escrow_receipt: [],
        broker_id: args.brokerId || [],
      },
    };

    const response = await actor.market_transfer_nft_origyn(params);
    if ('ok' in response || 'err' in response) {
      return response;
    } else {
      return { err: { error_code: BaseErrors.UNKNOWN_ERROR } };
    }
  } catch (e) {
    return { err: { error_code: BaseErrors.CANT_REACH_CANISTER } };
  }
};

export const sendEscrow = async (
  args: SendEscrowArgs,
): Promise<OrigynResponse<ManageSaleResponse, SendEscrowErrors>> => {
  const { token_id, amount, sale_id, to, ic_token } = args;

  try {
    const actor = OrigynClient.getInstance().actor;
    const buyer = OrigynClient.getInstance().principal;
    if (!buyer) {
      return { err: { error_code: SendEscrowErrors.NO_PRINCIPAL } };
    }

    const saleInfo = await actor.sale_info_nft_origyn({ deposit_info: [] });
    if ('err' in saleInfo) {
      return saleInfo;
    } else if ('deposit_info' in saleInfo.ok) {
      const { account_id } = saleInfo?.ok?.deposit_info;
      if (!account_id) {
        return { err: { error_code: SendEscrowErrors.CANT_GET_ACCOUNT_ID } };
      }
    }

    // TODO: send transaction
    const transactionHeight = 0n; // to be taken from transaction response

    const request: ManageSaleRequest = {
      escrow_deposit: {
        token_id,
        deposit: {
          token: {
            ic: convertToken(ic_token ?? OGY_TOKEN),
          },
          trx_id: [{ nat: BigInt(transactionHeight) }],
          seller: {
            principal: typeof to === 'string' ? Principal.fromText(to) : to,
          },
          buyer: { principal: typeof buyer === 'string' ? Principal.fromText(buyer) : buyer },
          amount: BigInt(amount * 10 ** Number(ic_token?.decimals)),
          sale_id: sale_id ? [sale_id] : [],
        },
        lock_to_date: [],
      },
    };

    const response = await actor.sale_nft_origyn(request);
    if ('ok' in response || 'err' in response) {
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
    const response = await actor.sale_nft_origyn({ end_sale: token_id });
    if ('ok' in response || 'err' in response) {
      return response;
    } else {
      return { err: { error_code: BaseErrors.UNKNOWN_ERROR } };
    }
  } catch (e) {
    return { err: { error_code: BaseErrors.CANT_REACH_CANISTER } };
  }
};

export const withdrawEscrow = async (
  escrow: EscrowActionArgs,
): Promise<OrigynResponse<ManageSaleResponse, BaseErrors>> => {
  try {
    const { actor, principal } = OrigynClient.getInstance();
    if (!principal) {
      return { err: { error_code: BaseErrors.NO_PRINCIPAL } };
    }
    const response = await actor?.sale_nft_origyn({
      withdraw: {
        escrow: {
          amount: escrow.amount,
          token_id: escrow.token_id,
          token: { ic: convertToken(escrow.ic_token || OGY_TOKEN) },
          buyer: convertAccount(escrow.buyer),
          seller: convertAccount(escrow.seller),
          withdraw_to: { principal: typeof principal === 'string' ? Principal.fromText(principal) : principal },
        },
      },
    });
    if ('ok' in response || 'err' in response) {
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

    const request: ManageSaleRequest = {
      withdraw: {
        reject: {
          // TODO: does a default token make sense, or do we need to
          // break backward compat and require a token in the params?
          token: { ic: convertToken(escrow.ic_token || OGY_TOKEN) },
          token_id: escrow.token_id,
          seller: convertAccount(escrow.seller),
          buyer: convertAccount(escrow.buyer),
        },
      },
    };

    const response = await actor?.sale_nft_origyn(request);
    if ('ok' in response || 'err' in response) {
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
  amount: bigint;
  buyer: AccountType;
  ic_token?: IcTokenType;
  seller: AccountType;
  token_id: string;
};

// TODO: change number to bigint for all currency fields to support
// large numbers then update function implementation.
type StartAuctionArgs = {
  buyNowPrice?: number;
  endDate: number;
  priceStep: number;
  startPrice: number;
  token_id: string;
  ic_token?: IcTokenType;
  brokerId?: [] | [Principal];
};

// TODO: change number to bigint for amount to support
// large numbers then update function implementation.
type SendEscrowArgs = {
  ic_token?: IcTokenType;
  lock_to_date?: number;
  sale_id?: string;
  to: Principal | string;
  token_id: string;
  amount: number;
};
