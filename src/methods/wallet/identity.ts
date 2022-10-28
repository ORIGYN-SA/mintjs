import hdkey from 'hdkey';
import { Secp256k1KeyIdentity, Ed25519KeyIdentity } from '@dfinity/identity';
import { mnemonicToSeed } from 'bip39';
import { PrivateIdentityKey } from '../../types/origynTypes';
import { IS_NODE_CONTEXT } from '../../utils/constants';
import { fileBufferToText } from '../../utils/binary';

const ED25519_KEY_INIT = '3053020101300506032b657004220420';
const ED25519_KEY_SEPARATOR = 'a123032100';
const ED25519_OID = '06032b6570';

const SEC256k1_KEY_INIT = '30740201010420';
const SEC256k1_KEY_SEPARATOR = 'a00706052b8104000aa144034200';
const SEC256k1_OID = '06052b8104000a';

// Original Source:
// https://github.com/Psychedelic/plug-controller/blob/eadc90de738a7fb3d338203540919000f5fd768b/src/utils/identity/parsePem.ts

export const parseEd25519 = (pem: string) => {
  const raw = Buffer.from(pem, 'base64').toString('hex');

  if (!raw.substring(0, 24).includes(ED25519_OID)) {
    return undefined;
  }

  const trimRaw = raw.replace(ED25519_KEY_INIT, '').replace(ED25519_KEY_SEPARATOR, '');

  try {
    const key = new Uint8Array(Buffer.from(trimRaw, 'hex'));
    const identity = Ed25519KeyIdentity.fromSecretKey(key);
    return identity;
  } catch {
    return undefined;
  }
};

export const parseSec256K1 = (pem: string) => {
  const raw = Buffer.from(pem, 'base64').toString('hex');

  if (!raw.includes(SEC256k1_OID)) {
    return undefined;
  }

  const trimRaw = raw.replace(SEC256k1_KEY_INIT, '').replace(SEC256k1_KEY_SEPARATOR, '');

  try {
    const key = new Uint8Array(Buffer.from(trimRaw.substring(0, 64), 'hex'));
    const identity = Secp256k1KeyIdentity.fromSecretKey(key);
    return identity;
  } catch {
    return undefined;
  }
};

export const getIdentityFromPem = (pem) => {
  const trimedPem = pem
    .replace(/(-{5}.*-{5})/g, '')
    .replace('\n', '')
    // Sepk256k1 keys
    .replace('BgUrgQQACg==', '')
    .trim();

  const parsedIdentity = parseEd25519(trimedPem) || parseSec256K1(trimedPem);

  if (!parsedIdentity) throw new Error('invalid key');

  return parsedIdentity;
};

export const getIdentity = async (privateIdentityKey: PrivateIdentityKey): Promise<any> => {
  const { identityFile, seed: seedPhrase } = privateIdentityKey;
  let fileContent;
  if (identityFile) {
    if (typeof identityFile === 'string') {
      if (!IS_NODE_CONTEXT) {
        throw Error('Identity file must be a Buffer array');
      }
      const fs = require('fs');
      fileContent = fs.readFileSync(identityFile).toString();
    } else {
      fileContent = await fileBufferToText(identityFile);
    }
    return getIdentityFromPem(fileContent);
  } else if (seedPhrase) {
    let seed: Buffer = await mnemonicToSeed(seedPhrase);
    const root = hdkey.fromMasterSeed(seed);
    const addrnode = root.derive("m/44'/223'/0'/0/0");
    const identity = Secp256k1KeyIdentity.fromSecretKey(addrnode.privateKey);
    return identity;
  } else {
    throw 'Could not load identity. Make sure you are prividing a valid seed phrase or an identity file.';
  }
};
