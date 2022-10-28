import hdkey from 'hdkey';
import { mnemonicToSeed } from 'bip39';
import { Secp256k1KeyIdentity, Ed25519KeyIdentity } from '@dfinity/identity';
import { Actor, HttpAgent, Identity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import { IdlStandard, getIdl } from '../../idls';
import { AnyActor, PrivateIdentityKey } from '../../types/origynTypes';
import { FETCH, IS_NODE_CONTEXT } from '../../utils/constants';
import { decode as decodePemFile } from '../../utils/pem-files';
import origynNftIdl from '../../idls/origyn_nft_reference.did';

const plugActor = async (canisterId: string, standard: IdlStandard) => {
  if (!(await window.ic.plug.isConnected())) {
    return undefined;
  }

  await window.ic.plug.createAgent({
    whitelist: [canisterId],
    host: 'https://boundary.ic0.app',
  });

  const actor = await window.ic.plug.createActor({
    canisterId,
    interfaceFactory: getIdl(standard),
  });
  return actor;
};

const iiActor = async (canisterId: string, standard: IdlStandard) => {
  const authClient = await AuthClient.create();
  if (!(await authClient.isAuthenticated())) {
    return undefined;
  }

  const identity = authClient.getIdentity();

  const airdropAgent = new HttpAgent({
    identity,
    host: 'https://boundary.ic0.app/',
  });

  const actor = Actor.createActor(getIdl(standard), {
    agent: airdropAgent,
    canisterId,
  });

  return actor;
};

export const createWalletActor = async (walletType: string, canisterId: string, standard: IdlStandard) => {
  switch (walletType) {
    case 'plug':
      return await plugActor(canisterId, standard);
    case 'ii':
      return await iiActor(canisterId, standard);
  }
};

export const getActor = async (
  isProd: boolean,
  privateIdentityKey: PrivateIdentityKey,
  canisterId: string,
): Promise<[AnyActor, HttpAgent]> => {
  const identity = await getIdentity(privateIdentityKey);

  const agent = getAgent(isProd ? 'https://boundary.ic0.app' : 'http://localhost:8000', identity);

  if (!isProd) {
    agent.fetchRootKey();
  }

  const actor: AnyActor = Actor.createActor(origynNftIdl, {
    agent,
    canisterId: Principal.fromText(canisterId),
  });

  return [actor, agent];
};

function getAgent(host: string, identity: Identity | Promise<Identity>) {
  return new HttpAgent({
    fetch: FETCH,
    host,
    identity,
  });
}

export const getIdentity = async (privateIdentityKey: PrivateIdentityKey): Promise<Identity> => {
  const { identityFile, seed: seedPhrase } = privateIdentityKey;
  if (identityFile) {
    let buffer;
    if (typeof identityFile === 'string') {
      if (!IS_NODE_CONTEXT) {
        throw Error('Identity file must be a Buffer array');
      }
      const fs = require('fs');
      const fileContent = fs.readFileSync(identityFile).toString();
      buffer = decodePemFile(fileContent);
      if (buffer.length != 85) {
        throw Error('Expecting byte length 85 but got ' + buffer.length);
      }
    } else {
      buffer = decodePemFile(identityFile);
    }
    if (!buffer) {
      throw 'The file provided for identity is invalid';
    }
    let privateKey = Buffer.concat([buffer.slice(16, 48), buffer.slice(53, 85)]);
    const identity = Ed25519KeyIdentity.fromSecretKey(privateKey);
    return identity;
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
