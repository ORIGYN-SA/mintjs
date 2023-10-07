import { stageLibraryAsset, updateLibraryMetadata } from '../../methods/nft/nft';
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
// test('expect update library metadata to work', async () => {
//   await OrigynClient.getInstance().init(true, 'mludz-biaaa-aaaal-qbhwa-cai', { key: { seed: WALLET_SEED } });
//   const data = {
//     title: 'modified again - experience3.html',
//   };
//   const stage_asset = await updateLibraryMetadata('medulla-brainstem-fornix', 'experience3.html', data);
//   console.log('🚀 ~ file: stage.test.ts ~ line 84 ~ test ~ stage_asset', stage_asset);
// });
