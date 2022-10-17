import { Principal } from '@dfinity/principal';
import { getNftCollection } from '../index';
import { OrigynClient } from '../origynClient';
import JSONbig from 'json-bigint';

test('expect getNftCollection to return collection info', async () => {
  const response = await getNftCollection();
  console.log('🚀 ~ file: collection.test.ts ~ line 11 ~ test ~ response', JSONbig.stringify(response));
  expect(response).toHaveProperty('ok');
});
