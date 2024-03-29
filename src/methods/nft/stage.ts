// tslint:disable prefer-for-of
import { Principal } from '@dfinity/principal';
import { OrigynClient } from '../../origynClient';
import { OrigynNftActor } from '../../types/methods';
import { wait } from '../../utils';
import { MAX_STAGE_CHUNK_SIZE, MAX_CHUNK_UPLOAD_RETRIES, IS_NODE_CONTEXT } from '../../utils/constants';
import { formatBytes } from '../../utils/binary';
import { log } from '../../utils/log';
import { configureCollectionMetadata, configureNftsMetadata } from './metadata';
import {
  ChunkUploadResult,
  CollectionLevelFile,
  FileInfoMap,
  LibraryFile,
  Meta,
  MetadataClass,
  Metrics,
  StageConfigArgs,
  StageConfigData,
  StageConfigSettings,
  StageConfigSummary,
  StageFile,
  TextValue,
} from './types';
import { CandyShared } from '../../types/origyn-nft';

export const stage = async (config: StageConfigData, skipCollectionStaging: boolean = false) => {
  const { actor, principal: _principal } = OrigynClient.getInstance();

  // *** Stage NFTs and Library Assets
  // nfts and collections have the same metadata structure
  // the difference is that collections have an empty string for the id
  // so the library assets/files can be shared by multiple NFTs
  const metrics: Metrics = { totalFileSize: 0 };
  const items = skipCollectionStaging ? config.nfts : [config.collection, ...config.nfts];
  const response = [];
  for (const item of items) {
    const tokenId = (item?.meta?.metadata?.Class.find((c) => c.name === 'id')?.value as TextValue)?.Text?.trim();

    // Stage NFT
    const metadataToStage = deserializeMetadata(item.meta);
    const stageResult = await actor.stage_nft_origyn(metadataToStage);
    if ('err' in stageResult) {
      return stageResult;
    }
    const itemResponse = {
      nftStage: stageResult,
      libraryStage: [],
    };

    // *** Stage Library Assets (as chunks)
    for (const asset of item.library) {
      await canisterStageLibraryAsset(asset, tokenId, metrics);
      // TODO: Add library staging response
      // itemResponse.libraryStage.push(res);
    }
    response[tokenId] = itemResponse;
  }

  log(`\nTotal Staged File Size: ${metrics.totalFileSize} (${formatBytes(metrics.totalFileSize)})\n`);

  log('\nFinished (stage subcommand)\n');
  log(`------------------\n`);
  return { ok: response };
};

export const canisterStageLibraryAsset = async (
  libraryAsset: LibraryFile,
  tokenId: string,
  metrics: Metrics,
  metadata?: MetadataClass,
): Promise<ChunkUploadResult> => {
  log(`\nStaging asset: ${libraryAsset.library_id}`);
  log(`\nFile path: ${libraryAsset.library_file.path}`);

  // default for 'web' or 'collection' location type
  // which need at least 1 chunk of 0 bytes to stage metadata
  let chunkCount = 1;

  const fileSize = libraryAsset.library_file.size;
  if (fileSize) {
    // slice file buffer into chunks of bytes that fit into the chunk size
    chunkCount = Math.ceil(fileSize / MAX_STAGE_CHUNK_SIZE);
  }

  log(`max chunk size ${MAX_STAGE_CHUNK_SIZE}`);
  log(`file size ${fileSize}`);
  log(`chunk count ${chunkCount}`);

  const { actor } = OrigynClient.getInstance();

  let lastResult: ChunkUploadResult | undefined;
  for (let i = 0; i < chunkCount; i++) {
    // give the canister a 3 second break after every 10 chunks
    // attempt to prevent error: IC0515: Certified state is not available yet. Please try again…
    if (i > 0 && i % 10 === 0) {
      await wait(3000);
    }
    const result = await uploadChunk(
      actor,
      libraryAsset.library_id,
      tokenId,
      libraryAsset.library_file.rawFile!,
      i,
      metrics,
      i === 0 && metadata ? (metadata as CandyShared) : undefined,
    );
    if (result.err) return result;
    lastResult = result;
  }

  if (!lastResult) {
    throw new Error('No result after uploading last chunk');
  }

  return lastResult;
};

