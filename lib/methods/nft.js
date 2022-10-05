"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetNftErrors = exports.getNftHistory = exports.mintNft = exports.stageNft = exports.getNft = void 0;
const origynClient_1 = require("../origynClient");
const getNft = async (token_id) => {
    try {
        const actor = origynClient_1.OrigynClient.getInstance().actor;
        const response = await actor.nft_origyn(token_id);
        if (response.ok || response.error) {
            return response;
        }
        else {
            return { err: { error_code: GetNftErrors.UNKNOWN_ERROR } };
        }
    }
    catch (e) {
        return { err: { error_code: GetNftErrors.CANT_REACH_CANISTER } };
    }
};
exports.getNft = getNft;
const stageNft = async (token_id) => {
    try {
        const actor = origynClient_1.OrigynClient.getInstance().actor;
        const response = await actor?.stage_nft_origyn({
            metadata: {
                Class: [{ name: 'id', value: { Text: token_id }, immutable: true }],
            },
        });
        if (response.ok || response.error) {
            return response;
        }
        else {
            return { err: { error_code: GetNftErrors.UNKNOWN_ERROR } };
        }
    }
    catch (e) {
        return { err: { error_code: GetNftErrors.CANT_REACH_CANISTER } };
    }
};
exports.stageNft = stageNft;
const mintNft = async (token_id, principal) => {
    try {
        const actor = origynClient_1.OrigynClient.getInstance().actor;
        const response = await actor.mint_nft_origyn(token_id, {
            principal,
        });
        if (response.ok || response.error) {
            return response;
        }
        else {
            return { err: { error_code: GetNftErrors.UNKNOWN_ERROR } };
        }
    }
    catch (e) {
        return { err: { error_code: GetNftErrors.CANT_REACH_CANISTER } };
    }
};
exports.mintNft = mintNft;
const getNftHistory = async (token_id, start, end) => {
    try {
        const actor = origynClient_1.OrigynClient.getInstance().actor;
        const args = {
            start: start ? [start] : [],
            end: end ? [end] : [],
        };
        const response = await actor.history_nft_origyn(token_id, args.start, args.end);
        if (response.ok || response.error) {
            return response;
        }
        else {
            return { err: { error_code: GetNftErrors.UNKNOWN_ERROR } };
        }
    }
    catch (e) {
        return { err: { error_code: GetNftErrors.CANT_REACH_CANISTER } };
    }
};
exports.getNftHistory = getNftHistory;
var GetNftErrors;
(function (GetNftErrors) {
    GetNftErrors[GetNftErrors["UNKNOWN_ERROR"] = 0] = "UNKNOWN_ERROR";
    GetNftErrors[GetNftErrors["CANT_REACH_CANISTER"] = 1] = "CANT_REACH_CANISTER";
})(GetNftErrors = exports.GetNftErrors || (exports.GetNftErrors = {}));
