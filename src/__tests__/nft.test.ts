import { getNft } from '../index';

test('expect getNft to return valid response for bm-1', async () => {
  const response = await getNft('bm-1');
  expect(response).toHaveProperty('ok');
});

test('expect getNft to return error on invalid token id', async () => {
  const response = await getNft('bm-invalid');
  expect(response).toHaveProperty('err');
});
