import { IdlStandard } from '../../idls';

export type Token = {
  balance?: number;
  canisterId: string;
  decimals?: number;
  fee?: number;
  icon?: any;
  standard: IdlStandard;
  symbol: string;
};
