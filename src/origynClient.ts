import { Principal } from '@dfinity/principal';
import { Actor, HttpAgent, Identity, ActorSubclass } from '@dfinity/agent';
import origynIdl from './idls/origyn_nft_reference';
import { IC_HOST, ORIGYN_CANISTER_ID } from './utils/constants';
import fetch from 'cross-fetch';

export const DEFAULT_AGENT = new HttpAgent({ fetch, host: IC_HOST });

export class OrigynClient {
  private static _instance: OrigynClient;
  private _actor: any;
  private _principal: Principal | undefined;
  private _canisterId: string = '';

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

  public get principal() {
    return this._principal;
  }

  public get canisterId() {
    return this._canisterId;
  }

  public init = (canisterId?: string, auth?: AuthType): void => {
    let agent = auth?.agent ?? DEFAULT_AGENT;
    if (canisterId) this._canisterId = canisterId;

    if (auth?.actor) {
      this._actor = auth.actor;
      return;
    }

    if (auth?.identity) {
      agent = new HttpAgent({
        identity: auth.identity,
        host: 'https://boundary.ic0.app/',
        fetch,
      });
    }

    if (process.env.NODE_ENV !== 'production') {
      agent.fetchRootKey().catch((err) => {
        console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
        console.error(err);
      });
    }

    this._actor = Actor.createActor(origynIdl, {
      canisterId: this._canisterId?.length ? this._canisterId : ORIGYN_CANISTER_ID,
      agent: agent,
    });
  };

  public set principal(principal: Principal | string | undefined) {
    if (typeof principal === 'string') {
      this._principal = Principal.fromText(principal);
    } else {
      this._principal = principal;
    }
  }
}

type AuthType = {
  actor?: ActorSubclass<any>;
  identity?: Identity;
  agent?: HttpAgent;
};
