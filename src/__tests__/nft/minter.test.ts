import { Principal } from '@dfinity/principal';
import { getNft, mintNft } from '../../methods/nft/nft';
import { getActor } from '../../methods/wallet/actor';
import { OrigynClient } from '../../origynClient';
import JSONbig from 'json-bigint';

const WALLET_SEED = '';

const isProd = false;
test('expect mint to work', async () => {
  const _actor = await getActor(isProd, { seed: WALLET_SEED }, 'rrkah-fqaaa-aaaaa-aaaaq-cai');
  OrigynClient.getInstance().init('rrkah-fqaaa-aaaaa-aaaaq-cai', { actor: _actor });
  const principal = Principal.fromText('6i6da-t3dfv-vteyg-v5agl-tpgrm-63p4y-t5nmm-gi7nl-o72zu-jd3sc-7qe');
  const mint_r = await mintNft('la-0', principal);
  console.log('🚀 ~ file: minter.test.ts ~ line 13 ~ test ~ mint_r', mint_r);

  const response = await getNft('la-0');
  console.log('🚀 ~ file: minter.test.ts ~ line 17 ~ test ~ response', JSONbig.stringify(response));
});
