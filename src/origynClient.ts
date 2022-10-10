import { Principal } from '@dfinity/principal';
import { Actor, HttpAgent, Identity, ActorSubclass } from '@dfinity/agent';
import origynIdl from './idls/origyn_nft_reference.did';
import { IC_HOST, IS_NODE_CONTEXT, ORIGYN_CANISTER_ID } from './utils/constants';
import { PrivateIdentityKey } from './types/origynTypes';
import { getActor } from './methods/wallet/actor';

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

  public init = async (canisterId?: string, auth?: AuthType): Promise<void> => {
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
        fetch: IS_NODE_CONTEXT ? require('node-fetch') : fetch,
      });
    }

    if (auth?.key) {
      this._actor = await getActor(false, auth.key, this._canisterId);
    }

    // TODO: add this back
    // if (process.env.NODE_ENV !== 'production') {
    //   agent.fetchRootKey().catch((err) => {
    //     /* tslint:disable-next-line */
    //     console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
    //     /* tslint:disable-next-line */
    //     console.error(err);
    //   });
    // }

    this._actor = Actor.createActor(origynIdl, {
      canisterId: this._canisterId?.length ? this._canisterId : ORIGYN_CANISTER_ID,
      agent,
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
  key?: PrivateIdentityKey;
};
