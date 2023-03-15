import { OrigynResponse } from '../types/methods';
import { OrigynClient } from '../origynClient';
import { Principal } from '@dfinity/principal';
import { getNftLibraries } from './nft/nft';

export const getNftCollectionMeta = async (
  arg?: any[],
): Promise<OrigynResponse<CollectionMeta, GetCollectionErrors>> => {
  try {
    // TODO: make sense out of this type
    // collection_nft_origyn(fields : ?[(Text,?Nat, ?Nat)])
    const fields = arg as [[string, [] | [bigint], [] | [bigint]][]];

    const actor = OrigynClient.getInstance().actor;
    const response: any = await actor.collection_nft_origyn(fields ?? []);
    if (response.ok || response.error) {
      return response;
    } else {
      return { err: { error_code: GetCollectionErrors.UNKNOWN_ERROR } };
    }
  } catch (e: any) {
    return { err: { error_code: GetCollectionErrors.CANT_REACH_CANISTER, text: e.message } };
  }
};

export const getNftCollectionInfo = async (
  formatPrincipalAsString: boolean = false,
): Promise<OrigynResponse<CollectionInfoType, GetCollectionErrors>> => {
  const collectionMeta = await getNftCollectionMeta();
  if (collectionMeta.err) {
    return { err: collectionMeta.err };
  }

  const meta = collectionMeta.ok?.metadata?.[0]?.Class;
  const __appsValue = meta?.find((data) => data.name === '__apps')?.value;
  const readField = __appsValue?.Array.thawed[0].Class.find((item) => item.name === 'read')?.value.Text;
  const writeField = __appsValue?.Array.thawed[0].Class.find((item) => item.name === 'write')
    ?.value?.Class?.find((classItem) => classItem.name === 'list')
    ?.value?.Array?.thawed.map((principal) =>
      formatPrincipalAsString ? Principal.fromUint8Array(principal).toText() : principal,
    );

  const dataField = __appsValue?.Array.thawed[0].Class.find((item) => item.name === 'data');
  const collectionId = dataField?.value?.Class?.find((item) => item.name.indexOf('collectionid') !== -1)?.value?.Text;
  const collectionName = dataField?.value?.Class?.find((item) => item.name.indexOf('name') !== -1)?.value?.Text;
  const collectionDescription = dataField?.value?.Class?.find((item) => item.name === 'description')?.value?.Text;
  const collectionCreatorName = dataField?.value?.Class?.find((item) => item.name.indexOf('creator_name') !== -1)?.value
    ?.Text;
  const collectionCreatorPrincipal = dataField?.value?.Class?.find(
    (item) => item.name.indexOf('creator_principal') !== -1,
  )?.value?.Principal;

  const lastNftIndex =
    collectionMeta?.ok?.token_ids?.[0].reduce((previous: number, value: string) => {
      const b = parseInt(value?.split('-')?.pop() ?? '0', 10);
      return previous > b ? previous : b;
    }, 0) ?? 0;

  return {
    ok: {
      availableSpace: collectionMeta?.ok?.available_space?.[0],
      creator: {
        name: collectionCreatorName,
        principal: formatPrincipalAsString
          ? Principal.fromUint8Array(collectionCreatorPrincipal).toText()
          : collectionCreatorPrincipal,
      },
      description: collectionDescription,
      id: collectionId,
      lastNftIndex: lastNftIndex ? lastNftIndex : collectionMeta?.ok?.token_ids_count?.[0],
      name: collectionName,
      network: collectionMeta?.ok?.network?.[0] ?? '',
      read: readField,
      tokens: collectionMeta?.ok?.token_ids?.[0] ?? [],
      tokensCount: collectionMeta?.ok?.token_ids_count?.[0],
      write: writeField,
    },
  };
};
export const getCollectionLibraries = async () => getNftLibraries('');

export const getCollectionLibrary = async (libraryId: string) => {
  const libraries = await getCollectionLibraries();

  return libraries.find(({ Class }) =>
    Class.find((prop) => prop.name === 'library_id' && prop.value.Text === libraryId),
  );
};

export const getCollectionDapps = async () => {
  const library = await getCollectionLibraries();

  const dApps = library.filter(({ Class }) => Class.some((prop) => prop.name === 'com.origyn.dapps.version'));
  return dApps ?? [];
};

export enum GetCollectionErrors {
  UNKNOWN_ERROR,
  CANT_REACH_CANISTER,
}

export type CollectionMeta = {
  multi_canister_count?: BigInt;
  managers?: Principal[];
  owner?: Principal;
  metadata?: any;
  logo?: string;
  name?: string;
  network?: Principal;
  fields?: [string, BigInt?, BigInt?][];
  token_ids_count?: BigInt;
  available_space?: BigInt;
  multi_canister?: Principal[];
  token_ids?: string[][];
  total_supply?: BigInt;
  symbol?: string;
  allocated_storage?: BigInt;
};

export type CollectionInfoType = {
  availableSpace: number;
  creator: {
    name: string;
    principal: Principal | string;
  };
  description: string;
  id: string;
  name: string;
  network: string;
  read: string;
  tokens: string[];
  tokensCount: number;
  write: string[] | Principal[];
  lastNftIndex: number;
};
