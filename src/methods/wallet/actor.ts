import { Actor, HttpAgent, Identity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import { getIdl, IdlStandard } from '../../idls';
import { idlFactory } from '../../idls/origyn-nft.did';
import { OrigynNftActor, PrivateIdentityKey } from '../../types/methods';
import fetch from 'isomorphic-fetch';
import { getIdentity } from './identity';

const plugActor = async (canisterId: string, standard: IdlStandard) => {
  if (!(await window.ic.plug.isConnected())) {
    return undefined;
  }

  await window.ic.plug.createAgent({
    whitelist: [canisterId],
    host: 'https://icp-api.io',
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
    host: 'https://icp-api.io/',
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
): Promise<[OrigynNftActor, HttpAgent]> => {
  const identity = await getIdentity(privateIdentityKey);

  const agent = getAgent(isProd ? 'https://icp-api.io' : 'http://localhost:8000', identity);

  if (!isProd) {
    agent.fetchRootKey();
  }

  const actor: OrigynNftActor = Actor.createActor(idlFactory, {
    agent,
    canisterId: Principal.fromText(canisterId),
  });

  return [actor, agent];
};

function getAgent(host: string, identity: Identity | Promise<Identity>) {
  return new HttpAgent({
    fetch,
    host,
    identity,
  });
}
