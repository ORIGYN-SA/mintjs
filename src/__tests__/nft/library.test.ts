import { stageLibraryAsset } from '../../methods/nft/nft';
import { OrigynClient } from '../../origynClient';

const WALLET_SEED = 'inherit disease hill can squirrel zone science dentist sadness exist wear aim';

test('expect stage library asset to work', async () => {
  await OrigynClient.getInstance().init(false, 'rrkah-fqaaa-aaaaa-aaaaq-cai', { key: { seed: WALLET_SEED } });
  const example = {
    token_id: 'la-0',
    files: [
      {
        filename: 'circle-exclamation-solid.svg',
        index: 0,
        path: '/home/sebastian/Desktop/circle-exclamation-solid.svg',
      },
    ],
  };
  const stage_asset = await stageLibraryAsset(example.files, example.token_id);
  console.log('🚀 ~ file: stage.test.ts ~ line 84 ~ test ~ stage_asset', stage_asset);
});
