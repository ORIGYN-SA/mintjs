import { Principal } from '@dfinity/principal';
import { stage, buildStageConfig } from '../../methods/nft/stage';
import { StageConfigArgs } from '../../methods/nft/types';

test('expect stage to work', async () => {
  const ExampleStageConfig: StageConfigArgs = {
    environment: 'local',
    nftCanisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai',
    collectionId: 'la',
    collectionDisplayName: 'Louie Anderson',
    tokenPrefix: 'la-',
    creatorPrincipal: '6i6da-t3dfv-vteyg-v5agl-tpgrm-63p4y-t5nmm-gi7nl-o72zu-jd3sc-7qe',
    namespace: 'louie.anderson',
    assets: [{ primary: 'nft*.png' }, { hidden: 'louie_anderson.jpg' }],
    soulbound: false,
    nftOwnerId: '6i6da-t3dfv-vteyg-v5agl-tpgrm-63p4y-t5nmm-gi7nl-o72zu-jd3sc-7qe',
    files: [
      {
        type: 'collection',
        fileObj: {
          filename: 'louie_anderson.jpg',
          index: 0,
          path: '/home/sebastian/Documents/GitHub/mintjs/louie/louie_anderson.jpg',
          size: 26016,
        },
      },
      {
        type: 'dapp',
        fileObj: {
          filename: 'wallet.html',
          index: 1,
          path: '/home/sebastian/Documents/GitHub/mintjs/brain-matters/assets/collection/dapps/wallet.html',
          size: 1545120,
        },
      },
      {
        type: 'dapp',
        fileObj: {
          filename: 'ledger.html',
          index: 2,
          path: '/home/sebastian/Documents/GitHub/mintjs/brain-matters/assets/collection/dapps/ledger.html',
          size: 1122558,
        },
      },
    ],
    nfts: [
      {
        quantity: 1,
        files: [
          {
            filename: 'louie.png',
            index: 0,
            path: '/home/sebastian/Documents/GitHub/mintjs/louie/louie.png',
            size: 371706,
          },
        ],
        collectionFiles: [
          {
            filename: 'louie_anderson.jpg',
            path: '/home/sebastian/Documents/GitHub/mintjs/louie/louie_anderson.jpg',
            size: 26016,
          },
        ],
      },
    ],
  };
  const config = buildStageConfig(ExampleStageConfig);
  const stage_r = await stage(config);
});
