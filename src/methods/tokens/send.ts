import { Principal } from '@dfinity/principal';
import { getIdl, IdlStandard } from '../../idls';
import { createWalletActor } from '.././wallet/actor';
import { Token } from './types';
import { getAccountId } from '../../utils/principalToAccountId';
import { Actor, HttpAgent } from '@dfinity/agent';
import { bufferToHex } from '../../utils/binary';

const sendICP = async (actor: any, token: Token, to: any, amount: number) => {
  const defaultArgs = {
    fee: BigInt(200_000),
    memo: BigInt(0),
  };

  const response = await actor.send_dfx({
    to:
      // @ts-ignore
      typeof to === 'string' ? getAccountId(Principal.fromText(to)) : bufferToHex(to),
    fee: { e8s: token?.fee || defaultArgs.fee },
    amount: { e8s: BigInt(amount) },
    memo: defaultArgs.memo,
    from_subaccount: [],
    created_at_time: [],
  });

  return await response.toString();
};

// DIP20 and WICP
export const sendWICP = async (actor: any, to: any, amount: number) => {
  const transferResult = await actor.transfer(typeof to === 'string' ? Principal.fromText(to) : to, BigInt(amount));

  if ('Ok' in transferResult) return transferResult.Ok.toString();

  throw new Error(Object.keys(transferResult.Err)[0]);
};
export const sendXTC = async (actor: any, to: any, amount: number) => {
  const transferResult = await actor.transferErc20(
    typeof to === 'string' ? Principal.fromText(to) : to,
    BigInt(amount),
  );

  if ('Ok' in transferResult) return transferResult.Ok.toString();

  throw new Error(Object.keys(transferResult.Err)[0]);
};
export const sendEXT = async (actor: any, token: Token, to: any, from: string, amount: number) => {
  const dummyMemmo = new Array(32).fill(0);
  const _to = typeof to === 'string' ? { principal: Principal.fromText(to) } : { account_id: to };

  const data = {
    to: _to,
    from: { principal: Principal.from(from) },
    amount,
    token: token.symbol,
    memo: dummyMemmo,
    notify: false,
    subaccount: [],
    fee: BigInt(0),
  };

  const transferResult = await actor.transfer(data);

  if ('ok' in transferResult) return transferResult.ok.toString();

  throw new Error(Object.keys(transferResult.err)[0]);
};
export const sendTransaction = async (
  auth: string | HttpAgent,
  token: Token,
  to: any,
  amount: number,
  from: string,
) => {
  let actor: any;
  if (auth instanceof HttpAgent) {
    actor = Actor.createActor(getIdl(token.standard), {
      agent: auth,
      canisterId: token.canisterId,
    });
  } else {
    actor = await createWalletActor(auth, token.canisterId, token.standard);
  }
  switch (token.standard) {
    case IdlStandard.ICP:
      return sendICP(actor, token, to, amount);
    case IdlStandard.WICP:
    case IdlStandard.DIP20:
      return sendWICP(actor, to, amount);
    case IdlStandard.XTC:
      return sendXTC(actor, to, amount);
    case IdlStandard.EXT:
      return sendEXT(actor, token, to, from, amount);
  }
};
