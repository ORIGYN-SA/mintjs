import { Principal } from '@dfinity/principal';
import { lookup } from 'mrmime';
import { CandyShared, PropertyShared } from '../../types';
import {
  ArrayValue,
  CollectionLevelFile,
  LibraryFile,
  Meta,
  MetadataClass,
  NatValue,
  StageConfigSettings,
  StageFile,
  TextValue,
} from './types';
import { getFileHash } from '../../utils';
import { IMMUTABLE } from '../../utils/constants';

export const configureCollectionMetadata = (settings: StageConfigSettings): Meta => {
  const resources: MetadataClass[] = [];
  const files = settings.args.collectionFiles.filter(
    (file) => file.category === 'collection' || file.category === 'dapp',
  );

  // Iterate all html and css files and replace local paths with NFT URLs
  const webFiles: CollectionLevelFile[] = files.filter((f) =>
    ['html', 'htm', 'css'].includes(f.filename.split('.').pop() ?? ''),
  );

  // TODO: We need to do that replace relative URLs in web files

  let sort = 1;
  for (const file of files) {
    settings.totalFileSize += file.size ?? 0;

    resources.push(createClassForResource(settings, file, sort));

    const library = createLibrary(settings, file);
    settings.collectionLibraries.push(library);
    sort++;
  }

  // Creates metadata representing a collection

  const properties: PropertyShared[] = [];
  const immutable = true;

  // The id for a collection is an empty string
  properties.push(createTextAttrib('id', '', immutable));

  const filesWithAssetType = files.filter((f) => f.assetType);

  const alreadyPushedAssetTypes: string[] = [];
  for (const file of filesWithAssetType) {
    if (alreadyPushedAssetTypes.indexOf(file.assetType!) === -1) {
      properties.push(createTextAttrib(`${file.assetType}_asset`, `${file.filename}`, immutable));
      alreadyPushedAssetTypes.push(file.assetType!);
    }
  }

  properties.push(createTextAttrib('owner', settings.args.nftOwnerId || settings.args.nftCanisterId, !immutable));
  // attribs.push(
  //     createBoolAttrib('is_soulbound', settings.args.soulbound, !immutable)
  // );

  // build classes that point to uploaded resources
  const resourceReferences = createClassesForResourceReferences(settings, resources, settings.collectionLibraries);

  properties.push({
    name: 'library',
    value: {
      Array: [...resourceReferences],
    },
    immutable: false, // TODO: replace with arg
  });

  const appsAttribute = createAppsAttribute(settings);

  properties.push(appsAttribute);

  return {
    meta: {
      metadata: {
        Class: [...properties],
      },
    },
    library: settings.collectionLibraries,
  };
};
export const configureNftsMetadata = (settings: StageConfigSettings): Meta[] => {
  let nftIndex = 0;
  const nfts: Meta[] = [];

  for (const nft of settings.args.nfts) {
    const nftQuantity = nft.quantity || 1;
    for (let j = 0; j < nftQuantity; j++) {
      const nftMetadata = configureNftMetadata(settings, nftIndex);
      nfts.push(nftMetadata);
      nftIndex++;
    }
  }

  return nfts;
};

