import { getNft, getNftHistory } from '../index';

test('expect getNft to return valid response for bm-1', async () => {
  const response = await getNft('bm-1');
  expect(response).toHaveProperty('ok');
});

test('expect getNft to return error on invalid token id', async () => {
  const response = await getNft('bm-invalid');
  expect(response).toHaveProperty('err');
});

test('expect getNftHistory to return valid response for bm-1', async () => {
  const response: any = await getNftHistory('bm-1');
  const { token_id, index } = response?.ok[0];
  expect(token_id).toEqual('bm-1');
  expect(index).toEqual(0n);
});
test('expect getNftHistory to return empty on invalid token id', async () => {
  const response: any = await getNftHistory('inexistent');
  const EXPECTED_RESPONSE = {
    ok: [],
  };
  expect(response).toStrictEqual(EXPECTED_RESPONSE);
});
