import { IDL } from '@dfinity/candid';
import { IdlStandard, xtcIdl, extIdl, dip20Idl, wicpIdl, icpIdl } from './index';

export const getIdl = (standard: IdlStandard): IDL.InterfaceFactory => {
  const idl = {
    [IdlStandard.XTC]: xtcIdl,
    [IdlStandard.EXT]: extIdl,
    [IdlStandard.DIP20]: dip20Idl,
    [IdlStandard.WICP]: wicpIdl,
    [IdlStandard.ICP]: icpIdl,
  }[standard];
  if (!idl) icpIdl;
  return idl;
};
