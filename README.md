# ORIGYN Mint.js

## Overview

Mint.js is the official JavaScript library for interacting with any Internet Computer canister running the Origyn NFT standard: https://github.com/origyn-sa/origyn_nft.

### Compatibility

Each release of Mint.js is compatible with a specific version of the Origyn NFT standard. The table below shows the compatibility between the two.

| Mint.js Version | Origyn NFT Version |
| --------------- | ------------------ |
| 0.1.0 - 0.1.6   | 0.1.4              |
| 1.0.0-alpha.14  | 0.1.4              |
| 1.0.0-alpha.13  | 0.1.3              |

### Installation

```
npm i @origyn/mintjs
```

### Build

```
npm ci
npm run build
```

### Run Unit Test

Requires Node version 18 or higher.

```
npm run test
```

### Local testing of unpublished mint.js

If you have a local repository of the mint.js code, you can make npm point to its build using:

```
npm i <path-to-mint-js>
```

### Usage

Start by importing the `mintjs` in your code.

```js
import { getNftBalance } from '@origyn/mintjs';
```

Now, we can call the `getNftBalance` method anywhere in the code.

For instance, let's try to get the balance of NFTs in our wallet by passing our principal as a string. The `principal` argument can be both a `string` or a `Principal` type from `@dfinity/principal`.

```js
const response = getNftBalance(principal.toText());

if (response.ok) console.log(response.ok.nfts);
else console.log(`There was an error while getting the balance: ${response.err}`);
```

## ❗ Using Mint.js in a Web Context

Mint.js servers both Node and Web contexts. Using this in a front-end application will require a few polyfills in order to specify browserified versions of a few packages.

Example for a webpack configuration:

**webpack.config.js**

```js
module.exports = (env, argv) => ({
  resolve: {
    fallback: {
      fs: false,
      path: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
    },
  },
});
```

# Documentation

