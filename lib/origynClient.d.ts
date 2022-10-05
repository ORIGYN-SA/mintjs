import { Principal } from '@dfinity/principal';
import { HttpAgent, Identity, ActorSubclass } from '@dfinity/agent';
export declare const DEFAULT_AGENT: HttpAgent;
export declare class OrigynClient {
    private static _instance;
    private _actor;
    private _principal;
    private _canisterId;
    private constructor();
    static getInstance: () => OrigynClient;
    get actor(): any;
    get principal(): Principal | string | undefined;
    get canisterId(): string;
    init: (canisterId?: string, auth?: AuthType) => void;
    set principal(principal: Principal | string | undefined);
}
declare type AuthType = {
    actor?: ActorSubclass<any>;
    identity?: Identity;
    agent?: HttpAgent;
};
export {};
