import { HttpAgent, ActorMethod, ActorSubclass, Identity } from '@dfinity/agent';
export declare const createAgent: (identity?: Identity | Promise<Identity>) => HttpAgent;
export declare const createActor: (agent: HttpAgent) => ActorSubclass<Record<string, ActorMethod<unknown[], unknown>>>;
