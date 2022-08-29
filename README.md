


## ORIGYN Mint.js
### Installation
```
npm i mintjs
```
###  Local testing of unpublished mint.js
If you have a local repository of the mint.js code, you can make npm point to its build using:
```
npm i <path-to-mint-js>
```
### Usage
Start by importing the `mintjs` in your code.
```js
import { getNftBalance } from 'mintjs';
```
Now, we can call the `getNftBalance` method anywhere in the code.

For instance, let's try to get the balance of NFTs in our wallet by passing our principal as a string. The `principal` argument can be both a `string` or a `Principal` type from `@dfinity/principal`.
```js
const response = getNftBalance(principal.toText());

if (response.ok)
	console.log(response.ok.nfts);
else 
	console.log(`There was an error while getting the balance: ${response.err}`);
```
# Documentation

- [Documentation](#documentation)
	- [OrigynClient](#OrigynClient)
		- [OrigynClient.getInstance().init(canisterId, auth) ⇒ <code>void</code>](#OrigynClient+getIntstance+init)
		- [<code> set</code> OrigynClient.getInstance().principal(principal) ⇒ <code>void</code>](#OrigynClient+setPrincipal)
		- [<code> get</code> OrigynClient.getInstance().principal⇒ <code>Principal</code>](#OrigynClient+getPrincipal)
		-  [getNftBalance(principal)](#getNftBalance)
		-  [getNft(token) ](#getNft)


<a name="OrigynClient"></a>
### OrigynClient
The mint.js library is using a singleton in order to provide global configuration and access to canister configuration.

<a name="OrigynClient+getIntstance+init"></a>
### OrigynClient.getInstance().init(canisterId, auth) ⇒ <code>void</code>


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| canisterId | <code>string</code> | ORIGYN_CANISTER | Id of the canister to maintain a communication with. |
| auth | <code>AuthType</code> | <code>{}</code> | Optional parameter providing either an `actor`, an `identity` or an `agent`. If no parameter is provided, anonymous identity will be created.  |

<a name="OrigynClient+setPrincipal"></a>
### <code> set</code> OrigynClient.getInstance().principal(principal) ⇒ <code>void</code>

We can dynamically change the principal which calls the methods within OrigynClient by changing the `principal`.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| principal | <code>string</code> or <code>Principal</code>  | | The id of the principal or the object (as `Principal`). |


<a name="OrigynClient+getPrincipal"></a>
### <code> get</code> OrigynClient.getInstance().principal⇒ <code>Principal</code>

**Returns**: <code>Principal</code> - The current principal within the OrigynCleint  

<a name="getNftBalance"></a>

### getNftBalance(principal) ⇒ <code>Promise<OrigynResponse<BalanceOfNftOrigyn, GetBalanceErrors>></code>
Returns the NFTs balance of the provided `principal`. If no `principal` is provided, it will use the `principal` in the `OrigynClient`. If there is no `principal` at all, this method will throw a [<code>NO_PRINCIPAL_PROVIDED</code>](#enum+balance+no-principal) error.


**Returns**: <code>Promise<OrigynResponse<BalanceOfNftOrigyn, GetBalanceErrors>></code> - JSON Response  containing the response of the method.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| principal | <code>string</code> or <code>Principal</code | [<code>OrigynClient.getInstance().principal</code>](#OrigynClient+getPrincipal)   | Principal to request the balance for. |



#### `BalanceOfNftOrigyn` Type
| Name | Type | Description |
| --- | --- | --- |
| nfts | <code>string[]</code> | List with every owned NFT by the requested principal. |
| offers | <code>EscrowRecord[]</code> | Contains a list with received escrows.
| sales | <code>EscrowRecord[]</code> | List with active sales started.
| stake | <code>StakeRecord[]</code> | Array with current stakes.
| multi_canister | <code>Principal[]</code> |
| escrows | <code>EscrowRecord[]</code> | Sent escrows by that principal.

#### `GetBalanceErrors` Enum
| Name | Description |
| --- | --- |
| `UNKNOWN_ERROR` | The canister returned an error, or there was an error while connecting. |
| `CANT_REACH_CANISTER` | The canister is unavailable. It might happen when there is a `503` error.
| `NO_PRINCIPAL_PROVIDED` | There was not principal provided.
<a name="enum+balance+no-principal"></a>

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
### getNft(token_id) ⇒ <code>Promise<OrigynResponse<NftInfoStable, GetNftErrors>></code>

Returns all data for a nft, which is provided using the `token_id` parameter.

#### `NftInfoStable` Type
| Name | Type | Description |
| --- | --- | --- |
| metadata | <code>Metadata</code> | Metadata object, contains information about the NFT. |
| current_sale | <code>Auction[]</code> | Contains a list with received escrows.

`GetNftErrors` Enumeration is the same as [<code>GetBalanceErrors</code>](#OrigynClient+getPrincipal) .

#### Usage example:

```js
const response = await getNft('nft-id');

if (response.ok)
	const { metadata } = response.ok;
	const ownerField = metadata?.find((data) => data.name === 'owner');
	console.log(ownerField.value.Principal.toText());
	// This will output the principal id of the owner of the NFT.
else if (response.err)
	// something wrong happend
```

