import { Principal } from '@dfinity/principal';
import { Actor, HttpAgent, Identity } from '@dfinity/agent';
import { idlFactory } from './idls/origyn-nft.did';
import { FETCH, IC_HOST } from './utils/constants';
import { PrivateIdentityKey, OrigynNftActor } from './types/methods';
import { getActor } from './methods/wallet/actor';
import { getIdentity } from './methods/wallet/identity';
import { error, warn } from './utils/log';

export const DEFAULT_AGENT = new HttpAgent({
  fetch: FETCH,
  host: IC_HOST,
});

export const DEFAULT_LOCAL_AGENT = new HttpAgent({
  fetch: FETCH,
  host: 'http://localhost:8000',
});

export class OrigynClient {
  private static _instance: OrigynClient;
  private _actor: OrigynNftActor | undefined;
  private _principal: Principal | undefined;
  private _canisterId: string = '';
  private _isMainNet: boolean = false;

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
      this._actor = Actor.createActor(idlFactory, {
        canisterId: this._canisterId,
        agent: DEFAULT_AGENT,
      });
    }
    return this._actor;
  }

  public get principal() {
    return this._principal;
  }

  public get canisterId() {
    return this._canisterId;
  }

  public get isMainNet() {
    return this._isMainNet;
  }

  public init = async (isProd: boolean = true, canisterId?: string, auth?: AuthType): Promise<void> => {
    this._isMainNet = isProd;
    let agent = auth?.agent ?? isProd ? DEFAULT_AGENT : DEFAULT_LOCAL_AGENT;
    if (canisterId) this._canisterId = canisterId;

    if (auth?.actor) {
      this._actor = auth.actor;
    } else if (auth?.key) {
      [this._actor, agent] = await getActor(isProd, auth.key, this._canisterId);
      this._principal = (await getIdentity(auth.key)).getPrincipal();
    } else if (auth?.identity) {
      agent = new HttpAgent({
        identity: auth.identity,
        host: isProd ? 'https://boundary.ic0.app' : 'http://localhost:8000',
        fetch: FETCH,
      });
      this._actor = Actor.createActor(idlFactory, {
        canisterId: this._canisterId,
        agent,
      });
    } else {
      this._actor = Actor.createActor(idlFactory, {
        canisterId: this._canisterId,
        agent,
      });
    }

    if (!isProd) {
      agent.fetchRootKey().catch((err) => {
        warn('Unable to fetch root key. Check to ensure that your local replica is running');
        error(err);
      });
    }
  };

  public set principal(principal: Principal | string | undefined) {
    if (typeof principal === 'string') {
      this._principal = Principal.fromText(principal);
    } else {
      this._principal = principal;
    }
  }
}

export type AuthType = {
  actor?: OrigynNftActor;
  identity?: Identity;
  agent?: HttpAgent;
  key?: PrivateIdentityKey;
};
