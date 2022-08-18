import { createActor, createAgent } from '../identity/actor';

export const getNftBalance = () => {
  const actor = createActor(createAgent());
  // @ts-ignore
  console.log(actor.balance);
};
