import { lookup } from 'mrmime';
import { KnownError, OrigynError, OrigynResponse, TransactionType } from '../../types/origynTypes';
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
  toCandyValue,
} from './metadata';
import { GetCollectionErrors, getNftCollectionInfo } from '../collection';
import { getFileHash } from '../../utils';

export const getNft = async (tokenId: string): Promise<OrigynResponse<NftInfoStable, GetNftErrors>> => {
  try {
    const actor = OrigynClient.getInstance().actor;
    const response: any = await actor.nft_origyn(tokenId);
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
    if (response.ok || response.ok === '' || response.error || response.err) {
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
  tokenId: string = '',
): Promise<OrigynResponse<any, StageLibraryAssetErrors | GetCollectionErrors | GetNftErrors>> => {
  try {
    const collectionInfo = await getNftCollectionInfo();
    if (collectionInfo.err) {
      return collectionInfo;
    }

    const nftInfo = await getNft(tokenId);
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
      if (tokenId) {
        settings.fileMap[file.path] = buildNftFile(settings, file, tokenId);
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

            const result: any = await canisterStageLibraryAsset(libraryAsset, tokenId, metrics, resources[0]);
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

const buildLibraryId = (file: StageFile) => {
  const libraryId = (file.libraryId || file.filename || file.title || '').replace(/\s+/g, '-');
  return libraryId.toLowerCase();
};

const buildLibraryMetadata = async (
  tokenId: string,
  libraryId: string,
  file: StageFile,
  locationType: LocationType,
): Promise<MetadataClass> => {
  let location = '';
  let contentType = '';
  let size = 0n;

  if (!libraryId) {
    throw new Error('Missing libraryId');
  }

  if (locationType === 'web') {
    location = file.webUrl?.trim() || '';
    if (!location) {
      throw new Error('Missing webUrl when locationType is web');
    }
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
    if (tokenId) {
      // nft
      location = `-/${tokenId}/-/${libraryId}`;
    } else {
      // collection
      location = `collection/-/${libraryId}`;
    }
    contentType = (file.contentType || lookup(file.filename) || '').toLowerCase();
  }

  if (!contentType) {
    const err = `Could not determine the content type of library "${libraryId}" with location type "${locationType}"`;
    throw new Error(err);
  }

  // get the NFT
  const nftInfo = await getNft(tokenId);
  if (nftInfo.err) {
    const err = `Could not find NFT with token ID "${tokenId}"`;
    throw new Error(err);
  }

  const nftMetadataClass = nftInfo.ok?.metadata as MetadataClass;
  const nftLibraries = getLibraries(nftMetadataClass);

  // ensure the title is not already used by one of the libraries
  if (file.title) {
    const existingLibraryWithTitle = getClassByTextAttribute(nftLibraries, 'title', file.title);
    if (existingLibraryWithTitle) {
      const err = `Library already exists with title "${file.title}"`;
      throw new Error(err);
    }
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

  attribs.push(createTextAttrib('library_id', libraryId, false));
  if (file.title) {
    attribs.push(createTextAttrib('title', file.title, false));
  }
  attribs.push(createTextAttrib('location_type', locationType, false));
  attribs.push(createTextAttrib('location', location, false));
  attribs.push(createTextAttrib('content_type', contentType, false));
  if (locationType === 'canister' && file) {
    attribs.push(createTextAttrib('content_hash', getFileHash(file.rawFile), false));
  }
  attribs.push(createNatAttrib('size', size, false));
  attribs.push(createNatAttrib('sort', maxSort + 1n, false));
  attribs.push(createTextAttrib('read', 'public', false));
  if (file.immutable) {
    attribs.push(createBoolAttrib('com.origyn.immutable_library', true, true));
  }

  const libraryMetadata = { Class: attribs };
  return libraryMetadata;
};

export const setLibraryImmutable = async (
  tokenId: string, 
  libraryId: string,
  metadataOnly = true
  ):Promise<OrigynResponse<undefined, StageLibraryAssetErrors >> => {
  try {
    const { actor } = OrigynClient.getInstance();
    const library = await getNftLibrary(tokenId, libraryId);
    const immutableNode: MetadataProperty =  createBoolAttrib('com.origyn.immutable_library', true, true);

    // set all immutable to true
    for(let item of library.Class){
      item.immutable = true;
    };

    // add the immutable node
    library.Class.push(immutableNode);
    
    if (!metadataOnly) {
      return library;
    } else {
      const result: ChunkUploadResult = await actor.stage_library_nft_origyn({
        token_id: tokenId,
        library_id: libraryId,
        filedata: library,
        chunk: 0,
        content: [],
      });
      if (result.err) {
        return {
          err: { error_code: StageLibraryAssetErrors.ERROR_WHILE_UPDATING_METADATA, text: JSON.stringify(result.err) },
        };
      }
      return { ok: undefined};
    }
  } catch (err: any) {
    return { err: { error_code: StageLibraryAssetErrors.ERROR_WHILE_UPDATING_METADATA, text: err?.message || err } };
  }
};

export const stageCollectionLibraryAsset = async (
  tokenId: string,
  file: StageFile,
): Promise<OrigynResponse<any, StageLibraryAssetErrors | GetCollectionErrors>> => {
  try {
    // the library ID must match the library at the collection level
    const libraryId = file.libraryId || '';
    const metadata = await buildLibraryMetadata(tokenId, libraryId, file, 'collection');

    const libraryAsset: LibraryFile = {
      library_id: libraryId,
      library_file: { filename: '', path: '', size: 0, rawFile: Buffer.from([]) },
    };

    const metrics: Metrics = { totalFileSize: 0 };

    return await canisterStageLibraryAsset(libraryAsset, tokenId, metrics, metadata);
  } catch (err: any) {
    return { err: { error_code: StageLibraryAssetErrors.ERROR_WHILE_STAGING, text: err?.message || err } };
  }
};

export const stageWebLibraryAsset = async (
  tokenId: string,
  file: StageFile,
): Promise<OrigynResponse<any, StageLibraryAssetErrors | GetCollectionErrors>> => {
  try {
    const libraryId = buildLibraryId(file);
    const metadata = await buildLibraryMetadata(tokenId, libraryId, file, 'web');

    const libraryAsset: LibraryFile = {
      library_id: libraryId,
      library_file: { filename: '', path: '', size: 0, rawFile: Buffer.from([]) },
    };

    const metrics: Metrics = { totalFileSize: 0 };

    return await canisterStageLibraryAsset(libraryAsset, tokenId, metrics, metadata);
  } catch (err: any) {
    return { err: { error_code: StageLibraryAssetErrors.ERROR_WHILE_STAGING, text: err?.message || err } };
  }
};

export const stageLibraryAsset = async (
  files: StageFile[],
  tokenId: string = '',
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
            let metadata: MetadataClass | undefined = file.metadata ?? undefined;
            const libraryAsset: LibraryFile = {
              library_id: file.filename,
              library_file: file,
            };

            if (file.isNewLibrary) {
              const libraryId = buildLibraryId(file);
              metadata = await buildLibraryMetadata(tokenId, libraryId, file, 'canister');
              libraryAsset.library_id = libraryId;
            }

            const result: any = await canisterStageLibraryAsset(libraryAsset, tokenId, metrics, metadata);

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

export const updateLibraryMetadata = async (
  tokenId: string,
  libraryId: string,
  data: Record<string, string | number | boolean>,
  metadataOnly = true,
) => {
  try {
    const { actor } = OrigynClient.getInstance();
    const library = await getNftLibrary(tokenId, libraryId);
    for (const [key, value] of Object.entries(data)) {
      const property: MetadataProperty | undefined = library.Class.find(({ name }) => name === key);
      if (property) {
        property.value = toCandyValue(value);
      } else {
        library.Class.push({ name: key, value: toCandyValue(value), immutable: false } as MetadataProperty);
      }
    }
    if (!metadataOnly) {
      return library;
    } else {
      const result: ChunkUploadResult = await actor.stage_library_nft_origyn({
        token_id: tokenId,
        library_id: libraryId,
        filedata: library,
        chunk: 0,
        content: [],
      });
      if (result.err) {
        return {
          err: { error_code: StageLibraryAssetErrors.ERROR_WHILE_UPDATING_METADATA, text: JSON.stringify(result.err) },
        };
      }
      return { ok: { ok: result.ok } };
    }
  } catch (err: any) {
    return { err: { error_code: StageLibraryAssetErrors.ERROR_WHILE_UPDATING_METADATA, text: err?.message || err } };
  }
};
// TODO: Error handling
export const updateLibraryFileContent = async (tokenId: string, libraryId: string, file: StageFile) => {
  try {
    // TODO: Does it work for node context?
    const propertiesToUpdate = {
      size: file.size ?? 0,
      content_type: file.type ?? '',
      content_hash: getFileHash(file.rawFile),
    };

    // Change the metadata of the old file, updating the size and content type + hash
    const metadata = await updateLibraryMetadata(tokenId, libraryId, propertiesToUpdate, false);

    // Get the filename of the old file
    const filename = metadata.Class.find(({ name }) => name === 'library_id').value.Text;

    // Delete the old Library
    const deleteResult = await deleteLibraryAsset(tokenId, libraryId);

    // Stage the new library (metadata = from old one + size, content changed)
    const files = [{ ...file, filename, metadata }];
    const updateFileContent = await stageLibraryAsset(files, tokenId);
    if (updateFileContent.err) {
      return {
        err: {
          error_code: StageLibraryAssetErrors.ERROR_WHILE_UPDATING_FILE,
          text: JSON.stringify(updateFileContent.err),
        },
      };
    }
    return { ok: { ok: updateFileContent.ok } };
  } catch (err: any) {
    return { err: { error_code: StageLibraryAssetErrors.ERROR_WHILE_UPDATING_FILE, text: err?.message || err } };
  }
};

export const deleteLibraryAsset = async (
  tokenId: string,
  libraryId: string,
): Promise<OrigynResponse<any, StageLibraryAssetErrors>> => {
  try {
    const { actor } = OrigynClient.getInstance();
    const result: ChunkUploadResult = await actor.stage_library_nft_origyn({
      token_id: tokenId,
      library_id: libraryId,
      filedata: { Bool: false },
      chunk: 0,
      content: [],
    });

    if (result.err) {
      return { err: { error_code: StageLibraryAssetErrors.ERROR_WHILE_DELETING, text: JSON.stringify(result.err) } };
    }
    return { ok: { ok: result.ok } };
  } catch (err: any) {
    return { err: { error_code: StageLibraryAssetErrors.ERROR_WHILE_DELETING, text: err?.message || err } };
  }
};

export const mintNft = async (tokenId: string, principal?: Principal): Promise<OrigynResponse<any, GetNftErrors>> => {
  try {
    const { actor, principal: _principal } = OrigynClient.getInstance();
    const response = await actor.mint_nft_origyn(tokenId, {
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
  tokenId: string,
  start?: BigInt,
  end?: BigInt,
): Promise<OrigynResponse<TransactionType, GetNftErrors>> => {
  try {
    const actor = OrigynClient.getInstance().actor;
    const args = {
      start: start ? [start] : [],
      end: end ? [end] : [],
    };
    const response = await actor.history_nft_origyn(tokenId, args.start, args.end);
    if (response.ok || response.error) {
      return response;
    } else {
      return { err: { error_code: GetNftErrors.UNKNOWN_ERROR } };
    }
  } catch (e) {
    return { err: { error_code: GetNftErrors.CANT_REACH_CANISTER } };
  }
};

// TODO: Add error handling and response type
export const getNftLibraries = async (tokenId: string) => {
  const nft = await getNft(tokenId);
  if (!nft?.ok) return [];

  const library = nft.ok.metadata?.Class?.find((item) => item.name === 'library')?.value?.Array.thawed;
  if (!library) return [];
  return library;
};

export const getNftLibrary = async (tokenId: string, libraryId: string) => {
  const libraries = await getNftLibraries(tokenId);

  return libraries.find(({ Class }) =>
    Class.find((prop) => prop.name === 'library_id' && prop.value.Text === libraryId),
  );
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
  ERROR_WHILE_UPDATING_FILE,
  ERROR_WHILE_UPDATING_METADATA,
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
