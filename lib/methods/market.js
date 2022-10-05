"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendEscrowErrors = exports.BaseErrors = exports.rejectEscrow = exports.withdrawEscrow = exports.endSale = exports.sendEscrow = exports.startAuction = void 0;
const origynClient_1 = require("../origynClient");
const constants_1 = require("../utils/constants");
const startAuction = async (args) => {
    const { token_id, startPrice, priceStep, buyNowPrice, endDate, ic_token } = args;
    try {
        const actor = origynClient_1.OrigynClient.getInstance().actor;
        const response = await actor.market_transfer_nft_origyn({
            token_id,
            sales_config: {
                pricing: {
                    auction: {
                        start_price: BigInt(startPrice * 1e8),
                        token: {
                            ic: ic_token ?? constants_1.OGY_TOKEN,
                        },
                        reserve: [],
                        start_date: BigInt(Math.floor(new Date().getTime() * 1e6)),
                        min_increase: {
                            amount: BigInt(priceStep * 1e8),
                        },
                        allow_list: [],
                        buy_now: buyNowPrice ? [BigInt(buyNowPrice * 1e8)] : [],
                        end_date: BigInt(new Date(endDate).getTime() * 1e6),
                        ending: {
                            date: BigInt(new Date(endDate).getTime() * 1e6),
                        },
                    },
                },
                escrow_receipt: [],
            },
        });
        if (response.ok || response.error) {
            return response;
        }
        else {
            return { err: { error_code: BaseErrors.UNKNOWN_ERROR } };
        }
    }
    catch (e) {
        return { err: { error_code: BaseErrors.CANT_REACH_CANISTER } };
    }
};
exports.startAuction = startAuction;
const sendEscrow = async (args) => {
    const { token_id, amount, sale_id, to, ic_token } = args;
    try {
        const actor = origynClient_1.OrigynClient.getInstance().actor;
        const principal = origynClient_1.OrigynClient.getInstance().principal;
        if (!principal) {
            return { err: { error_code: SendEscrowErrors.NO_PRINCIPAL } };
        }
        const saleInfo = await actor.sale_info_nft_origyn({ deposit_info: [] });
        const { account_id } = saleInfo?.ok?.deposit_info ?? {};
        if (saleInfo.err || !account_id) {
            return { err: { error_code: SendEscrowErrors.CANT_GET_ACCOUNT_ID } };
        }
        // TODO: send transaction
        const transactionHeight = 0n; // to be taken from transaction response
        const response = await actor.escrow_nft_origyn({
            token_id,
            deposit: {
                token: {
                    ic: ic_token ?? constants_1.OGY_TOKEN,
                },
                trx_id: [{ nat: BigInt(transactionHeight) }],
                seller: {
                    to,
                },
                buyer: { principal },
                amount: BigInt(amount * 1e8),
                sale_id: sale_id ? [sale_id] : [],
            },
            lock_to_date: [],
        });
        if (response.ok || response.error) {
            return response;
        }
        else {
            return { err: { error_code: SendEscrowErrors.UNKNOWN_ERROR } };
        }
    }
    catch (e) {
        return { err: { error_code: SendEscrowErrors.CANT_REACH_CANISTER } };
    }
};
exports.sendEscrow = sendEscrow;
const endSale = async (token_id) => {
    try {
        const actor = origynClient_1.OrigynClient.getInstance().actor;
        const response = await actor.end_sale_nft_origyn(token_id);
        if (response.ok || response.error) {
            return response;
        }
        else {
            return { err: { error_code: BaseErrors.UNKNOWN_ERROR } };
        }
    }
    catch (e) {
        return { err: { error_code: BaseErrors.CANT_REACH_CANISTER } };
    }
};
exports.endSale = endSale;
const withdrawEscrow = async (escrow) => {
    try {
        const { actor, principal } = origynClient_1.OrigynClient.getInstance();
        if (!principal) {
            return { err: { error_code: BaseErrors.NO_PRINCIPAL } };
        }
        const response = await actor?.sale_nft_origyn({
            withdraw: {
                escrow: {
                    ...escrow,
                    withdraw_to: { principal },
                },
            },
        });
        if (response.ok || response.error) {
            return response;
        }
        else {
            return { err: { error_code: BaseErrors.UNKNOWN_ERROR } };
        }
    }
    catch (e) {
        return { err: { error_code: BaseErrors.CANT_REACH_CANISTER } };
    }
};
exports.withdrawEscrow = withdrawEscrow;
const rejectEscrow = async (escrow) => {
    try {
        const { actor, principal } = origynClient_1.OrigynClient.getInstance();
        if (!principal) {
            return { err: { error_code: BaseErrors.NO_PRINCIPAL } };
        }
        const response = await actor?.sale_nft_origyn({
            reject: {
                escrow: {
                    ...escrow,
                    withdraw_to: { principal },
                },
            },
        });
        if (response.ok || response.error) {
            return response;
        }
        else {
            return { err: { error_code: BaseErrors.UNKNOWN_ERROR } };
        }
    }
    catch (e) {
        return { err: { error_code: BaseErrors.CANT_REACH_CANISTER } };
    }
};
exports.rejectEscrow = rejectEscrow;
var BaseErrors;
(function (BaseErrors) {
    BaseErrors[BaseErrors["UNKNOWN_ERROR"] = 0] = "UNKNOWN_ERROR";
    BaseErrors[BaseErrors["CANT_REACH_CANISTER"] = 1] = "CANT_REACH_CANISTER";
    BaseErrors[BaseErrors["NO_PRINCIPAL"] = 2] = "NO_PRINCIPAL";
})(BaseErrors = exports.BaseErrors || (exports.BaseErrors = {}));
var SendEscrowErrors;
(function (SendEscrowErrors) {
    SendEscrowErrors[SendEscrowErrors["UNKNOWN_ERROR"] = 0] = "UNKNOWN_ERROR";
    SendEscrowErrors[SendEscrowErrors["CANT_REACH_CANISTER"] = 1] = "CANT_REACH_CANISTER";
    SendEscrowErrors[SendEscrowErrors["CANT_GET_ACCOUNT_ID"] = 2] = "CANT_GET_ACCOUNT_ID";
    SendEscrowErrors[SendEscrowErrors["NO_PRINCIPAL"] = 3] = "NO_PRINCIPAL";
})(SendEscrowErrors = exports.SendEscrowErrors || (exports.SendEscrowErrors = {}));
