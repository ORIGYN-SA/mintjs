import { OrigynClient } from '../origynClient';

export const getNftBalance = () => {
  const actor = OrigynClient.getInstance().actor;
  // @ts-ignore
  console.log(actor.balance);
};
