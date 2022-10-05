"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountId = exports.HARDENED_OFFSET = exports.SUB_ACCOUNT_ZERO = exports.ACCOUNT_DOMAIN_SEPERATOR = exports.DERIVATION_PATH = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const binary_1 = require("./binary");
const buffer_1 = require("buffer");
// ED25519 key derivation path
exports.DERIVATION_PATH = "m/44'/223'/0'/0";
// Dfinity Account separator
exports.ACCOUNT_DOMAIN_SEPERATOR = '\x0Aaccount-id';
// Subaccounts are arbitrary 32-byte values.
exports.SUB_ACCOUNT_ZERO = buffer_1.Buffer.alloc(32);
exports.HARDENED_OFFSET = 0x80000000;
const getAccountId = (principal, subAccount) => {
    const sha = crypto_js_1.default.algo.SHA224.create();
    sha.update(exports.ACCOUNT_DOMAIN_SEPERATOR); // Internally parsed with UTF-8, like go does
    sha.update((0, binary_1.byteArrayToWordArray)(principal.toUint8Array()));
    const subBuffer = buffer_1.Buffer.from(exports.SUB_ACCOUNT_ZERO);
    if (subAccount) {
        subBuffer.writeUInt32BE(subAccount);
    }
    sha.update((0, binary_1.byteArrayToWordArray)(subBuffer));
    const hash = sha.finalize();
    /// While this is backed by an array of length 28, it's canonical representation
    /// is a hex string of length 64. The first 8 characters are the CRC-32 encoded
    /// hash of the following 56 characters of hex. Both, upper and lower case
    /// characters are valid in the input string and can even be mixed.
    /// [ic/rs/rosetta-api/ledger_canister/src/account_identifier.rs]
    const byteArray = (0, binary_1.wordArrayToByteArray)(hash, 28);
    const checksum = (0, binary_1.generateChecksum)(Uint8Array.from(byteArray));
    const val = checksum + hash.toString();
    return val;
};
exports.getAccountId = getAccountId;
