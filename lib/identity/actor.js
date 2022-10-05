"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createActor = exports.createAgent = void 0;
const agent_1 = require("@dfinity/agent");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const constants_1 = require("../utils/constants");
const origyn_nft_reference_1 = __importDefault(require("../idls/origyn_nft_reference"));
const DEFAULT_AGENT = new agent_1.HttpAgent({ fetch: cross_fetch_1.default, host: constants_1.IC_HOST });
const createAgent = (identity) => {
    if (identity) {
        return new agent_1.HttpAgent({
            identity,
            host: 'https://boundary.ic0.app/',
            fetch: cross_fetch_1.default,
        });
    }
    return DEFAULT_AGENT;
};
exports.createAgent = createAgent;
const createActor = (agent) => {
    const actor = agent_1.Actor.createActor(origyn_nft_reference_1.default, {
        canisterId: constants_1.ORIGYN_CANISTER_ID,
        agent,
    });
    return actor;
};
exports.createActor = createActor;
