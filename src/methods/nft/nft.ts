import { OrigynResponse, TransactionType } from '../../types/origynTypes';
import { OrigynClient } from '../../origynClient';
import {
  buildStageConfig,
  stage,
  buildCollectionFile,
  buildNftFile,
  stageLibraryAsset as canisterStageLibraryAsset,
  getFileArrayBuffer,
  getFileSize,
} from './stage';
import {
  StageConfigArgs,
  StageFile,
  LibraryFile,
  Metrics,
  MetadataClass,
  StageConfigSettings,
  StageNft,
} from './types';
import { Principal } from '@dfinity/principal';
import { createClassesForResourceReferences, createClassForResource, createLibrary } from './metadata';
import { GetCollectionErrors, getNftCollectionInfo } from '../collection';

export const getNft = async (token_id: string): Promise<OrigynResponse<NftInfoStable, GetNftErrors>> => {
  try {
    const actor = OrigynClient.getInstance().actor;
    const response: any = await actor.nft_origyn(token_id);
    if (response.ok || response.err) {
      return response;
    } else {
      return { err: { error_code: GetNftErrors.UNKNOWN_ERROR } };
    }
  } catch (e) {
    return { err: { error_code: GetNftErrors.CANT_REACH_CANISTER } };
  }
};

export const stageCollection = async (args: StageConfigArgs): Promise<OrigynResponse<any, GetNftErrors>> => {
  try {
    const stageConfig = await buildStageConfig(args);
    const response = await stage(stageConfig);
    if (response.ok || response.err) {
      return response;
    } else {
      return { err: { error_code: GetNftErrors.UNKNOWN_ERROR, text: response.err } };
    }
  } catch (e: any) {
    return { err: { error_code: GetNftErrors.CANT_REACH_CANISTER, text: e.message } };
  }
};

export const stageNfts = async (
  args: StageNftsArgs,
): Promise<OrigynResponse<any, GetNftErrors | GetCollectionErrors>> => {
  try {
    const collectionInfo = await getNftCollectionInfo(true);
    if (collectionInfo.err) {
      return collectionInfo;
    }

    const creatorPrincipal =
      collectionInfo.ok?.creator.principal instanceof Principal
        ? collectionInfo.ok?.creator.principal.toText()
        : collectionInfo.ok?.creator.principal ?? '';

    const stageConfigArgs: StageConfigArgs = {
      collectionDisplayName: collectionInfo.ok?.name ?? '',
      collectionFiles: [],
      collectionId: collectionInfo.ok?.name ?? '',
      creatorPrincipal,
      environment: 'local',
      namespace: collectionInfo.ok?.namespace ?? '',
      nftCanisterId: OrigynClient.getInstance().canisterId,
      nftOwnerId: creatorPrincipal,
      nfts: args.nfts,
      soulbound: args.soulbound ?? true,
      tokenPrefix: `${collectionInfo.ok?.id}-`,
      useProxy: args.useProxy ?? true,
      startNftIndex: (collectionInfo.ok?.lastNftIndex ?? -1) + 1,
    };
    const stageConfig = await buildStageConfig(stageConfigArgs);
    const response = await stage(stageConfig, true);
    if (response.ok || response.err) {
      return response;
    } else {
      return { err: { error_code: GetNftErrors.UNKNOWN_ERROR, text: response.err } };
    }
  } catch (e: any) {
    return { err: { error_code: GetNftErrors.CANT_REACH_CANISTER, text: e.message } };
  }
};

