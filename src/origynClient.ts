import { Actor, HttpAgent, Identity } from '@dfinity/agent';
import origynIdl from './idls/origyn_nft_reference';
import { IC_HOST, ORIGYN_CANISTER_ID } from './utils/constants';
import fetch from 'cross-fetch';

export const DEFAULT_AGENT = new HttpAgent({ fetch, host: IC_HOST });

export class OrigynClient {
  private static _instance: OrigynClient;
  private _actor: any;

  private constructor() {}

  public static getInstance = () => {
    if (OrigynClient._instance) {
      return OrigynClient._instance;
    }

    OrigynClient._instance = new OrigynClient();
    return OrigynClient._instance;
  };

  public get actor() {
    if (!this._actor) {
      this.init();
    }
    return this._actor;
  }

  public init = (auth?: Actor | HttpAgent | Identity): void => {
    let agent = DEFAULT_AGENT;
    if (auth) {
      if ('getPrincipal' in auth) {
        agent =
          'call' in auth
            ? auth
            : new HttpAgent({
                // @ts-ignore
                auth,
                host: 'https://boundary.ic0.app/',
                fetch,
              });
      } else {
        this._actor = auth;
        return;
      }
    }
    this._actor = Actor.createActor(origynIdl, {
      canisterId: ORIGYN_CANISTER_ID,
      agent: agent,
    });
  };
}
