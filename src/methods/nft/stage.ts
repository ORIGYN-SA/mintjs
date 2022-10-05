import path from 'path';
import { AnyActor } from '../../types/origynTypes';
import { wait } from '../../utils';
import { MAX_STAGE_CHUNK_SIZE, MAX_CHUNK_UPLOAD_RETRIES } from '../../utils/constants';
import { formatBytes } from '../../utils/formatBytes';
import { FileInfoMap, LibraryFile, Metrics, StageConfigArgs, StageConfigSettings } from './types';

export const stageLibraryAsset = async (
  actor: AnyActor,
  stageFolder: string,
  libraryAsset: LibraryFile,
  tokenId: string,
  metrics: Metrics,
) => {
  console.log(`\nStaging asset: ${libraryAsset.library_id}`);
  console.log(`\nFile path: ${libraryAsset.library_file}`);

  // const fileData = fs.readFileSync(path.join(stageFolder, libraryAsset.library_file));

  // slice file buffer into chunks of bytes that fit into the chunk size
  const fileSize = fileData.length;
  const chunkCount = Math.ceil(fileSize / MAX_STAGE_CHUNK_SIZE);
  console.log(`max chunk size ${MAX_STAGE_CHUNK_SIZE}`);
  console.log(`file size ${fileSize}`);
  console.log(`chunk count ${chunkCount}`);

  for (let i = 0; i < chunkCount; i++) {
    // give the canister a 3 second break after every 10 chunks
    // attempt to prevent error: IC0515: Certified state is not available yet. Please try again…
    if (i > 0 && i % 10 === 0) {
      await wait(3000);
    }

    await uploadChunk(actor, libraryAsset.library_id, tokenId, fileData, i, metrics);
  }
};

export const uploadChunk = async (
  actor: AnyActor,
  libraryId: string,
  tokenId: string,
  fileData: Buffer,
  chunkNumber: number,
  metrics: Metrics,
  retries = 0,
) => {
  const start = chunkNumber * MAX_STAGE_CHUNK_SIZE;
  const end = start + MAX_STAGE_CHUNK_SIZE > fileData.length ? fileData.length : start + MAX_STAGE_CHUNK_SIZE;

  const chunk = fileData.slice(start, end);

  try {
    let result = await actor.stage_library_nft_origyn({
      token_id: tokenId,
      library_id: libraryId,
      filedata: { Empty: null },
      chunk: chunkNumber,
      content: Array.from(chunk),
    });
    console.log(`Result of stage_library_nft_origyn: ${result}`);
    metrics.totalFileSize += chunk.length;
    console.log(`Cumulative staged file size: ${metrics.totalFileSize} (${formatBytes(metrics.totalFileSize)})`);
  } catch (ex) {
    if (retries >= 5) {
      console.log(
        `\nMax retries of ${MAX_CHUNK_UPLOAD_RETRIES} has been reached for ${libraryId} chunk #${chunkNumber}.\n`,
      );
    } else {
      console.log(JSON.stringify(ex));
      console.log(
        '\n*** Caught the above error while staging a library asset chunk. Waiting 3 seconds, then trying again.\n',
      );
      await wait(3000);
      retries++;
      await uploadChunk(actor, libraryId, tokenId, fileData, chunkNumber, metrics, retries);
    }
  }
};

export const buildStageConfig = () => {};

export const initConfigSettings = (args: StageConfigArgs): StageConfigSettings => {};

export const buildFileMap = (settings: StageConfigSettings): FileInfoMap => {
  const fileInfoMap: FileInfoMap = {};

  for (const file of settings.args.files) {
    let title = file.path.split('/').pop() ?? 'UNTITLED_FILE';
    let libraryId = `${settings.args.namespace}.${title}`.toLowerCase();

    if (file.type === 'dapp') {
      const extPos = libraryId.lastIndexOf('.');
      if (extPos > 0) {
        libraryId = libraryId.substring(0, extPos);
      }
      title = `${libraryId} dApp`;
    }

    const resourceUrl = `${getResourceUrl(settings, libraryId)}`.toLowerCase();

    fileInfoMap[file.path] = {
      title,
      libraryId,
      resourceUrl,
      filePath: file.path,
    };
  }

  let nftIndex = 0;
  for (let i = 0; i < settings.nftDefinitionCount; i++) {
    // defaults to 1 NFT per NFT definition
    const nftQuantity = settings.nftQuantities?.[i] || 1;

    for (let j = 0; j < nftQuantity; j++) {
      const tokenId = `${settings.args.tokenPrefix}${nftIndex}`.toLowerCase();

      for (const file of settings.args.files) {
        const fileName = file.path.split('/').pop() ?? 'UNTITLED_FILE';

        const libraryId = `${settings.args.namespace}.${fileName}`.toLowerCase();

        const resourceUrl = `${getResourceUrl(settings, libraryId, tokenId)}`;

        // find the asset type of this file (primary, preview, experience, hidden)
        let nftAssetType = '';
        for (const asset of settings.args.assets) {
          for (const assetKey of Object.keys(asset)) {
            if (asset[assetKey].toLowerCase() === fileName.toLowerCase()) {
              nftAssetType = assetKey === 'primary' ? '' : ` ${assetKey}`;
            }
          }
        }

        const title = `${settings.args.collectionDisplayName} - ${nftIndex}${nftAssetType}`;

        fileInfoMap[file.path] = {
          title,
          libraryId,
          resourceUrl,
          filePath: file.path,
        };
      }

      nftIndex++;
    }
  }

  return fileInfoMap;
};

export const getResourceUrl = (settings: StageConfigSettings, resourceName: string, tokenId: string = ''): string => {
  let rootUrl = '';
  switch ((settings.args.environment || '').toLowerCase()) {
    case 'l':
    case 'local':
    case 'localhost':
      if (settings.args.useProxy) {
        // url points to icx-proxy (port 3000) to buffer videos
        rootUrl = `http://localhost:3000/-/${settings.args.nftCanisterId}`;
      } else {
        // url points to local canister (port 8000) but does not buffer videos
        rootUrl = `http://${settings.args.nftCanisterId}.localhost:8000`;
      }
      break;
    case 'p':
    case 'prod':
    case 'production':
      rootUrl = `https://exos.origyn.network/-/${settings.args.collectionId}`;
      break;
    default: // dev, stage, etc.
      rootUrl = `https://exos.origyn.network/-/${settings.args.nftCanisterId}`;
      break;
  }

  if (tokenId) {
    // https://rrkah-fqaaa-aaaaa-aaaaq-cai.raw.ic0.app/-/bayc-01/-/com.bayc.ape.0.primary
    return `${rootUrl}/-/${tokenId}/-/${resourceName}`.toLowerCase();
  } else {
    // https://frfol-iqaaa-aaaaj-acogq-cai.raw.ic0.app/collection/-/ledger
    return `${rootUrl}/collection/-/${resourceName}`.toLowerCase();
  }
};
