import { getNft, getNftHistory } from '../index';
import { OrigynClient } from '../origynClient';
const ORIGYN_CANISTER_ID = 'mludz-biaaa-aaaal-qbhwa-cai';
import JSONbig from 'json-bigint';

test('expect getNft to return valid response for epithalamus-amygdala-diencephalon', async () => {
  const client = OrigynClient.getInstance();
  client.init(false, ORIGYN_CANISTER_ID);
  const response = await getNft('epithalamus-amygdala-diencephalon');
  expect(response).toHaveProperty('ok');
});

// test('expect getNft to return error on invalid token id', async () => {
//   const response = await getNft('bm-invalid');
//   expect(response).toHaveProperty('err');
// });

// test('expect getNftHistory to return valid response for bm-1', async () => {
//   const response: any = await getNftHistory('bm-1');
//   const { token_id, index } = response?.ok[0];
//   expect(token_id).toEqual('bm-1');
//   expect(index).toEqual(0n);
// });
// test('expect getNftHistory to return empty on invalid token id', async () => {
//   const response: any = await getNftHistory('inexistent');
//   const EXPECTED_RESPONSE = {
//     ok: [],
//   };
//   expect(response).toStrictEqual(EXPECTED_RESPONSE);
// });
