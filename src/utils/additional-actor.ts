import origynIdl from '../idls/origyn-nft.did';
import { DEFAULT_AGENT, DEFAULT_LOCAL_AGENT } from '../origynClient';
import { Actor } from '@dfinity/agent';

export const createAdditionalActor = (isMainNet: boolean, canisterId: string) => {
  return Actor.createActor(origynIdl, {
    canisterId,
    agent: isMainNet ? DEFAULT_AGENT : DEFAULT_LOCAL_AGENT,
  });
};
