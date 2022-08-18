import {
  HttpAgent,
  Actor,
  ActorMethod,
  ActorSubclass,
  Identity,
} from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';
import fetch from 'cross-fetch';
import { ORIGYN_CANISTER_ID, IC_HOST } from '../utils/constants';
import origynIdl from '../idls/origyn_nft_reference';

const DEFAULT_AGENT = new HttpAgent({ fetch, host: IC_HOST });

export const createAgent = (identity?: Identity | Promise<Identity>) => {
  if (identity) {
    return new HttpAgent({
      identity,
      host: 'https://boundary.ic0.app/',
      fetch,
    });
  }
  return DEFAULT_AGENT;
};

export const createActor = (agent: HttpAgent) => {
  const actor = Actor.createActor(origynIdl, {
    canisterId: ORIGYN_CANISTER_ID,
    agent,
  });
  return actor;
};
