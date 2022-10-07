import { getIdentity } from '../../methods/wallet/actor';

// Random test wallet
const privateKey = `-----BEGIN EC PARAMETERS-----\nBgUrgQQACg==\n-----END EC PARAMETERS-----\n-----BEGIN EC PRIVATE KEY-----\nMHQCAQEEIL2MKjbok/otJPhkQ1OniBROXbpaYN+7VP3nTPe/8c58oAcGBSuBBAAKoUQDQgAEsVyo+m95rzYIU/gZA1OueHqg/H3VVvHQ4CK6tRI3GyeTvIOR3AE6CASvNhcetbn/tqzGgQ9MR0oL2BCxOD1LjQ==\n-----END EC PRIVATE KEY-----\n`;
const TEST_WALLET = {
  ecPrivateKey: privateKey,
  seed: 'scene imitate cloth syrup soldier certain priority setup curtain machine obey state',
  principalId: 'excqp-nucd2-63jem-io6mj-vrkwo-gisca-ztyvu-gzjyq-wa4sl-exvdj-uae',
};
test('expect getIdentity to return valid Principal for seed', async () => {
  const args = {
    seed: TEST_WALLET.seed,
  };
  const idetntity = await getIdentity(args);
  expect(idetntity.getPrincipal().toText()).toMatch(TEST_WALLET.principalId);
});
