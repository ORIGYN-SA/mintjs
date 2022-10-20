import { stageNfts } from '../../methods/nft/nft';
import { OrigynClient } from '../../origynClient';

const WALLET_SEED = '';

test('expect stage files to work', async () => {
  await OrigynClient.getInstance().init(false, 'rrkah-fqaaa-aaaaa-aaaaq-cai', { key: { seed: WALLET_SEED } });
  const examplePayload = {
    isProxy: true,
    soulbound: false,
    nfts: [
      {
        quantity: 1,
        files: [
          {
            filename: 'wallpaper2.jpg',
            index: 0,
            path: '/home/sebastian/Desktop/wallpaper2.jpg',
          },
        ],
      },
    ],
  };
  const stage_asset = await stageNfts(examplePayload);
  console.log('🚀 ~ file: stage.test.ts ~ line 84 ~ test ~ stage_asset', stage_asset);
});
