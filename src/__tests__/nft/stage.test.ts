import { Principal } from '@dfinity/principal';
import { stage, buildStageConfig } from '../../methods/nft/stage';
import { StageConfigArgs } from '../../methods/nft/types';
import { OrigynClient } from '../../origynClient';

test('expect stage to work', async () => {
  // const ExampleStageConfig: StageConfigArgs = {
  //   environment: 'local',
  //   nftCanisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai',
  //   collectionId: 'la',
  //   collectionDisplayName: 'Louie Anderson',
  //   tokenPrefix: 'la-',
  //   creatorPrincipal: '6i6da-t3dfv-vteyg-v5agl-tpgrm-63p4y-t5nmm-gi7nl-o72zu-jd3sc-7qe',
  //   namespace: 'louie.anderson',
  //   assets: [{ primary: 'nft*.png' }, { hidden: 'louie_anderson.jpg' }],
  //   soulbound: false,
  //   nftOwnerId: '6i6da-t3dfv-vteyg-v5agl-tpgrm-63p4y-t5nmm-gi7nl-o72zu-jd3sc-7qe',
  //   files: [
  //     {
  //       type: 'collection',
  //       fileObj: {
  //         filename: 'louie_anderson.jpg',
  //         index: 0,
  //         path: '/home/sebastian/Documents/GitHub/mintjs/louie/louie_anderson.jpg',
  //         size: 26016,
  //       },
  //     },
  //     {
  //       type: 'dapp',
  //       fileObj: {
  //         filename: 'wallet.html',
  //         index: 1,
  //         path: '/home/sebastian/Documents/GitHub/mintjs/brain-matters/assets/collection/dapps/wallet.html',
  //         size: 1545120,
  //       },
  //     },
  //     {
  //       type: 'dapp',
  //       fileObj: {
  //         filename: 'ledger.html',
  //         index: 2,
  //         path: '/home/sebastian/Documents/GitHub/mintjs/brain-matters/assets/collection/dapps/ledger.html',
  //         size: 1122558,
  //       },
  //     },
  //   ],
  //   nfts: [
  //     {
  //       quantity: 1,
  //       files: [
  //         {
  //           filename: 'louie.png',
  //           index: 0,
  //           path: '/home/sebastian/Documents/GitHub/mintjs/louie/louie.png',
  //           size: 371706,
  //         },
  //       ],
  //       collectionFiles: [
  //         {
  //           filename: 'louie_anderson.jpg',
  //           path: '/home/sebastian/Documents/GitHub/mintjs/louie/louie_anderson.jpg',
  //           size: 26016,
  //         },
  //       ],
  //     },
  //   ],
  // };
  // const WALLET_SEED = 'inherit disease hill can squirrel zone science dentist sadness exist wear aim';
  // await OrigynClient.getInstance().init(false, 'rrkah-fqaaa-aaaaa-aaaaq-cai', { key: { seed: WALLET_SEED } });
  // const config = await buildStageConfig(ExampleStageConfig);
  // const stage_r = await stage(config);
  // console.log('🚀 ~ file: stage.test.ts ~ line 69 ~ test ~ stage_r', stage_r);
});
