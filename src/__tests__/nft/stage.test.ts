import { Principal } from '@dfinity/principal';
import { stage, buildStageConfig } from '../../methods/nft/stage';
import { StageConfigArgs } from '../../methods/nft/types';
import { OrigynClient } from '../../origynClient';

test('expect stage to work', async () => {
  const ExampleStageConfig: StageConfigArgs = {
    environment: 'local',
    nftCanisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai',
    collectionId: 'la',
    collectionDisplayName: 'Louie Anderson',
    tokenPrefix: 'la-',
    creatorPrincipal: '6i6da-t3dfv-vteyg-v5agl-tpgrm-63p4y-t5nmm-gi7nl-o72zu-jd3sc-7qe',
    namespace: 'louie.anderson',
    soulbound: false,
    nftOwnerId: '6i6da-t3dfv-vteyg-v5agl-tpgrm-63p4y-t5nmm-gi7nl-o72zu-jd3sc-7qe',
    collectionFiles: [
      {
        category: 'collection',
        filename: 'nyan-cat.gif',
        index: 0,
        path: '/home/sebastian/Desktop/nft/nyan-cat.gif',
        assetType: 'primary',
      },
      {
        category: 'dapp',
        filename: 'wallet.html',
        index: 1,
        path: '/home/sebastian/Desktop/nft/dapps/wallet.html',
      },
      {
        category: 'dapp',
        filename: 'ledger.html',
        index: 2,
        path: '/home/sebastian/Desktop/nft/dapps/ledger.html',
      },
    ],
    nfts: [
      {
        quantity: 1,
        files: [
          {
            filename: 'nyan.gif',
            path: '/home/sebastian/Desktop/nft/nyan.gif',
            assetType: 'preview',
          },
        ],
        collectionFileReferences: ['nyan-cat.gif', 'wallet.html', 'ledger.html'],
      },
    ],
  };
  const WALLET_SEED = '';
  await OrigynClient.getInstance().init(false, 'rrkah-fqaaa-aaaaa-aaaaq-cai', { key: { seed: WALLET_SEED } });
  const config = await buildStageConfig(ExampleStageConfig);
  const stage_r = await stage(config);
  console.log('🚀 ~ file: stage.test.ts ~ line 69 ~ test ~ stage_r', stage_r);
});
