"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCollectionErrors = exports.getNftCollection = void 0;
const origynClient_1 = require("../origynClient");
const getNftCollection = async (arg) => {
    try {
        const actor = origynClient_1.OrigynClient.getInstance().actor;
        const response = await actor.collection_nft_origyn(arg ?? []);
        if (response.ok || response.error) {
            return response;
        }
        else {
            return { err: { error_code: GetCollectionErrors.UNKNOWN_ERROR } };
        }
    }
    catch (e) {
        return { err: { error_code: GetCollectionErrors.CANT_REACH_CANISTER } };
    }
};
exports.getNftCollection = getNftCollection;
var GetCollectionErrors;
(function (GetCollectionErrors) {
    GetCollectionErrors[GetCollectionErrors["UNKNOWN_ERROR"] = 0] = "UNKNOWN_ERROR";
    GetCollectionErrors[GetCollectionErrors["CANT_REACH_CANISTER"] = 1] = "CANT_REACH_CANISTER";
})(GetCollectionErrors = exports.GetCollectionErrors || (exports.GetCollectionErrors = {}));
