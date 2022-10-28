import { Actor, HttpAgent, Identity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import { getIdl, IdlStandard } from '../../idls';
import origynNftIdl from '../../idls/origyn_nft_reference.did';
import { AnyActor, PrivateIdentityKey } from '../../types/origynTypes';
import { FETCH } from '../../utils/constants';
import { getIdentity } from './identity';

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
