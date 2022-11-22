import { Principal } from '@dfinity/principal';
import { getNftBalance } from '../index';
import { OrigynClient } from '../origynClient';

test('expect getNftBalance to return nfts for test principal (from origynClient)', async () => {
  const TEST_WALLET = 'jvdm5-xkwgc-4t2x7-ojmjd-ail2p-6agif-7m6a6-z6eok-oxueq-inzfb-zae';
  const principal = Principal.fromText(TEST_WALLET);
  OrigynClient.getInstance().principal = principal;

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
  OrigynClient.getInstance().principal = undefined;
  const response = await getNftBalance();
  expect(response).toStrictEqual(EXPECTED_RESPONSE);
});
