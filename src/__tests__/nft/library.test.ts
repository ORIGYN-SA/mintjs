import { stageLibraryAsset } from '../../methods/nft/nft';
import { OrigynClient } from '../../origynClient';

const WALLET_SEED = '';

// Disable this as it points to the local replica and will fail on the pipeline

test('expect stage library asset to work', async () => {
  // await OrigynClient.getInstance().init(true, 'rubbi-ryaaa-aaaap-aajqq-cai', { key: { seed: WALLET_SEED } });
  // const example = {
  //   token_id: 'la-0',
  //   files: [
  //     {
  //       filename: 'circle-exclamation-solid.svg',
  //       index: 0,
  //       path: '/home/sebastian/Desktop/circle-exclamation-solid.svg',
  //     },
  //   ],
  // };
  // const stage_asset = await stageLibraryAsset(example.files, example.token_id);
  // console.log('🚀 ~ file: stage.test.ts ~ line 84 ~ test ~ stage_asset', stage_asset);
});
