import { HttpAgent, Identity } from '@dfinity/agent';
export declare const DEFAULT_AGENT: HttpAgent;
export declare const createAgent: (identity?: Identity | Promise<Identity>) => HttpAgent;