export const uploadChunk = async (
  actor: OrigynNftActor,
  libraryId: string,
  tokenId: string,
  fileData: Buffer,
  chunkNumber: number,
  metrics: Metrics,
  metadata?: CandyShared,
  retries = 0,
): Promise<ChunkUploadResult> => {
  const start = chunkNumber * MAX_STAGE_CHUNK_SIZE;
  const end = start + MAX_STAGE_CHUNK_SIZE > fileData.length ? fileData.length : start + MAX_STAGE_CHUNK_SIZE;

  const chunk = fileData.slice(start, end);

  try {
    const result = await actor.stage_library_nft_origyn({
      token_id: tokenId,
      library_id: libraryId,
      filedata: metadata ?? { Option: [] },
      chunk: BigInt(chunkNumber),
      content: Array.from(chunk),
    });

    log(`Result of stage_library_nft_origyn: ${JSON.stringify(result)}`);
    metrics.totalFileSize += chunk.length;
    log(`Cumulative staged file size: ${metrics.totalFileSize} (${formatBytes(metrics.totalFileSize)})`);
    return result as ChunkUploadResult;
  } catch (ex: any) {
    if (retries >= 5) {
      log(`\nMax retries of ${MAX_CHUNK_UPLOAD_RETRIES} has been reached for ${libraryId} chunk #${chunkNumber}.\n`);
      return {
        err: 'MAX_RETRIES_EXCEEDED',
      };
    } else {
      log(ex);
      log('\n*** Caught the above error while staging a library asset chunk. Waiting 3 seconds, then trying again.\n');
      await wait(3000);
      retries++;
      return await uploadChunk(actor, libraryId, tokenId, fileData, chunkNumber, metrics, metadata, retries);
    }
  }
};

export const buildStageConfig = async (args: StageConfigArgs): Promise<StageConfigData> => {
  const settings = initConfigSettings(args) as any;

  // Get the Raw file if called from a node context (csm.js)
  for (let i = 0; i < args.collectionFiles.length; i++) {
    if (!args.collectionFiles[i].rawFile) {
      args.collectionFiles[i].rawFile = await getFileArrayBuffer(args.collectionFiles[i]);
      args.collectionFiles[i].size = await getFileSize(args.collectionFiles[i]);
    }
  }

  for (let i = 0; i < args.nfts.length; i++) {
    for (let j = 0; j < args.nfts[i].files.length; j++) {
      if (!args.nfts[i].files[j].rawFile) {
        args.nfts[i].files[j].rawFile = await getFileArrayBuffer(args.nfts[i].files[j]);
        args.nfts[i].files[j].size = await getFileSize(args.nfts[i].files[j]);
      }
    }
  }

  const collectionMetadata = configureCollectionMetadata(settings);

  const nftsMetadata = configureNftsMetadata(settings);

  let totalNftCount = 0;

  for (const nft of args.nfts) {
    totalNftCount += nft?.quantity ?? 1;
  }

  const summary: StageConfigSummary = {
    totalFiles: Object.keys(settings.fileMap).length,
    totalFileSize: `${settings.totalFileSize} (${formatBytes(settings.totalFileSize)})`,
    totalNftDefinitionCount: settings.nftDefinitionCount,
    totalNftCount,
  };

  const configFileData = buildConfigFileData(settings, summary, collectionMetadata, nftsMetadata);

  return configFileData;
};

export const buildConfigFileData = (
  settings: StageConfigSettings,
  summary: StageConfigSummary,
  collection: Meta,
  nfts: Meta[],
): StageConfigData => {
  return {
    settings,
    summary,
    collection,
    nfts: [
      // Metadata for defining each NFT definition (may be minted multiple times)
      ...nfts,
    ],
  };
};

export const initConfigSettings = (args: StageConfigArgs): StageConfigSettings => {
  const settings: StageConfigSettings = {
    args,
    fileMap: {},
    collectionLibraries: [],
    totalFileSize: 0,
  };
  settings.fileMap = buildFileMap(settings);
  return settings;
};

