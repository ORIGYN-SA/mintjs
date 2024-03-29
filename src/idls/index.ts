import xtcIdl from './standard/xtc.did';
import extIdl from './standard/ext.did';
import dip20Idl from './standard/dip_20.did';
import wicpIdl from './standard/wicp.did';
import icpIdl from './standard/icp.did';
import origynLedgerIdl from './ledger.did';
import { idlFactory } from './origyn-nft.did';
import phonebookIdl from './phonebook.did';

export * from './getIdl';
export { xtcIdl, extIdl, dip20Idl, wicpIdl, icpIdl, origynLedgerIdl, idlFactory, phonebookIdl };

export enum IdlStandard {
  XTC,
  EXT,
  DIP20,
  WICP,
  ICP,
}
