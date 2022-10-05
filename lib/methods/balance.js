"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetBalanceErrors = exports.getNftBalance = void 0;
const principal_1 = require("@dfinity/principal");
const origynClient_1 = require("../origynClient");
const getNftBalance = async (principal) => {
    try {
        const { actor, principal: _principal } = origynClient_1.OrigynClient.getInstance();
        if (principal && typeof principal === 'string') {
            principal = principal_1.Principal.fromText(principal);
        }
        if (!principal && !_principal) {
            return { err: { error_code: GetBalanceErrors.NO_PRINCIPAL_PROVIDED } };
        }
        const response = await actor.balance_of_nft_origyn({ principal: principal ?? _principal });
        if (response.ok || response.error) {
            return response;
        }
        else {
            return { err: { error_code: GetBalanceErrors.UNKNOWN_ERROR } };
        }
    }
    catch (e) {
        return { err: { error_code: GetBalanceErrors.CANT_REACH_CANISTER } };
    }
};
exports.getNftBalance = getNftBalance;
var GetBalanceErrors;
(function (GetBalanceErrors) {
    GetBalanceErrors[GetBalanceErrors["UNKNOWN_ERROR"] = 0] = "UNKNOWN_ERROR";
    GetBalanceErrors[GetBalanceErrors["CANT_REACH_CANISTER"] = 1] = "CANT_REACH_CANISTER";
    GetBalanceErrors[GetBalanceErrors["NO_PRINCIPAL_PROVIDED"] = 2] = "NO_PRINCIPAL_PROVIDED";
})(GetBalanceErrors = exports.GetBalanceErrors || (exports.GetBalanceErrors = {}));
