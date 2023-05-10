import { Principal } from '@dfinity/principal';
import { Actor, HttpAgent, Identity } from '@dfinity/agent';
import { idlFactory } from './idls/origyn-nft.did';
import { PrivateIdentityKey } from './types/methods';
import { OrigynNftCanister } from './types';
import { ActorOptions, IdentitySecret, getActor, getIdentity } from '@origyn/actor-reference';
import { OrigynNftActor } from './types/methods';

const getSecret = (key: PrivateIdentityKey): IdentitySecret | undefined => {
  if (key.seed) {
    return { seed: key.seed };
  } else if (key.identityFile) {
    if (typeof key.identityFile === 'string') {
      return { pem: key.identityFile };
    } else if (Buffer.isBuffer(key.identityFile)) {
      return { pemBuffer: key.identityFile };
    }
  }
  return undefined;
};

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
      throw new Error('Origyn client not initialized');
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

    if (canisterId) {
      this._canisterId = canisterId;
    }

    if (auth?.actor) {
      this._actor = auth.actor;
    } else {
      const options: ActorOptions<OrigynNftCanister> = {
        canisterId: this._canisterId,
        idlFactory,
        isLocal: !isProd,
      };

      if (auth?.key) {
        const secret = getSecret(auth.key);
        if (secret) {
          options.identity = await getIdentity(secret);
        }
      } else if (auth?.identity) {
        options.identity = auth.identity;
      }

      this._actor = await getActor<OrigynNftCanister>(options);
    }

    if (!this._principal) {
      this._principal = auth?.identity?.getPrincipal() || (await Actor.agentOf(this._actor as Actor)?.getPrincipal());
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
