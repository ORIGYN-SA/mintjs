import origynIdl from '../idls/origyn-nft.did';
import { DEFAULT_AGENT } from '../origynClient';
import { Actor } from '@dfinity/agent';

export const createAdditionalActor = (canisterId: string) => {
  return Actor.createActor(origynIdl, {
    canisterId,
    agent: DEFAULT_AGENT,
  });
};
