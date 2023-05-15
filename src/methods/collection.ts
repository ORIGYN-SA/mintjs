import { OrigynResponse } from '../types/methods';
import { OrigynClient } from '../origynClient';
import { Principal } from '@dfinity/principal';
import { getNftLibraries } from './nft/nft';
import { CollectionInfo } from '../types';
import { TextValue } from './nft/types';

export const getNftCollectionMeta = async (): Promise<OrigynResponse<CollectionInfo, GetCollectionErrors>> => {
  try {
    const actor = OrigynClient.getInstance().actor;
    const response = await actor.collection_nft_origyn([]);

    if ('ok' in response || 'err' in response) {
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

  /* tslint:disable:no-string-literal */
  const meta = collectionMeta.ok?.metadata?.[0]?.['Class'];
  const __appsValue = meta?.find((data) => data.name === '__apps')?.value;
  const readField = __appsValue?.Array[0].Class.find((item) => item.name === 'read')?.value.Text;
  const writeField = __appsValue?.Array[0].Class.find((item) => item.name === 'write')
    ?.value?.Class?.find((classItem) => classItem.name === 'list')
    ?.value?.Array?.map((principal) =>
      formatPrincipalAsString ? Principal.fromUint8Array(principal).toText() : principal,
    );

  const dataField = __appsValue?.Array[0].Class.find((item) => item.name === 'data');
  const collectionId = dataField?.value?.Class?.find((item) => item.name.indexOf('collection_id') !== -1)?.value?.Text;
  const displayName = dataField?.value?.Class?.find((item) => item.name.indexOf('display_name') !== -1)?.value?.Text;
  const collectionDescription = dataField?.value?.Class?.find((item) => item.name === 'description')?.value?.Text;
  const collectionOwner = meta.find((p) => p.name === 'owner')?.value?.Principal?.toText();

  return {
    ok: {
      availableSpace: Number(collectionMeta?.ok?.available_space?.[0] || 0),
      owner: collectionOwner,
      description: collectionDescription,
      id: collectionId,
      displayName,
      network: collectionMeta?.ok?.network?.[0]?.toText() ?? '',
      read: readField,
      tokens: collectionMeta?.ok?.token_ids?.[0] ?? [],
      tokensCount: Number(collectionMeta?.ok?.token_ids_count?.[0] || 0),
      write: writeField,
    },
  };
};
export const getCollectionLibraries = async () => getNftLibraries('');

export const getCollectionLibrary = async (libraryId: string) => {
  const libraries = await getCollectionLibraries();

  return libraries.find(({ Class }) =>
    Class.find((prop) => prop.name === 'library_id' && (prop.value as TextValue).Text === libraryId),
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
  owner: string;
  description: string;
  id: string;
  displayName: string;
  network: string;
  read: string;
  tokens: string[];
  tokensCount: number;
  write: string[] | Principal[];
};