export const buildFileMap = (settings: StageConfigSettings): FileInfoMap => {
  const fileInfoMap: FileInfoMap = {};

  for (const file of settings.args.collectionFiles) {
    fileInfoMap[file.path] = buildCollectionFile(settings, file);
  }

  let nftIndex = 0;
  for (const nft of settings.args.nfts) {
    for (let j = 0; j < (nft?.quantity ?? 1); j++) {
      const nftRelativeIndex = (settings.args.startNftIndex ?? 0) + nftIndex;
      const tokenId = `${settings.args.tokenPrefix}${nftRelativeIndex}`.toLowerCase();
      for (const file of nft.files) {
        log(`staging nft file ${file.filename}`);
        fileInfoMap[file.path] = buildNftFile(settings, file, tokenId, nftRelativeIndex);
      }

      nftIndex++;
    }
  }

  return fileInfoMap;
};
export const buildCollectionFile = (settings: StageConfigSettings, file: CollectionLevelFile) => {
  let title = file.filename;
  let libraryId = file.filename.toLowerCase();

  if (file.category === 'dapp') {
    const extPos = file.filename.lastIndexOf('.');
    if (extPos > 0) {
      title = title.substring(0, extPos);
      libraryId = libraryId.substring(0, extPos);
    }
    title = `${title} dApp`;
  }

  const resourceUrl = `${getResourceUrl(settings, libraryId)}`.toLowerCase();

  return {
    title,
    libraryId,
    resourceUrl,
    filePath: file.path,
  };
};
export const buildNftFile = (settings: StageConfigSettings, file: StageFile, tokenId: string, nftIndex: number = 0) => {
  const libraryId = file.filename.toLowerCase();
  const resourceUrl = `${getResourceUrl(settings, libraryId, tokenId)}`;
  const title = `${settings.args.collectionDisplayName} - ${nftIndex}`;

  return {
    title,
    libraryId,
    resourceUrl,
    filePath: file.path,
  };
};
export const getResourceUrl = (settings: StageConfigSettings, resourceName: string, tokenId: string = ''): string => {
  let rootUrl = '';
  const { isMainNet, canisterId } = OrigynClient.getInstance();
  if (!isMainNet) {
    if (settings.args.useProxy) {
      // url points to icx-proxy (port 3000) to buffer videos
      rootUrl = `http://localhost:3000/-/${canisterId}`;
    } else {
      // url points to local canister (port 8080) but does not buffer videos
      rootUrl = `http://${canisterId}.localhost:8080`;
    }
  } else {
    rootUrl = `https://prptl.io/-/${canisterId}`;
  }

  if (tokenId) {
    // https://rrkah-fqaaa-aaaaa-aaaaq-cai.raw.ic0.app/-/bayc-01/-/com.bayc.ape.0.primary
    return `${rootUrl}/-/${tokenId}/-/${resourceName}`.toLowerCase();
  } else {
    // https://frfol-iqaaa-aaaaj-acogq-cai.raw.ic0.app/collection/-/ledger
    return `${rootUrl}/collection/-/${resourceName}`.toLowerCase();
  }
};

export const getFileArrayBuffer = async (file: StageFile): Promise<Buffer> => {
  if (!IS_NODE_CONTEXT) {
    throw Error('getFileArrayBuffer() cannot be used in a node context');
  }
  const fs = require('fs');
  return fs.readFileSync(file.path);
};

export const getFileSize = async (file: StageFile): Promise<number> => {
  if (!IS_NODE_CONTEXT) {
    throw Error('getFileArrayBuffer() cannot be used in a node context');
  }
  const fs = require('fs');
  const { size } = fs.statSync(file.path);
  return size;
};

/**
 * Prepares metadata for staging by converting values to their correct types
 */
function deserializeMetadata(data) {
  if (typeof data !== 'object') {
    return data;
  }
  Object.keys(data).forEach((p) => {
    if (data[p] === null) {
      data[p] = { Option: [] }; // value was 'Empty' before 0.1.4
    }
    switch (typeof data[p]) {
      case 'object':
        if (p === 'Principal') {
          // rehydrate Principal (from JSON/file) so it gets the prototype methods back
          const principalId = Principal.fromUint8Array(Object.values(data[p]._arr) as unknown as Uint8Array).toText();
          data[p] = Principal.fromText(principalId);
        } else {
          // recurse
          data[p] = deserializeMetadata(data[p]);
        }
        break;
      case 'string':
        if (p === 'Principal') {
          data[p] = Principal.fromText(data[p]);
        } else if (['Nat8', 'Nat16', 'Nat32', 'Int8', 'Int16', 'Int32', 'Float'].includes(p)) {
          data[p] = Number(data[p]);
        } else if (['Nat', 'Nat64', 'Int', 'Int64'].includes(p)) {
          data[p] = BigInt(data[p]);
          break;
        }
    }
  });
  return data;
}