export const configureNftMetadata = (settings: StageConfigSettings, nftIndex: number): Meta => {
  const resources: MetadataClass[] = [];
  const libraries: LibraryFile[] = [];

  const tokenId = `${settings.args.tokenPrefix}${(settings.args.startNftIndex ?? 0) + nftIndex}`;
  const files = settings.args.nfts?.[nftIndex].files;

  // TODO: Iterate all html and css files and replace local paths with NFT URLs
  const filesWithUrls = files.filter((f) => ['html', 'htm', 'css'].includes(f.filename.split('.').pop() ?? ''));

  let sort = 1;
  for (const file of files) {
    settings.totalFileSize += file.size ?? 0;

    resources.push(createClassForResource(settings, file, sort));

    const library = createLibrary(settings, file);
    libraries.push(library);

    sort++;
  }

  // handle shared collection level resource references
  // these are not added to the NFT metadata's library
  // so they are only staged/uploaded once to the collection
  for (const collectionFileReference of settings.args.nfts?.[nftIndex].collectionFileReferences ?? []) {
    const collectionFile = settings.args.collectionFiles.find((f) => f.filename === collectionFileReference);
    // note: do not add collection resources to totalFileSize
    if (collectionFile) resources.push(createClassForResource(settings, collectionFile, sort));
    // note: do not add collection resources to NFT library
    sort++;
  }

  // Creates metadata representing a single NFT

  const properties: PropertyShared[] = [];
  const immutable = true;

  properties.push(createTextAttrib('id', tokenId, immutable));

  const filesWithAssetType = files.filter((f) => f.assetType);
  const alreadyPushedAssetTypes: string[] = [];
  for (const file of filesWithAssetType) {
    if (alreadyPushedAssetTypes.indexOf(file.assetType!) === -1) {
      properties.push(createTextAttrib(`${file.assetType}_asset`, `${file.filename}`, immutable));
      alreadyPushedAssetTypes.push(file.assetType!);
    }
  }

  properties.push(createTextAttrib('owner', settings.args.nftOwnerId || settings.args.nftCanisterId, !immutable));
  properties.push(createBoolAttrib('is_soulbound', settings.args.soulbound === true, !immutable));

  // build classes that point to uploaded resources
  const resourceRefs = createClassesForResourceReferences(settings, resources, libraries);

  properties.push({
    name: 'library',
    value: {
      Array: [...resourceRefs],
    },
    immutable: false,
  });

  const appsAttribute = createAppsAttribute(settings);

  properties.push(appsAttribute);

  return {
    meta: {
      metadata: {
        Class: [...properties],
      },
    },
    library: libraries,
  };
};
export const createClassForResource = (settings: StageConfigSettings, file: StageFile, sort: number): MetadataClass => {
  // ensure there are no duplicate file names in folder heirarchy
  const fileNameLower = file.filename.toLowerCase();

  // ensure the file has a valid mime type
  const mimeType = lookup(fileNameLower);
  if (!mimeType) {
    const err = `Could not find mime type for file: ${file.filename}`;
    throw err;
  }

  return {
    Class: [
      createTextAttrib('library_id', settings.fileMap[file.path].libraryId, IMMUTABLE),
      createTextAttrib('title', `${settings.args.collectionDisplayName} ${fileNameLower}`, IMMUTABLE),
      createTextAttrib('location_type', 'canister', IMMUTABLE),
      createTextAttrib('location', settings.fileMap[file.path].resourceUrl, IMMUTABLE),
      createTextAttrib('content_type', mimeType, IMMUTABLE),
      createTextAttrib('content_hash', getFileHash(file.rawFile), IMMUTABLE),
      createNatAttrib('size', BigInt(file.size ?? 0n), IMMUTABLE),
      createNatAttrib('sort', BigInt(sort), IMMUTABLE),
      createTextAttrib('read', 'public', !IMMUTABLE),
    ],
  };
};

export const createLibrary = (settings: StageConfigSettings, file: StageFile): LibraryFile => {
  return {
    library_id: settings.fileMap[file.path].libraryId,
    library_file: file,
  };
};

export const createTextAttrib = (name: string, value: string, immutable: boolean): PropertyShared => {
  return {
    name,
    value: { Text: value },
    immutable,
  };
};

export const createBoolAttrib = (name: string, value: boolean, immutable: boolean): PropertyShared => {
  return {
    name,
    value: { Bool: value },
    immutable,
  };
};

export const createNatAttrib = (name: string, value: bigint, immutable: boolean): PropertyShared => {
  return {
    name,
    value: { Nat: value },
    immutable,
  };
};

export const createAppsAttribute = (settings: StageConfigSettings): PropertyShared => {
  return {
    name: '__apps',
    value: {
      Array: [
        {
          Class: [
            {
              name: 'app_id',
              value: { Text: 'com.origyn.mintjs' },
              immutable: false,
            },
            {
              name: 'read',
              value: { Text: 'public' },
              immutable: false,
            },
            {
              name: 'write',
              value: {
                Class: [
                  {
                    name: 'type',
                    value: { Text: 'allow' },
                    immutable: false,
                  },
                  {
                    name: 'list',
                    value: {
                      Array: [
                        {
                          Principal: Principal.fromText(settings.args.collectionOwnerId),
                        },
                      ],
                    },
                    immutable: false,
                  },
                ],
              },
              immutable: false,
            },
            {
              name: 'permissions',
              value: {
                Class: [
                  {
                    name: 'type',
                    value: { Text: 'allow' },
                    immutable: false,
                  },
                  {
                    name: 'list',
                    value: {
                      Array: [
                        {
                          Principal: Principal.fromText(settings.args.collectionOwnerId),
                        },
                      ],
                    },
                    immutable: false,
                  },
                ],
              },
              immutable: false,
            },
            {
              name: 'data',
              value: {
                Class: [
                  {
                    name: `name`,
                    value: {
                      Text: settings.args.collectionDisplayName,
                    },
                    immutable: false,
                  },
                  {
                    name: `total_in_collection`,
                    value: {
                      Nat: BigInt(
                        settings.args.nfts.reduce((acumulator, nft) => {
                          return acumulator + (nft?.quantity ?? 1);
                        }, 0),
                      ),
                    },
                    immutable: false,
                  },
                  {
                    name: `collectionid`,
                    value: {
                      Text: settings.args.collectionId,
                    },
                    immutable: false,
                  },
                  {
                    name: `creator_principal`,
                    value: {
                      Principal: Principal.fromText(settings.args.collectionOwnerId),
                    },
                    immutable: false,
                  },
                ],
              },
              immutable: false,
            },
          ],
        },
      ],
    },
    immutable: false,
  };
};

