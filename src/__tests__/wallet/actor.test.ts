import path from 'path';
import { getIdentity } from '../../methods/wallet/identity';

const TEST_WALLET = {
  identityFile: path.resolve(__dirname, 'ed25519.pem'),
  principalId: 'deald-w2dkr-abvrz-3z5xc-ksymr-6e74c-rum4p-dt7ju-e4gzz-dnaiw-yae',
};
const TEST_WALLET_2 = {
  identityFile: path.resolve(__dirname, 'sec256k1.pem'),
  seed: 'nerve lady tower arm shoulder garden hundred notice attend focus depend bitter',
  principalId: '62j24-szpkv-o3co4-kzmjq-lv5fy-djyp7-2szjv-4av3t-d3sxj-il47n-iae',
};
test('expect getIdentity to return valid Principal for seed', async () => {
  const args = {
    seed: TEST_WALLET_2.seed,
  };
  const idetntity = await getIdentity(args);
  expect(idetntity.getPrincipal().toText()).toMatch(TEST_WALLET_2.principalId);
});

test('expect getIdentity to return valid Principal for identity file (ed25519)', async () => {
  const args = {
    identityFile: TEST_WALLET.identityFile,
  };
  const idetntity = await getIdentity(args);
  expect(idetntity.getPrincipal().toText()).toMatch(TEST_WALLET.principalId);
});

test('expect getIdentity to return valid Principal for identity file (sec256k1)', async () => {
  const args = {
    identityFile: TEST_WALLET_2.identityFile,
  };
  const idetntity = await getIdentity(args);
  expect(idetntity.getPrincipal().toText()).toMatch(TEST_WALLET_2.principalId);
});
