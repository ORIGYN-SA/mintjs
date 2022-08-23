import { Principal } from '@dfinity/principal';
export type KnownError<T> = {
  error_code: T;
};

export type OrigynError = {
  text: string;
  error: object;
  number: BigInt;
  flag_point: string;
};

export type OrigynResponse<T, K> = {
  ok?: T;
  err?: OrigynError | KnownError<K>;
};

export type AccountType = {
  account_id: string;
  principal: Principal;
  extensible: any;
  account: {
    of: Principal;
    sub_account?: number[];
  };
};
export type TokenType = {
  ic?: {
    fee: BigInt;
    decimals: BigInt;
    canister: Principal;
    standard: {
      ICRC?: null;
      EXTFungible: null;
      DIP20: null;
      Ledger: null;
    };
    symbol: string;
  };
  extensible?: any;
};

export type EscrowRecord = {
  token: TokenType;
  token_id: string;
  seller: AccountType;
  lock_to_date?: number;
  buyer: AccountType;
  amount: BigInt;
  sale_id?: string;
  account_hash?: number[];
  balances?: [AccountType, BigInt][];
};

export type StakeRecord = {
  staker: AccountType;
  token_id: string;
  amount: BigInt;
};
