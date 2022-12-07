import { lookup } from 'mrmime';
import { OrigynResponse, TransactionType } from '../../types/origynTypes';
import { OrigynClient } from '../../origynClient';
import {
  buildCollectionFile,
  buildNftFile,
  buildStageConfig,
  canisterStageLibraryAsset,
  getFileArrayBuffer,
  getFileSize,
  stage,
} from './stage';
import {
  StageConfigArgs,
  StageFile,
  LibraryFile,
  Metrics,
  MetadataClass,
  MetadataProperty,
  StageConfigSettings,
  StageNft,
  LocationType,
  NatValue,
  TextValue,
  ChunkUploadResult,
} from './types';
import { Principal } from '@dfinity/principal';
import {
  createClassForResource,
  createLibrary,
  createTextAttrib,
  createNatAttrib,
  getLibraries,
  getAttribute,
  getClassByTextAttribute,
  createBoolAttrib,
} from './metadata';
import { GetCollectionErrors, getNftCollectionInfo } from '../collection';
import { getFileHash } from '../../utils';

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
export const stageNftUsingMetadata = async (
  metadata: any,
): Promise<OrigynResponse<any, GetNftErrors | GetCollectionErrors>> => {
  try {
    const { actor } = OrigynClient.getInstance();
    const response = await actor.stage_nft_origyn(metadata);
    if (response.ok || response.error || response.err) {
      return response;
    } else {
      return { err: { error_code: GetNftErrors.UNKNOWN_ERROR } };
    }
  } catch (e: any) {
    return { err: { error_code: GetNftErrors.CANT_REACH_CANISTER, text: e.message } };
  }
};

export const stageNewLibraryAsset = async (
  files: StageFile[],
  useProxy: boolean = false,
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

    const { name } = collectionInfo.ok!;

    const settings: StageConfigSettings = {
      // @ts-ignore
      args: {
        useProxy,
        collectionDisplayName: name,
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
    // tslint:disable-next-line prefer-for-of
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
        settings.fileMap[file.path] = buildNftFile(settings, file, token_id);
      } else {
        const fileCategory = file.filename.indexOf('.html') !== -1 ? 'dapp' : 'collection';
        settings.fileMap[file.path] = buildCollectionFile(settings, { category: fileCategory, ...file });
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

            const result: any = await canisterStageLibraryAsset(libraryAsset, token_id ?? '', metrics, resources[0]);
            if (result?.ok) {
              resolve({ ok: result.ok });
            } else {
              reject({ err: result.err });
            }
          }),
      ),
    )
      .then((result: any) => {
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
    return { err: { error_code: StageLibraryAssetErrors.CANT_REACH_CANISTER, text: e } };
  }
};

const buildLibraryMetadata = async (
  tokenId: string,
  libraryId: string,
  title: string,
  locationType: LocationType,
  immutable: boolean = false,
  file?: StageFile,
  webUrl?: string): Promise<MetadataClass> => {
  
    let location = '';
    let contentType = '';
    let size = 0n;

    if (locationType === 'web') {
      if (!webUrl?.trim()) {
        throw new Error('Missing webUrl when locationType is web');
      }
      location = webUrl.trim();
      contentType = 'text/html';
    } else if (locationType === 'collection') {
      // get the collection metadata
      const collInfo = await getNft('');
      if (collInfo.err) {
        throw new Error('Could not retrieve collection metadata');
      }
      const collMetadataClass = collInfo.ok?.metadata as MetadataClass;
      
      // get the library in the collection metadata
      const collLibraries = getLibraries(collMetadataClass);
      const collLibrary = getClassByTextAttribute(collLibraries, 'library_id', libraryId);
      if (!collLibrary) {
        const err = `Could not find library "${libraryId}" at the collection level`;
        throw new Error(err);
      }

      // get the location of the collection library
      const collLibraryLocation = getAttribute(collLibrary, 'location');
      if (!collLibraryLocation) {
        const err = `Could not find the location attribute in the collection library "${libraryId}"`;
        throw new Error(err);
      }
      location = (collLibraryLocation.value as TextValue).Text;

      // get the mime-type of the collection library
      const collContentType = getAttribute(collLibrary, 'content_type');
      if (collContentType) {
        contentType = (collContentType.value as TextValue)?.Text || '';
      } else {
        const err = `Could not find the content_type attribute in collection library "${libraryId}"`;
        throw err;
      }
    } else if (locationType === 'canister') {
      if (!file) {
        const err = `Missing file when locationType is canister`;
        throw err;
      }
      size = BigInt(file.size ?? 0);
      location = `-/${tokenId}/-/${libraryId}`;
      contentType = lookup(file.filename.toLowerCase()) || '';
    }

    if (!contentType) {
      const err = `Could not determine the content type of library "${libraryId}" with location type "${locationType}"`
      throw new Error(err);
    }
    
    // get the NFT
    const nftInfo = await getNft(tokenId);
    if (nftInfo.err) {
      const err = `Could not find NFT with token ID "${tokenId}"`;
      throw new Error(err);
    }
    
    // ensure the title is not already used by one of the libraries
    const nftMetadataClass =  nftInfo.ok?.metadata as MetadataClass;
    const nftLibraries = getLibraries(nftMetadataClass);
    const existingLibraryWithTitle = getClassByTextAttribute(nftLibraries, 'title', title);
    if (existingLibraryWithTitle) {
      const err = `Library already exists with title "${title}"`;
      throw new Error(err);
    }

    // get highest sort value
    let maxSort = 0n;
    for (const library of nftLibraries) {
      const sortAttrib = getAttribute(library, 'sort');
      if (sortAttrib) {
        const sort = (sortAttrib.value as NatValue)?.Nat || 0n;
        maxSort = sort > maxSort ? sort : maxSort;
      }
    }
    if (maxSort < nftLibraries.length + 1) {
      maxSort = BigInt(nftLibraries.length + 1);
    }

    const attribs: MetadataProperty[] = [];
  
    attribs.push(createTextAttrib('library_id', libraryId, false))
    attribs.push(createTextAttrib('title', title, false));
    attribs.push(createTextAttrib('location_type', locationType, false));
    attribs.push(createTextAttrib('location', location, false));
    attribs.push(createTextAttrib('content_type', contentType, false));
    if (locationType === 'canister' && file) {
      attribs.push(createTextAttrib('content_hash', getFileHash(file.rawFile), false));
    }
    attribs.push(createNatAttrib('size', size, false));
    attribs.push(createNatAttrib('sort', maxSort + 1n, false));
    attribs.push(createTextAttrib('read', 'public', false));
    if (immutable) {
      attribs.push(createBoolAttrib('com.origyn.immutable_library', true, true));
    }

    const libraryMetadata =  { Class: attribs };
    return libraryMetadata;
};