export const createClassesForResourceReferences = (
  settings: StageConfigSettings,
  resourceClasses: MetadataClass[],
  libraries: LibraryFile[],
): MetadataClass[] => {
  const resourceReferences: MetadataClass[] = [];

  for (const cls of resourceClasses) {
    const libraryIdProperty = cls.Class.find((a) => a.name === 'library_id');
    if (!libraryIdProperty) {
      continue;
    }

    const libraryId: string = (libraryIdProperty.value as TextValue).Text;

    let locationType = 'canister';
    let library = libraries.find((l) => l.library_id === libraryId);
    if (!library) {
      // const collectionFiles = settings.args.files.filter((file) => file.type === 'collection');
      library = settings.collectionLibraries.find((l) => l.library_id === libraryId);

      if (library) {
        locationType = 'collection';
      } else {
        const err = `Could not find libraryId ${libraryId} in NFT or collection libraries.`;
        throw err;
      }
    }

    const title = settings.fileMap[library.library_file.path]?.title;
    const location = cls.Class.find((a) => a.name === 'location')?.value;
    const size = cls.Class.find((a) => a.name === 'size')?.value;
    const sort = cls.Class.find((a) => a.name === 'sort')?.value;
    const contentType = cls.Class.find((a) => a.name === 'content_type')?.value;
    const contentHash = cls.Class.find((a) => a.name === 'content_hash')?.value;

    if (!title || !location || !size || !sort || !contentType || !contentHash) {
      throw Error('Unexpected missing properties of resource class.');
    }

    resourceReferences.push({
      Class: [
        createTextAttrib('library_id', libraryId, IMMUTABLE),
        createTextAttrib('title', title, IMMUTABLE),
        createTextAttrib('location_type', locationType, IMMUTABLE),
        createTextAttrib('location', (location as TextValue).Text, IMMUTABLE),
        createTextAttrib('content_type', (contentType as TextValue).Text, IMMUTABLE),
        createTextAttrib('content_hash', (contentHash as TextValue).Text, IMMUTABLE),
        createNatAttrib('size', (size as NatValue).Nat, IMMUTABLE),
        createNatAttrib('sort', (sort as NatValue).Nat, IMMUTABLE),
        createTextAttrib('read', 'public', IMMUTABLE),
      ],
    });
  }

  return resourceReferences;
};

export function getLibraries(nftOrColl: MetadataClass): MetadataClass[] {
  const libraries = (nftOrColl.Class.find((c) => c.name === 'library')?.value as ArrayValue)?.Array as MetadataClass[];

  return libraries;
}

export function getClassByTextAttribute(
  classes: MetadataClass[],
  name: string,
  value: string,
): MetadataClass | undefined {
  const libraryMetadata = classes?.find((c) =>
    c?.Class?.find((p) => p?.name === name && (p?.value as TextValue)?.Text?.toLowerCase() === value.toLowerCase()),
  );

  return libraryMetadata;
}

export function getAttribute(nftOrColl: MetadataClass, name: string): PropertyShared | undefined {
  return nftOrColl?.Class?.find((a) => a?.name === name);
}

export function toCandyValue(payload: string | number | boolean): CandyShared {
  switch (typeof payload) {
    case 'number':
      return { Nat: BigInt(payload) };
    case 'boolean':
      return { Bool: payload.toString() === 'true' };
    default:
      return { Text: payload };
  }
}
