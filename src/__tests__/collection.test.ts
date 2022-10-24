import { Principal } from '@dfinity/principal';
import { getNftCollectionMeta, getNftCollectionInfo } from '../index';
import { OrigynClient } from '../origynClient';
import JSONbig from 'json-bigint';

const WALLET_SEED = '';

// Disable this as it points to the local replica and will fail on the pipeline

test('expect getNftCollectionMeta to return collection meta', async () => {
  // await OrigynClient.getInstance().init(false, 'rrkah-fqaaa-aaaaa-aaaaq-cai', { key: { seed: WALLET_SEED } });
  // const response = await getNftCollectionMeta();
  // console.log('🚀 ~ file: collection.test.ts ~ line 11 ~ test ~ response', JSONbig.stringify(response));
  // expect(response).toHaveProperty('ok');
});

test('expect getNftCollectionInfo to return collection info', async () => {
  // await OrigynClient.getInstance().init(false, 'rrkah-fqaaa-aaaaa-aaaaq-cai', { key: { seed: WALLET_SEED } });
  // const response = await getNftCollectionInfo();
  // console.log('🚀 ~ file: collection.test.ts ~ line 17 ~ test ~ response', JSONbig.stringify(response));
  // expect(response).toHaveProperty('ok');
});
