"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrigynClient = exports.DEFAULT_AGENT = void 0;
const principal_1 = require("@dfinity/principal");
const agent_1 = require("@dfinity/agent");
const origyn_nft_reference_1 = __importDefault(require("./idls/origyn_nft_reference"));
const constants_1 = require("./utils/constants");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
exports.DEFAULT_AGENT = new agent_1.HttpAgent({ fetch: cross_fetch_1.default, host: constants_1.IC_HOST });
class OrigynClient {
    constructor() {
        this._canisterId = '';
        this.init = (canisterId, auth) => {
            let agent = auth?.agent ?? exports.DEFAULT_AGENT;
            if (canisterId)
                this._canisterId = canisterId;
            if (auth?.actor) {
                this._actor = auth.actor;
                return;
            }
            if (auth?.identity) {
                agent = new agent_1.HttpAgent({
                    identity: auth.identity,
                    host: 'https://boundary.ic0.app/',
                    fetch: cross_fetch_1.default,
                });
            }
            if (process.env.NODE_ENV !== 'production') {
                agent.fetchRootKey().catch((err) => {
                    /* tslint:disable-next-line */
                    console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
                    /* tslint:disable-next-line */
                    console.error(err);
                });
            }
            this._actor = agent_1.Actor.createActor(origyn_nft_reference_1.default, {
                canisterId: this._canisterId?.length ? this._canisterId : constants_1.ORIGYN_CANISTER_ID,
                agent,
            });
        };
    }
    get actor() {
        if (!this._actor) {
            this.init();
        }
        return this._actor;
    }
    get principal() {
        return this._principal;
    }
    get canisterId() {
        return this._canisterId;
    }
    set principal(principal) {
        if (typeof principal === 'string') {
            this._principal = principal_1.Principal.fromText(principal);
        }
        else {
            this._principal = principal;
        }
    }
}
exports.OrigynClient = OrigynClient;
OrigynClient.getInstance = () => {
    if (OrigynClient._instance) {
        return OrigynClient._instance;
    }
    OrigynClient._instance = new OrigynClient();
    return OrigynClient._instance;
};
