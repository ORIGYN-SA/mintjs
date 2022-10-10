import { Principal } from '@dfinity/principal';
import { getNft, mintNft } from '../../methods/nft/nft';
import { getActor } from '../../methods/wallet/actor';
import { OrigynClient } from '../../origynClient';
import JSONbig from 'json-bigint';

const WALLET_SEED = 'inherit disease hill can squirrel zone science dentist sadness exist wear aim';

const isProd = false;
test('expect mint to work', async () => {
  await OrigynClient.getInstance().init('rrkah-fqaaa-aaaaa-aaaaq-cai', { key: { seed: WALLET_SEED } });
  const principal = Principal.fromText('jvdm5-xkwgc-4t2x7-ojmjd-ail2p-6agif-7m6a6-z6eok-oxueq-inzfb-zae');
  const mint_r = await mintNft('la-0', principal);
  console.log('🚀 ~ file: minter.test.ts ~ line 13 ~ test ~ mint_r', mint_r);

  const response = await getNft('la-0');
  console.log('🚀 ~ file: minter.test.ts ~ line 17 ~ test ~ response', JSONbig.stringify(response));
});
