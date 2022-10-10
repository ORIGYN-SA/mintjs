// import pemfile from 'pem-file';
import sha256 from 'crypto-js/sha256';
import { fromMasterSeed } from 'hdkey';
import { mnemonicToSeed } from 'bip39';
import { Secp256k1KeyIdentity, Ed25519KeyIdentity } from '@dfinity/identity';
import { Actor, HttpAgent, Identity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import { IdlStandard, getIdl } from '../../idls';
import { AnyActor, PrivateIdentityKey } from '../../types/origynTypes';
import origynNftIdl from '../../idls/origyn_nft_reference.did';
import { FETCH } from '../../utils/constants';

const plugActor = async (canisterId: string, standard: IdlStandard) => {
  if (!(await window.ic.plug.isConnected())) {
    return undefined;
  }

  await window.ic.plug.createAgent({
    whitelist: [canisterId],
    host: 'https://boundary.ic0.app',
  });

  const actor = await window.ic.plug.createActor({
    canisterId: canisterId,
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
    canisterId: canisterId,
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
  // TODO: add this bac
  if (!isProd) {
    agent.fetchRootKey();
  }

  const actor: AnyActor = Actor.createActor(origynNftIdl, {
    agent: agent,
    canisterId: Principal.fromText(canisterId),
  });

  return [actor, agent];
};

function getAgent(host: string, identity: Identity | Promise<Identity>) {
  return new HttpAgent({
    fetch: FETCH,
    host: host,
    identity: identity,
  });
}
export const getIdentity = async (privateIdentityKey: PrivateIdentityKey) => {
  const { ecPrivateKey, privateKey, seed } = privateIdentityKey;
  if (ecPrivateKey) {
    const rawBuffer = Uint8Array.from(ecPrivateKey as any).buffer;
    const pKey = Uint8Array.from(sha256(rawBuffer as any, { asBytes: true }));
    const identity = Secp256k1KeyIdentity.fromSecretKey(pKey);
    console.log(`Loaded Secp256k1 identity ${identity.getPrincipal()} from arg.`);
    return identity;
  } else if (privateKey) {
    // var buf = pemfile.decode(privateKey);
    // if (buf.length != 85) {
    //   throw 'expecting byte length 85 but got ' + buf.length;
    // }
    // let pKey = Buffer.concat([buf.slice(16, 48), buf.slice(53, 85)]);
    // const identity = Ed25519KeyIdentity.fromSecretKey(pKey);
    // console.log(`Loaded Ed25519 identity ${identity.getPrincipal()} from arg.`);
    // return identity;
    throw 'not supported yet';
  } else if ((seed || '').split(' ').length === 12) {
    // seed file
    let _seed: Buffer = await mnemonicToSeed(seed ?? '');
    const root = fromMasterSeed(_seed);
    const addrnode = root.derive("m/44'/223'/0'/0/0");
    const identity = Secp256k1KeyIdentity.fromSecretKey(addrnode.privateKey);
    console.log(`Loaded identity ${identity.getPrincipal()} from seed arg.`);
    return identity;
  } else {
    throw 'Invalid seed phrase';
  }
};
