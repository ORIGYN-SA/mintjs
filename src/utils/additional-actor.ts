import { idlFactory } from '../idls/origyn-nft.did';
import { getActor } from '@origyn/actor-reference';
import { OrigynNftCanister } from '../types';
import { OrigynNftActor } from '../types/methods';

export const createAdditionalActor = async (isMainNet: boolean, canisterId: string): Promise<OrigynNftActor> => {
  return await getActor<OrigynNftCanister>({
    canisterId,
    idlFactory,
    isLocal: !isMainNet,
  });
};
