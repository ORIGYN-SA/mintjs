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
      EXTFungible?: null;
      DIP20?: null;
      Ledger?: null;
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

export type TransactionIdType = {
  nat?: BigInt;
  text?: string;
  extensible?: any;
};

export type TransactionType = {
  token_id: string;
  txn_type: {
    escrow_deposit?: {
      token: TokenType;
      token_id: string;
      trx_id: TransactionIdType;
      seller: AccountType;
      extensible: any;
      buyer: AccountType;
      amount: BigInt;
    };
    canister_network_updated?: {
      network: Principal;
      extensible: any;
    };
    escrow_withdraw?: {
      fee: BigInt;
      token: TokenType;
      token_id: string;
      trx_id: TransactionIdType;
      seller: AccountType;
      extensible: any;
      buyer: AccountType;
      amount: BigInt;
    };
    canister_managers_updated?: {
      managers: Principal[];
      extensible: any;
    };
    auction_bid?: {
      token: TokenType;
      extensible: any;
      buyer: AccountType;
      amount: BigInt;
      sale_id: string;
    };
    burn?: null;
    data?: null;
    sale_ended?: {
      token: TokenType;
      seller: AccountType;
      extensible: any;
      buyer: AccountType;
      amount: BigInt;
      sale_id?: string;
    };
    mint?: {
      to: AccountType;
      from: AccountType;
      sale?: { token: TokenType; amount: BigInt };
      extensible: any;
    };
    extensible: any;
    owner_transfer?: {
      to: AccountType;
      from: AccountType;
      extensible: any;
    };
    sale_opened?: {
      pricing: PricingConfigType;
      extensible: any;
      sale_id: string;
    };
    canister_owner_updated?: {
      owner: Principal;
      extensible: any;
    };
    sale_withdraw?: {
      fee: BigInt;
      token: TokenType;
      token_id: string;
      trx_id: TransactionIdType;
      seller: AccountType;
      extensible: any;
      buyer: AccountType;
      amount: BigInt;
    };
  };
  timestamp: number;
  index: BigInt;
};

export type PricingConfigType = {
  flat?: { token: TokenType; amount: BigInt };
  extensible?: { candyClass?: null };
  instant?: null;
  auction?: AuctionConfigType;
  dutch?: {
    start_price: BigInt;
    reserve?: BigInt;
    decay_per_hour: number;
  };
};

export type AuctionConfigType = {
  start_price: BigInt;
  token: TokenType;
  reserve?: BigInt;
  start_date: number;
  min_increase: {
    amount?: BigInt;
    percentage?: number;
  };
  allow_list?: Principal[];
  buy_now?: BigInt;
  ending: {
    waitForQuiet?: {
      max: BigInt;
      date: number;
      fade: number;
      extention: BigInt;
    };
    date?: number;
  };
};

export type IcTokenType = {
  canister: Principal;
  decimals: BigInt;
  fee: BigInt;
  standard: {
    DIP20?: null;
    EXTFungible?: null;
    ICRC1?: null;
    Ledger?: null;
  };
  symbol: string;
};