export const stageLibraryAsset = async (
  files: StageFile[],
  token_id?: string,
): Promise<OrigynResponse<any, StageLibraryAssetErrors | GetCollectionErrors | GetNftErrors>> => {
  try {
    const collectionInfo = await getNftCollectionInfo();
    if (collectionInfo.err) {
      return collectionInfo;
    }

    const nftInfo = await getNft(token_id ?? '');
    if (nftInfo.err) {
      return nftInfo;
    }

    const { namespace } = collectionInfo.ok!;

    const settings: StageConfigSettings = {
      // @ts-ignore
      args: {
        namespace,
      },
      fileMap: {},
      collectionLibraries: [],
      totalFileSize: 0,
    };

    const nftLibrariesArray = nftInfo?.ok?.metadata?.Class?.find((item) => item.name === 'library')?.value?.Array
      ?.thawed;

    const lastSortValue =
      nftLibrariesArray.reduce((previous: number, library: any) => {
        const sortValue = library.Class.find((item) => item.name === 'sort')?.value?.Nat ?? 0;
        return sortValue < previous ? sortValue : previous;
      }, 0) ?? 0;
    const resources: MetadataClass[] = [];

    // Get the Raw file if called from a node context (csm.js)
    for (let i = 0; i < files.length; i++) {
      if (!files[i].rawFile) {
        files[i].rawFile = await getFileArrayBuffer(files[i]);
        files[i].size = await getFileSize(files[i]);
      }
    }

    let sort = lastSortValue + 1;
    // stage_library_nft_origyn
    for (const file of files) {
      if (token_id) {
        const fileCategory = file.filename.indexOf('.html') !== -1 ? 'dapp' : 'collection';
        settings.fileMap[file.path] = buildCollectionFile(settings, { category: fileCategory, ...file });
      } else {
        settings.fileMap[file.path] = buildNftFile(settings, file, token_id!);
      }
      settings.totalFileSize += file.size ?? 0;
      resources.push(createClassForResource(settings, file, sort));
      const library = createLibrary(settings, file);
      settings.collectionLibraries.push(library);
      sort++;
    }

    const metrics: Metrics = { totalFileSize: 0 };

    return Promise.all(
      files.map(
        async (file) =>
          new Promise(async (resolve, reject) => {
            // here we also need to create the Meta
            const libraryAsset: LibraryFile = createLibrary(settings, file);

            const result: any = await canisterStageLibraryAsset(
              libraryAsset,
              token_id ?? '',
              metrics,
              resources[0].Class,
            );
            if (result.ok) {
              resolve(result.ok);
            } else {
              reject(result.error);
            }
          }),
      ),
    )
      .then((result) => {
        return {
          ok: result,
        };
      })
      .catch((err) => {
        return {
          err: {
            error_code: StageLibraryAssetErrors.ERROR_WHILE_STAGING,
            text: err,
          },
        };
      });
  } catch (e: any) {
    return { err: { error_code: StageLibraryAssetErrors.CANT_REACH_CANISTER, text: e.message } };
  }
};

export const mintNft = async (token_id: string, principal?: Principal): Promise<OrigynResponse<any, GetNftErrors>> => {
  try {
    const { actor, principal: _principal } = OrigynClient.getInstance();
    const response = await actor.mint_nft_origyn(token_id, {
      principal: principal ?? _principal,
    });
    if (response.ok || response.err) {
      return response;
    } else {
      return { err: { error_code: GetNftErrors.UNKNOWN_ERROR } };
    }
  } catch (e: any) {
    return { err: { error_code: GetNftErrors.CANT_REACH_CANISTER, text: e.message } };
  }
};

export const getNftHistory = async (
  token_id: string,
  start?: BigInt,
  end?: BigInt,
): Promise<OrigynResponse<TransactionType, GetNftErrors>> => {
  try {
    const actor = OrigynClient.getInstance().actor;
    const args = {
      start: start ? [start] : [],
      end: end ? [end] : [],
    };
    const response = await actor.history_nft_origyn(token_id, args.start, args.end);
    if (response.ok || response.error) {
      return response;
    } else {
      return { err: { error_code: GetNftErrors.UNKNOWN_ERROR } };
    }
  } catch (e) {
    return { err: { error_code: GetNftErrors.CANT_REACH_CANISTER } };
  }
};

export enum GetNftErrors {
  UNKNOWN_ERROR,
  CANT_REACH_CANISTER,
}
export enum StageLibraryAssetErrors {
  UNKNOWN_ERROR,
  CANT_REACH_CANISTER,
  ERROR_WHILE_STAGING,
}

type NftInfoStable = {
  metadata: any;
  current_sale?: any;
};
type StageNftsArgs = {
  nfts: StageNft[];
  useProxy?: boolean;
  soulbound?: boolean;
};