- [Documentation](#documentation)
  - [🔗 Initialization](#OrigynClient)
    - [OrigynClient.getInstance().init(isProd, canisterId, auth) ⇒ `void`](#OrigynClient+getIntstance+init)
    - [` set` OrigynClient.getInstance().principal(principal) ⇒ `void`](#OrigynClient+setPrincipal)
    - [` get` OrigynClient.getInstance().principal⇒ `Principal`](#OrigynClient+getPrincipal)
  - [🎬 Staging & Minting](#staging)
    - [stageCollection(StageConfigArgs) ⇒ `Promise<OrigynResponse<string[], GetNftErrors>>`](#staging+stageCollection)
    - [stageNfts(StageNftsArgs) ⇒ `Promise<OrigynResponse<string[], GetNftErrors>>`](#staging+stageNfts)
    - [stageNftUsingMetadata(metadata: any) ⇒ `Promise<OrigynResponse<string[], GetNftErrors>>`](#staging+stageNftUsingMetadata)
    - [stageLibraryAsset(files: StageFile[], tokenId?: string) ⇒ `Promise<OrigynResponse<string[], GetNftErrors>>`](#staging+stageLibraryAsset)
    - [stageNewLibraryAsset(files: StageFile[], useProxy: boolean = false, tokenId?: string) ⇒ `Promise<OrigynResponse<string[], GetNftErrors>>`](#staging+stageNewLibraryAsset)
    - [mintNft(tokenId: string, principal: Principal) ⇒ `Promise<OrigynResponse<any, GetNftErrors>>`](#staging+mintNft)
  - [🦾 Communication Functions](#others)
    - [getCanisterCycles(canisterId?: string)](#getCanisterCycles)
    - [getCanisterAvailableStorage(canisterId?: string)](#getCanisterAvailableStorage)
    - [getCollectionLibrary(libraryId)](#getCollectionLibrary)
    - [getCollectionLibraries()](#getCollectionLibraries)
    - [getNft(token)](#getNft)
    - [getNftBalance(principal)](#getNftBalance)
    - [getNftHistory(tokenId, start, end)](#getNftHistory)
    - [getNftLibrary(tokenId, libraryId)](#getNftLibrary)
    - [getNftLibraries(tokenId)](#getNftLibraries)
    - [updateNftApps(tokenId, data)](#updateNftApps)
    - [updateLibraryMetadata(tokenId: string, libraryId: string, data: Record<string, string | number | boolean>) ⇒ `Promise<Array<MetdataClass>>`](#updateLibraryMetadata)
    - [setLibraryImmutable(tokenId: string, libraryId: string) ⇒ `Promise<OrigynResponse<undefined, StageLibraryAssetErrors >>`](#setLibraryImmutable)
  - [🛢️ Canister](#canister)
    - [setCanisterStorage(storage: number)](#setCanisterStorage)
    - [setCanisterOwner(principal: Principal | string)](#setCanisterOwner)

<a name="OrigynClient"></a>

## 🔗 Initialization

The mint.js library is using a singleton in order to provide global configuration and access to canister configuration.

<a name="OrigynClient+getIntstance+init"></a>

## OrigynClient.getInstance().init(isProd, canisterId, auth) ⇒ `void`

| Param      | Type       | Default         | Description                                                                                                                                                            |
| ---------- | ---------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| isProd     | `boolean`  | true            | Set to false if we want to interact with a local replica canister (will use http://localhost:8080 when creating the agent, if only `identity` was provided for `auth`) |
| canisterId | `string`   | ORIGYN_CANISTER | Id of the canister to communicate with.                                                                                                                                |
| auth       | `AuthType` | `{}`            | Optional parameter providing either an `actor`, an `identity` or an `agent`. If no parameter is provided, anonymous identity will be created.                          |

### Example

Authenticate using the seed phrase:

```js
const auth = {
  key: {
    seed: 'SEED PHRASE OF THE WALLET/CONTROLLER',
  },
};

const IS_PROD = true;
const CANISTER_ID = 'frfol-iqaaa-aaaaj-acogq-cai';
await OrigynClient.getInstance().init(IS_PROD, CANISTER_ID, auth);
```

Authenticate using the `.pem` file, it can be either `ed25519` or `sec256k1` private key:

```js
const auth = {
  key: {
    identityFile: './path/to/identity.pem',
  },
};

const IS_PROD = true;
const CANISTER_ID = 'frfol-iqaaa-aaaaj-acogq-cai';
await OrigynClient.getInstance().init(IS_PROD, CANISTER_ID, auth);
```

🌐 Check the web example where we handle the upload of the .pem file. [/examples/ReactStageComponent.tsx#191](https://github.com/ORIGYN-SA/mintjs/blob/SI-82-auth-with-keys/examples/ReactStageComponent.tsx#L191)

The `auth` object can have multiple ways to create an actor for the canister.

#### AuthType

```js
type AuthType = {
  actor?: ActorSubclass<any>,
  identity?: Identity,
  agent?: HttpAgent,
  key?: PrivateIdentityKey,
};
```

#### PrivateIdentityKey

```js
type PrivateIdentityKey = {
  identityFile?: Buffer | string,
  seed?: string,
};
```

<a name="OrigynClient+setPrincipal"></a>

## ` set` OrigynClient.getInstance().principal(principal) ⇒ `void`

We can dynamically change the principal which calls the methods within OrigynClient by changing the `principal`.

| Param     | Type                    | Default | Description                                             |
| --------- | ----------------------- | ------- | ------------------------------------------------------- |
| principal | `string` or `Principal` |         | The id of the principal or the object (as `Principal`). |

<a name="OrigynClient+getPrincipal"></a>

## ` get` OrigynClient.getInstance().principal⇒ `Principal`

**Returns**: `Principal` - The current principal within the OrigynCleint

<a name="staging"></a>

## 🎬 Staging & Minting

We can use mint.js in order to stage NFT collections to the canister we initialized OrigynClient for. In order to do this, the Identity that was used to initialize OrigynClient needs to be the controller of the canister.
<a name="staging+stageCollection"></a>

## stageCollection(stageConfigArgs: StageConfigArgs) ⇒ `Promise<OrigynResponse<string[], GetNftErrors>>`

#### `StageConfigArgs` Type

| Name                  | Type                    | Description                                                         |
| --------------------- | ----------------------- | ------------------------------------------------------------------- |
| environment           | `'local' or 'prod'`     | Whether the environment we want to stage to is local or production. |
| nftCanisterId         | `string`                | Id of the canister, should be the same as the initalized canister   |
| collectionId          | `string`                | What id we want the collection to have                              |
| collectionDisplayName | `string`                | Collection name                                                     |
| tokenPrefix           | `string`                | Prefix for NFTs in the collection                                   |
| creatorPrincipal      | `string`                | The creator of the collection                                       |
| soulbound             | `boolean`               | Wheter the NFTs are soulbound or not                                |
| collectionFiles       | `CollectionLevelFile[]` | The files we want to upload at the collection level                 |
| nfts                  | `StageNft[]`            | The NFTs we want to append to the collection                        |

#### StageNft

```js
type StageNft = {
  collectionFileReferences?: string[],
  files: StageFile[],
  quantity?: number,
};
```

#### CollectionLevelFile

```js
type CollectionLevelFile = StageFile & {
  category: 'collection' | 'stage' | 'dapp',
};
```

#### StageFile

```js
export type StageFile = {
  assetType?: AssetType,
  filename: string,
  index?: number,
  path: string,
  rawFile?: Buffer,
  size?: number,
  type?: string,
  title?: string,
  libraryId?: string,
  contentType?: string,
  webUrl?: string,
  immutable?: boolean,
};
```

#### Example

For examples, please check the [test file of stage method](https://github.com/ORIGYN-SA/mintjs/blob/develop/src/__tests__/nft/stage.test.ts) (for node context) or [/examples](https://github.com/ORIGYN-SA/mintjs/blob/develop/examples) folder from the repository for web context.

<a name="staging+stageNfts"></a>

## stageNfts(stageNftsArgs: StageNftsArgs) ⇒ `Promise<OrigynResponse<string[], GetNftErrors>>`

Stage a single NFT or multiple NFTs contained in the `nfts` array after the collection was already created.

#### `StageNftsArgs` Type

| Name      | Type         | Description                                  |
| --------- | ------------ | -------------------------------------------- |
| soulbound | `boolean`    | Wheter the NFTs are soulbound or not         |
| useProxy  | `boolean`    | Wheter to use the proxy or not               |
| nfts      | `StageNft[]` | The NFTs we want to append to the collection |

#### Example

```js
await OrigynClient.getInstance().init(false, 'rrkah-fqaaa-aaaaa-aaaaq-cai', { key: { seed: WALLET_SEED } });
const examplePayload = {
  isProxy: true,
  soulbound: false,
  nfts: [
    {
      quantity: 1,
      files: [
        {
          filename: 'file_name.jpg',
          index: 0,
          path: '/home/user/Desktop/file_name.jpg.jpg',
        },
      ],
    },
  ],
};
const stageAssetResult = await stageNfts(examplePayload);
```

<a name="staging+stageNftUsingMetadata"></a>

## `raw` stageNftUsingMetadata(metadata: any) ⇒ `Promise<OrigynResponse<string[], GetNftErrors>>`

Stage a single NFT by passing raw metadata as argument. This is being used when staging an NFT which does not follow the standard.

#### Example

```js
await OrigynClient.getInstance().init(false, 'rrkah-fqaaa-aaaaa-aaaaq-cai', { key: { seed: WALLET_SEED } });
const payload = {
  metadata: {
    Class: [
      { name: 'id', value: { Text: 'my-nft-1' }, immutable: true },
      {
        name: 'owner',
        value: { Principal: 'rrkah-fqaaa-aaaaa-aaaaq-cai' },
        immutable: false,
      },
      {
        name: 'is_soulbound',
        value: { Bool: false },
        immutable: false,
      },
    ],
  },
};
const stagingResult = await stageNftUsingMetadata(payload);
```

<a name="staging+stageNewLibraryAsset"></a>

## stageNewLibraryAsset(files: StageFile[], useProxy: boolean = false, tokenId?: string) ⇒ `Promise<OrigynResponse<string[], GetNftErrors>>`

**Deprecated**

Stages a new library asset for an already staged NFT. Use this when the library is not already in the NFT Metadata. This wil also create the library meta and inject it into the NFT metadata.

#### Example

```js
await OrigynClient.getInstance().init(false, 'rrkah-fqaaa-aaaaa-aaaaq-cai', { key: { seed: WALLET_SEED } });
const payload = {
  tokenId: 'token-0', // This is the token id of the NFT we want to append library to
  files: [
    {
      filename: 'file_name.jpg',
      index: 0,
      path: '/home/user/Desktop/file_name.jpg.jpg',
    },
  ],
};
const stage_asset = await stageLibraryAsset(payload.files, payload.tokenId);
```

**Note: The `library` field of the NFT Metadata needs to be `true` in order to be able to stage library assets after minting.**

<a name="staging+stageLibraryAsset"></a>

## stageLibraryAsset(files: StageFile[], tokenId?: string) ⇒ `Promise<OrigynResponse<string[], GetNftErrors>>`

Stages a library asset for an already staged NFT. Use this for new libraries and existing libraries (the library is already in the NFT Metadata).

#### Example

```js
await OrigynClient.getInstance().init(false, 'rrkah-fqaaa-aaaaa-aaaaq-cai', { key: { seed: WALLET_SEED } });
const payload = {
  tokenId: 'token-0', // This is the token id of the NFT we want to append library to
  files: [
    {
      filename: 'file_name.jpg',
      index: 0,
      path: '/home/user/Desktop/file_name.jpg.jpg',
    },
  ],
};
const stage_asset = await stageLibraryAsset(payload.files, payload.tokenId);
```

#### Library metadata:

```js
{
  "name": "library",
  "value": {
    "Array": [
      {
        "Class": [
          {
            "name": "library_id",
            "value": {
              "Text": "file_name.jpg"
            },
            "immutable": true
          },
          {
            "name": "title",
            "value": {
              "Text": "File Name Image"
            },
            "immutable": true
          },
          .
          .
          .
        ]
      }
    ]
  },
}
```

## stageCollectionLibraryAsset(tokenId?: string, files: StageFile[]) ⇒ `Promise<OrigynResponse<any, StageLibraryAssetErrors | GetCollectionErrors>>`

Stages a library reference to an existing collection-level library asset for an already staged NFT.

#### Example

```js
await OrigynClient.getInstance().init(false, 'rrkah-fqaaa-aaaaa-aaaaq-cai', { key: { seed: WALLET_SEED } });
const payload = {
  tokenId: 'token-1', // This is the token id of the NFT we want to append library to
  files: [
    {
      libraryId: 'shared_file.png', // The id of an already staged file at the collection level
      title: 'A reference to my collection-level shared file',
      immutable: true,
    },
  ],
};
const stage_asset = await stageCollectionLibraryAsset(payload.tokenId, payload.files);
```

#### Library metadata:

```js
{
  "name": "library",
  "value": {
    "Array": [
      {
        "Class": [
          {
            "name": "library_id",
            "value": {
              "Text": "shared_file.png"
            },
            "immutable": false
          },
          {
            "name": "title",
            "value": {
              "Text": "A reference to my collection-level shared file"
            },
            "immutable": false
          },
          {
            "name": "location_type",
            "value": {
              "Text": "collection"
            },
            "immutable": false
          },
          {
            "name": "location",
            "value": {
              "Text": "collection/-/shared_file.png"
            },
            "immutable": false
          },
          {
            "name": "content_type",
            "value": {
              "Text": "image/png"
            },
            "immutable": false
          },
          {
            "name": "content_hash",
            "value": {
              "Text": "4b56b5f3526ccf851a7130f1b83d6412bc33644e79b84810a5c23c00ca75ff9d"
            },
            "immutable": false
          },
          {
            "name": "size",
            "value": {
              "Nat": "0"
            },
            "immutable": false
          },
          {
            "name": "sort",
            "value": {
              "Nat": "4"
            },
            "immutable": false
          },
          {
            "name": "read",
            "value": {
              "Text": "public"
            },
            "immutable": false
          },
          {
            "name": "com.origyn.immutable_library",
            "value": {
              "Bool": true
            },
            "immutable": true
          }
        ]
      }
    ]
  },
  "immutable": false
}
```

## stageWebLibraryAsset(tokenId?: string, files: StageFile[]) ⇒ `Promise<OrigynResponse<any, StageLibraryAssetErrors | GetCollectionErrors>>`

Stages a library reference to an existing collection-level library asset for an already staged NFT.

#### Example

```js
await OrigynClient.getInstance().init(false, 'rrkah-fqaaa-aaaaa-aaaaq-cai', { key: { seed: WALLET_SEED } });
const payload = {
  tokenId: 'token-2', // This is the token id of the NFT we want to append library to
  files: [
    {
      libraryId: 'origyn-dev-talk-1',
      webUrl: 'https://www.youtube.com/watch?v=JlLdwoCDUL8', // A URL to any web resource
      title: 'Origyn Developer Talk #1',
      immutable: true,
    },
  ],
};
const stage_asset = await stageWebLibraryAsset(payload.tokenId, payload.files);
```

#### Library metadata:

```js
{
  "name": "library",
  "value": {
    "Array": [
      {
        "Class": [
          {
            "name": "library_id",
            "value": {
              "Text": "origyn-dev-talk-1"
            },
            "immutable": false
          },
          {
            "name": "title",
            "value": {
              "Text": "Origyn Developer Talk #1"
            },
            "immutable": false
          },
          {
            "name": "location_type",
            "value": {
              "Text": "web"
            },
            "immutable": false
          },
          {
            "name": "location",
            "value": {
              "Text": "https://www.youtube.com/watch?v=JlLdwoCDUL8"
            },
            "immutable": false
          },
          {
            "name": "content_type",
            "value": {
              "Text": "text/html"
            },
            "immutable": false
          },
          {
            "name": "size",
            "value": {
              "Nat": "0"
            },
            "immutable": false
          },
          {
            "name": "sort",
            "value": {
              "Nat": "5"
            },
            "immutable": false
          },
          {
            "name": "read",
            "value": {
              "Text": "public"
            },
            "immutable": false
          },
          {
            "name": "com.origyn.immutable_library",
            "value": {
              "Bool": true
            },
            "immutable": true
          }
        ]
      }
    ]
  },
  "immutable": false
}
```

## deleteLibraryAsset(tokenId?: string, libraryId: string) ⇒ `Promise<OrigynResponse<any, StageLibraryAssetErrors>>`

Deletes an existing library asset from an already staged NFT.

#### Example

```js
await OrigynClient.getInstance().init(false, 'rrkah-fqaaa-aaaaa-aaaaq-cai', { key: { seed: WALLET_SEED } });
const response = await deleteLibraryAsset('token-2', 'origyn-dev-talk-1');
```

<a name="staging+mintNft"></a>

## mintNft(tokenId: string, principal: Principal) ⇒ `Promise<OrigynResponse<any, GetNftErrors>>`

Will mint the NFT provided as argument `tokenId` to the `principal`.

#### Example

```js
const auth = {
  key: {
    seed: 'SEED PHRASE OF THE WALLET/CONTROLLER',
  },
};

const IS_PROD = true;
const CANISTER_ID = 'frfol-iqaaa-aaaaj-acogq-cai';
await OrigynClient.getInstance().init(IS_PROD, CANISTER_ID, auth);

const mintResponse = await mintNft(config);

if(mintResponse.ok)
  // minting was succesfull
else
  throw Error(mintResponse.err.text)
```

<a name="others"></a>

## 🦾 Communication Functions

<a name="getNftBalance"></a>

## getNftBalance(principal) ⇒ `Promise<OrigynResponse<BalanceOfNftOrigyn, GetBalanceErrors>>`

Returns the NFTs balance of the provided `principal`. If no `principal` is provided, it will use the `principal` in the `OrigynClient`. If there is no `principal` at all, this method will throw a [`NO_PRINCIPAL_PROVIDED`](#enum+balance+no-principal) error.

**Returns**: `Promise<OrigynResponse<BalanceOfNftOrigyn, GetBalanceErrors>>` - JSON Response containing the response of the method.

| Param     | Type                    | Default                                                              | Description                           |
| --------- | ----------------------- | -------------------------------------------------------------------- | ------------------------------------- |
| principal | `string` or `Principal` | [`OrigynClient.getInstance().principal`](#OrigynClient+getPrincipal) | Principal to request the balance for. |

#### `BalanceOfNftOrigyn` Type

| Name           | Type             | Description                                           |
| -------------- | ---------------- | ----------------------------------------------------- |
| nfts           | `string[]`       | List with every owned NFT by the requested principal. |
| offers         | `EscrowRecord[]` | Contains a list with received escrows.                |
| sales          | `EscrowRecord[]` | List with active sales started.                       |
| stake          | `StakeRecord[]`  | Array with current stakes.                            |
| multi_canister | `Principal[]`    |
| escrows        | `EscrowRecord[]` | Sent escrows by that principal.                       |

<a name="enum+balance+no-principal"></a>

#### `GetBalanceErrors` Enum

| Name                    | Description                                                               |
| ----------------------- | ------------------------------------------------------------------------- |
| `UNKNOWN_ERROR`         | The canister returned an error, or there was an error while connecting.   |
| `CANT_REACH_CANISTER`   | The canister is unavailable. It might happen when there is a `503` error. |
| `NO_PRINCIPAL_PROVIDED` | There was not principal provided.                                         |

#### Usage example

```js
const principalFromId = Principal.fromText('YOUR PRINCIPAL ID');
const response = await getNftBalance(principalFromId);
```

or

```js
/* This will use the principal provided within OrigynClient */

const principalFromId = Principal.fromText('YOUR PRINCIPAL ID');
OrigynClient.getInstance().principal = principalFromId;
const response = await getNftBalance();

if (response.ok)
  // response.ok.nfts contains the list of nfts
else if (response.err)
  // something wrong happend
```

<a name="getNft"></a>

## getNft(tokenId) ⇒ `Promise<OrigynResponse<NftInfoStable, GetNftErrors>>`

Returns all data for a nft, which is provided using the `tokenId` parameter.

#### `NftInfoStable` Type

| Name         | Type        | Description                                          |
| ------------ | ----------- | ---------------------------------------------------- |
| metadata     | `Metadata`  | Metadata object, contains information about the NFT. |
| current_sale | `Auction[]` | Contains a list with received escrows.               |

`GetNftErrors` Enumeration is the same as [`GetBalanceErrors`](#OrigynClient+getPrincipal) .

#### Usage example:

```js
const response = await getNft('nft-id');

if (response.ok) {
  const { metadata } = response.ok;
  const ownerField = metadata?.find((data) => data.name === 'owner');
  console.log(ownerField.value.Principal.toText());
  // This will output the principal id of the owner of the NFT.
}
else if (response.err)
  // something wrong happend
```

<a name="getNftHistory"></a>

### getNftHistory(tokenId, start, end) ⇒ `Promise<OrigynResponse<TransactionType, GetNftErrors>>`

Get transaction hitsory of an NFT between the `start` and the `end` date if provided.

| Param   | Type     | Default | Description                            |
| ------- | -------- | ------- | -------------------------------------- |
| tokenId | `string` |         | The token id of the NFT.               |
| start   | `BigInt` | `[]`    | Bottom date of the transaction search. |
| end     | `BigInt` | `[]`    | Upper date of the transaction search.  |

`GetNftErrors` Enumeration is the same as [`GetBalanceErrors`](#OrigynClient+getPrincipal) .

#### Usage example:

```js
const start = 1662638707000000000n; // Thursday, September 8, 2022
const end = 1662638707000000000n; // Friday, September 2, 2022
const response = await getNftHistory('nft-id', start, end);

if (response.ok) {
  const history: TransactionType[] = response.ok;
  for(const transaction in history) {
    const { tokenId, txn_type, timestamp, index } = transaction;
    console.log(`Token ${tokenId} had a transaction (#${index}) on ${timestamp}: ${txn_type}`);
  }
}
else if (response.err)
  // something wrong happend
```

When the request is successful, an array of `TransactionType` will be returned. Each transaction will be represented within the object of `txn_type`, being one of the following:

- `auction_bid`
- `burn`
- `canister_managers_updated`
- `canister_network_updated`
- `canister_owner_updated`
- `data`
- `escrow_deposit`
- `escrow_withdraw`
- `mint`
- `owner_transfer`
- `royalty_paid`
- `sale_ended`
- `sale_opened`
- `sale_withdraw`

<a name="getCanisterCycles"></a>

### getCanisterCycles(canisterId?: string) ⇒ `Promise<BigInt>`

Get cycles of the current canister or of the canister provided as argument.

| Param      | Type     | Default | Description                                                                                                   |
| ---------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| canisterId | `string` |         | The `canisterId` to get the cycle for. If it is not provided, the canister id from OrigynClient will be used. |

#### Usage example:

```js
const cycles = await getCanisterCycles();

console.log('OrigynClient canister cycles: ', cycles);
```

```js
const cycles = await getCanisterCycles(canisterId);

console.log(`Available cycles: ${cycles} from canister ${canisterId}`);
```

<a name="getCanisterAvailableStorage"></a>

### getCanisterAvailableStorage(canisterId?: string) ⇒ `Promise<BigInt>`

Get cycles of the current canister or of the canister provided as argument.

| Param      | Type     | Default | Description                                                                                                             |
| ---------- | -------- | ------- | ----------------------------------------------------------------------------------------------------------------------- |
| canisterId | `string` |         | The `canisterId` to get the available space for. If it is not provided, the canister id from OrigynClient will be used. |

#### Usage example:

```js
const availableSpace = await getCanisterAvailableStorage();

console.log('OrigynClient canister available space: ', cycles);
```

```js
const availableSpace = await getCanisterAvailableStorage(canisterId);

console.log(`Available cycles: ${cycles} from canister ${canisterId}`);
```

<a name="getCollectionLibrary"></a>

### getCollectionLibrary(libraryId) ⇒ `Promise<Array<MetdataClass>>`

Get the collection level library, specified as argument.

| Param     | Type     | Default | Description                                |
| --------- | -------- | ------- | ------------------------------------------ |
| libraryId | `string` |         | The `library_id` of the requested library. |

#### Usage example:

```js
const response = await getCollectionLibrary('dapp.html');

console.log('Library title: ', response.Class.library_title);
```

<a name="updateNftApps"></a>

### updateNftApps(tokenId: string, data: any) ⇒ `Promise<boolean>`

Update the nft \_\_apps property, the data argument needs to be candy-parsed.

| Param   | Type     | Default | Description                  |
| ------- | -------- | ------- | ---------------------------- |
| tokenId | `string` |         | The `tokenId` to be updated. |
| data    | `string` |         | Data to be updated           |

#### Usage example:

```js
const payload = {
  Class: [
    {
      name: 'app_id',
      value: {
        Text: 'public.yourdata', // <--- this will be used as identifier
      },
      immutable: false,
    },
    {
      name: 'read',
      value: {
        Text: 'public',
      },
      immutable: false,
    },
    {
      name: 'data',
      value: {
        Class: [
          // place here the data
        ],
      },
      immutable: false,
    },
  ],
};
const response = await updateNftApps('token-01', payload);
```

<a name="updateLibraryMetadata"></a>

### updateLibraryMetadata(tokenId: string, libraryId: string, data: `Record<string, string | number | boolean>`) ⇒ `Promise<Array<MetdataClass>>`

Update the properties within the metadata of a library.

| Param     | Type                    | Default | Description                                                     |
| --------- | ----------------------- | ------- | --------------------------------------------------------------- |
| tokenId   | `string`                |         | The `tokenId` which contains the library.                       |
| libraryId | `string`                |         | The `libraryId` of the library we want to update.               |
| data      | `Record<string, value>` |         | A key, value record containing the properties we want to update |

#### Usage example:

```js
const data = {
  title: 'New Wallet Title',
};
const response = await updateLibraryMetadata('token-01', 'wallet.html', data);
```

<a name="setLibraryImmutable"></a>

### setLibraryImmutable(tokenId: string, libraryId: string) ⇒ `Promise<OrigynResponse<undefined, StageLibraryAssetErrors >>`

Update a mutable library to immutable.

| Param     | Type     | Default | Description                                       |
| --------- | -------- | ------- | ------------------------------------------------- |
| tokenId   | `string` |         | The `tokenId` which contains the library.         |
| libraryId | `string` |         | The `libraryId` of the library we want to update. |

```js
const response = await setLibraryImmutable('token-01', 'wallet.html');
```

## 🛢️ Canister

<a name="setCanisterStorage"></a>

### setCanisterStorage(storage: number) ⇒ `Promise<OrigynResponse<ManageStorageResponse, GetCanisterError >>`

Updates the canister owner

| Param   | Type     | Default | Description                                  |
| ------- | -------- | ------- | -------------------------------------------- |
| storage | `number` |         | Amount of storage to be set for the canister |

```js
const response = await setCanisterStorage(500_000_000);
```

<a name="setCanisterOwner"></a>

### setCanisterOwner(principal: Principal | string) ⇒ `Promise<OrigynResponse<bool, GetCanisterError >>`

Updates the canister owner

| Param     | Type    | Default    | Description |
| --------- | ------- | ---------- | ----------- | --------------------------------------- |
| principal | `string | Principal` |             | The `principal` to be assigned as owner |

```js
const response = await setCanisterOwner('nayto-yhiky-76bvl-3qeh5-eupz7-sgmun-mn5fu-ezr5c-xfdcm-zpk37-6qe');
```
