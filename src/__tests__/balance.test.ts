import { Principal } from '@dfinity/principal';
import { getNftBalance } from '../index';
import { OrigynClient } from '../origynClient';
const ORIGYN_CANISTER_ID = 'mludz-biaaa-aaaal-qbhwa-cai';

test('expect getNftBalance to return nfts for test principal (from origynClient)', async () => {
  const TEST_WALLET = 'jvdm5-xkwgc-4t2x7-ojmjd-ail2p-6agif-7m6a6-z6eok-oxueq-inzfb-zae';
  const principal = Principal.fromText(TEST_WALLET);
  const client = OrigynClient.getInstance();
  await client.init(true, ORIGYN_CANISTER_ID);
  client.principal = principal;

  const response = await getNftBalance();
  expect(response).toHaveProperty('ok.nfts');
});

test('expect getNftBalance to return nfts for test principal (as arg)', async () => {
  const TEST_WALLET = 'jvdm5-xkwgc-4t2x7-ojmjd-ail2p-6agif-7m6a6-z6eok-oxueq-inzfb-zae';
  const principal = Principal.fromText(TEST_WALLET);

  const response = await getNftBalance(principal);
  expect(response).toHaveProperty('ok.nfts');
});

test('expect getNftBalance to return error code when no principal', async () => {
  const EXPECTED_RESPONSE = {
    err: {
      error_code: 2,
    },
  };
  const client = OrigynClient.getInstance();
  await client.init(true, ORIGYN_CANISTER_ID);
  client.principal = undefined;

  const response = await getNftBalance();
  expect(response).toStrictEqual(EXPECTED_RESPONSE);
});
