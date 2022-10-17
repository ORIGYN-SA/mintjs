import { OrigynResponse, TransactionType } from '../../types/origynTypes';
import { OrigynClient } from '../../origynClient';
import {
  buildStageConfig,
  stage,
  buildCollectionFile,
  buildNftFile,
  stageLibraryAsset,
  getFileArrayBuffer,
  getFileSize,
} from './stage';
import { StageConfigArgs, StageFile, LibraryFile, Metrics, MetadataClass, StageConfigSettings } from './types';
import { Principal } from '@dfinity/principal';
import { createClassesForResourceReferences, createClassForResource, createLibrary } from './metadata';
import { GetCollectionErrors, getNftCollection } from '../collection';

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

export const stageNft = async (args: StageConfigArgs): Promise<OrigynResponse<any, GetNftErrors>> => {
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

export const stageLibraryAsset2 = async (
  files: StageFile[],
  token_id?: string,
): Promise<OrigynResponse<any, StageLibraryAssetErrors | GetCollectionErrors>> => {
  try {
    const collectionInfo = await getNftCollection();
    if (collectionInfo.err) {
      return collectionInfo;
    }

    const meta = collectionInfo.ok?.metadata[0].Class;
    const __appsValue = meta?.find((data) => data.name === '__apps').value;
    const collectionNamespace = __appsValue.Array.thawed[0].Class.find((item) => item.name === 'app_id').value.Text;
    const settings: StageConfigSettings = {
      // @ts-ignore
      args: {
        namespace: collectionNamespace,
      },
      fileMap: {},
      collectionLibraries: [],
      totalFileSize: 0,
    };

    let sort = 1;
    const resources: MetadataClass[] = [];

    // Get the Raw file if called from a node context (csm.js)
    for (let i = 0; i < files.length; i++) {
      if (!files[i].rawFile) {
        files[i].rawFile = await getFileArrayBuffer(files[i]);
        files[i].size = await getFileSize(files[i]);
      }
    }

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

    console.log(resources);
    const metrics: Metrics = { totalFileSize: 0 };

    return Promise.all(
      files.map(
        async (file) =>
          new Promise(async (resolve, reject) => {
            // here we also need to create the Meta
            const libraryAsset: LibraryFile = createLibrary(settings, file);
            const result: any = await stageLibraryAsset(libraryAsset, token_id ?? '', metrics);
            console.log('🚀 ~ file: nft.ts ~ line 91 ~ newPromise ~ result', result);
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
