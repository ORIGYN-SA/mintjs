import { Principal } from '@dfinity/principal';
import { getNftCollection } from '../index';
import { OrigynClient } from '../origynClient';

test('expect getNftCollection to return collection info', async () => {
  const TEST_WALLET = 'jvdm5-xkwgc-4t2x7-ojmjd-ail2p-6agif-7m6a6-z6eok-oxueq-inzfb-zae';
  //const principal = Principal.fromText(TEST_WALLET);
  //OrigynClient.getInstance().principal = principal;

  const response = await getNftCollection();
  expect(response).toHaveProperty('ok');
});
