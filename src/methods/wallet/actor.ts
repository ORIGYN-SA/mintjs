import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { getPerpetualOSContext } from '@origyn/perpetualos-context';
import { getIdl, IdlStandard } from '../../idls';

const plugActor = async (canisterId: string, standard: IdlStandard) => {
  if (!(await window?.ic?.plug?.isConnected())) {
    return undefined;
  }

  const context = await getPerpetualOSContext(window.location.href);

  await window.ic.plug.createAgent({
    whitelist: [canisterId],
    host: context.isLocal ? 'http://localhost:8080' : 'https://icp-api.io',
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

  const context = await getPerpetualOSContext(window.location.href);

  const identity = authClient.getIdentity();

  const agent = new HttpAgent({
    identity,
    host: context.isLocal ? 'http://localhost:8080' : 'https://icp-api.io/',
  });

  const actor = Actor.createActor(getIdl(standard), {
    agent,
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