export const stageCollectionLibraryAsset = async (
  tokenId: string = '',
  title: string = '',
  collectionLibraryId: string,
  immutable: boolean = false
): Promise<OrigynResponse<any, StageLibraryAssetErrors | GetCollectionErrors>> => {
  try {
    const metadata = await buildLibraryMetadata(tokenId, collectionLibraryId, title, 'collection', immutable);

    const libraryAsset: LibraryFile = {
      library_id: collectionLibraryId,
      library_file: { filename:'', path: '', size: 0, rawFile: Buffer.from([]) },
    };

    const metrics: Metrics = { totalFileSize: 0 };

    return await canisterStageLibraryAsset(libraryAsset, tokenId, metrics, metadata);

  } catch (err: any) {
    return { err: { error_code: StageLibraryAssetErrors.ERROR_WHILE_STAGING, text: err?.message || err } };
  }
}

export const stageWebLibraryAsset = async (
  tokenId: string = '',
  title: string = '',
  webUrl: string,
  immutable: boolean = false
): Promise<OrigynResponse<any, StageLibraryAssetErrors | GetCollectionErrors>> => {

  try {
    const libraryId = title.toLowerCase().replace(/\s+/g, '-');

    const metadata = await buildLibraryMetadata(tokenId, libraryId, title, 'web', immutable, undefined, webUrl);

    const libraryAsset: LibraryFile = {
      library_id: libraryId,
      library_file: { filename:'', path: '', size: 0, rawFile: Buffer.from([]) },
    };

    const metrics: Metrics = { totalFileSize: 0 };

    return await canisterStageLibraryAsset(libraryAsset, tokenId, metrics, metadata);

  } catch (err: any) {
    return { err: { error_code: StageLibraryAssetErrors.ERROR_WHILE_STAGING, text: err?.message || err } };
  }
}

export const stageLibraryAsset = async (
  files: StageFile[],
  token_id?: string,
): Promise<OrigynResponse<any, StageLibraryAssetErrors | GetCollectionErrors | GetNftErrors>> => {
  try {
    // Get the Raw file if called from a node context (csm.js)
    // tslint:disable-next-line prefer-for-of
    for (let i = 0; i < files.length; i++) {
      if (!files[i].rawFile) {
        files[i].rawFile = await getFileArrayBuffer(files[i]);
        files[i].size = await getFileSize(files[i]);
      }
    }
    const metrics: Metrics = { totalFileSize: 0 };

    return Promise.all(
      files.map(
        async (file) =>
          new Promise(async (resolve, reject) => {
            const libraryId = file.filename.toLowerCase().replace(/\s+/g, '-');
            const libraryAsset: LibraryFile = {
              library_id: libraryId,
              library_file: file,
            };
            const metadata = await buildLibraryMetadata(token_id || '', libraryId, file.title || '', 'canister', file.immutable, file);
            const result: any = await canisterStageLibraryAsset(libraryAsset, token_id ?? '', metrics, metadata);
            if (result?.ok) {
              resolve({ ok: result.ok });
            } else {
              reject({ err: result.err });
            }
          }),
      ),
    )
      .then((result: any) => {
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
    return { err: { error_code: StageLibraryAssetErrors.CANT_REACH_CANISTER, text: e } };
  }
};

export const deleteLibraryAsset = async (
  tokenId: string,
  libraryId: string
  ): Promise<OrigynResponse<any, StageLibraryAssetErrors>> => {
  
  try {
    const { actor } = OrigynClient.getInstance();
    const result: ChunkUploadResult = await actor.stage_library_nft_origyn({
      token_id: tokenId,
      library_id: libraryId,
      filedata: { Bool: false },
      chunk: 0,
      content:[]
    });

    if (result.err) {
      return { err: { error_code: StageLibraryAssetErrors.ERROR_WHILE_DELETING, text: JSON.stringify(result.err) } };  
    }
    return { ok: { ok: result.ok } };
  } catch (err: any) {
    return { err: { error_code: StageLibraryAssetErrors.ERROR_WHILE_DELETING, text: err?.message || err } };
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
  ERROR_WHILE_DELETING,
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
