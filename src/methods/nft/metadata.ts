import { IS_NODE_CONTEXT } from './../../utils/constants';
import mime from 'mime-types';
import { getFileHash } from '../../utils';
import { IMMUTABLE } from '../../utils/constants';
import {
  StageConfigSettings,
  StageConfigFile,
  Meta,
  MetadataClass,
  LibraryFile,
  MetadataProperty,
  TextValue,
  NatValue,
  StageFile,
} from './types';

export const configureCollectionMetadata = (settings: StageConfigSettings): Meta => {
  const resources: MetadataClass[] = [];
  const files = settings.args.files.filter((file) => file.type === 'collection' || file.type === 'dapp');

  // map asset types to files that match the corresponding pattern
  const mappings = settings.args.assets;

  // Iterate all html and css files and replace local paths with NFT URLs
  const webFiles: StageConfigFile[] = files.filter((f) =>
    ['html', 'htm', 'css'].includes(f.fileObj.filename.split('.').pop() ?? ''),
  );

  // TODO: We need to do that replace relative URLs in web files

  let sort = 1;
  for (const file of files) {
    settings.totalFileSize += file.fileObj.size;

    resources.push(createClassForResource(settings, file.fileObj, sort));

    const library = createLibrary(settings, file.fileObj);
    settings.collectionLibraries.push(library);
    sort++;
  }

  // Creates metadata representing a collection

  const properties: MetadataProperty[] = [];
  const immutable = true;

  // The id for a collection is an empty string
  properties.push(createTextAttrib('id', '', immutable));

  // assetType = 'primary_asset', 'preview_asset', 'experience_asset' or 'hidden_asset'
  for (let assetType in mappings) {
    properties.push(
      createTextAttrib(
        `${settings.args.namespace}.${assetType}`,
        `${settings.args.namespace}.${mappings[assetType]}`,
        immutable,
      ),
    );
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
      Array: { thawed: [...resourceReferences] },
    },
    immutable: true,
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
  let nfts: Meta[] = [];

  for (let i = 0; i < settings.args.nfts.length; i++) {
    const nftQuantity = settings.args.nfts[i].quantity || 1;
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

  const tokenId = `${settings.args.tokenPrefix}${nftIndex}`;
  const files = settings.args.nfts?.[nftIndex].files;

  // Iterate all html and css files and replace local paths with NFT URLs
  const filesWithUrls = files.filter((f) => ['html', 'htm', 'css'].includes(f.filename.split('.').pop() ?? ''));

  let sort = 1;
  for (const file of filesWithUrls) {
    settings.totalFileSize += file.size;

    resources.push(createClassForResource(settings, file, sort));

    const library = createLibrary(settings, file);
    libraries.push(library);

    sort++;
  }

  // handle shared collection level resource references
  // these are not added to the NFT metadata's library
  // so they are only staged/uploaded once to the collection
  for (const collectionFile of settings.args.nfts?.[nftIndex].collectionFiles ?? []) {
    // note: do not add collection resources to totalFileSize
    resources.push(createClassForResource(settings, collectionFile, sort));
    // note: do not add collection resources to NFT library
    sort++;
  }

  // Creates metadata representing a single NFT

  const properties: MetadataProperty[] = [];
  const immutable = true;

  properties.push(createTextAttrib('id', tokenId, immutable));

  // assetType = 'primary_asset', 'preview_asset', 'experience_asset' or 'hidden_asset'
  console.log(
    '🚀 ~ file: metadata.ts ~ line 146 ~ configureNftMetadata ~ Object.keys(settings.args.assets)',
    Object.keys(settings.args.assets),
  );
  for (const asset of settings.args.assets) {
    for (const assetType of Object.keys(asset)) {
      properties.push(
        createTextAttrib(`${assetType}_asset`, `${settings.args.namespace}.${asset[assetType]}`, immutable),
      );
    }
  }

  properties.push(createTextAttrib('owner', settings.args.nftOwnerId || settings.args.nftCanisterId, !immutable));
  properties.push(createBoolAttrib('is_soulbound', settings.args.soulbound === true, !immutable));

  // build classes that point to uploaded resources
  const resourceRefs = createClassesForResourceReferences(settings, resources, libraries);

  properties.push({
    name: 'library',
    value: {
      Array: { thawed: [...resourceRefs] },
    },
    immutable: true,
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
function createClassForResource(settings: StageConfigSettings, file: StageFile, sort: number): MetadataClass {
  // ensure there are no duplicate file names in folder heirarchy
  const fileNameLower = file.filename.toLowerCase();

  // ensure the file has a valid mime type
  let mimeType = file.webFile?.type;
  if (IS_NODE_CONTEXT) {
    const mime = require('mime-types');
    mimeType = mime.lookup(fileNameLower);
  }
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
      createTextAttrib('content_hash', getFileHash(file.path), IMMUTABLE),
      createNatAttrib('size', file.size, IMMUTABLE),
      createNatAttrib('sort', sort, IMMUTABLE),
      createTextAttrib('read', 'public', !IMMUTABLE),
    ],
  };
}

function createLibrary(settings: StageConfigSettings, file: StageFile): LibraryFile {
  return {
    library_id: settings.fileMap[file.path].libraryId,
    library_file: file,
  };
}

function createTextAttrib(name: string, value: string, immutable: boolean): MetadataProperty {
  return {
    name,
    value: { Text: value },
    immutable,
  };
}

function createBoolAttrib(name: string, value: boolean, immutable: boolean): MetadataProperty {
  return {
    name,
    value: { Bool: value },
    immutable,
  };
}

function createNatAttrib(name: string, value: number, immutable: boolean): MetadataProperty {
  return {
    name,
    value: { Nat: value },
    immutable,
  };
}

function createAppsAttribute(settings: StageConfigSettings): MetadataProperty {
  return {
    name: '__apps',
    value: {
      Array: {
        thawed: [
          {
            Class: [
              {
                name: 'app_id',
                value: { Text: settings.args.namespace },
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
                        Array: {
                          thawed: [
                            {
                              Principal: settings.args.creatorPrincipal,
                            },
                          ],
                        },
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
                        Array: {
                          thawed: [
                            {
                              Principal: settings.args.creatorPrincipal,
                            },
                          ],
                        },
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
                      name: `${settings.args.namespace}.name`,
                      value: {
                        Text: settings.args.collectionDisplayName,
                      },
                      immutable: false,
                    },
                    {
                      name: `${settings.args.namespace}.total_in_collection`,
                      value: { Nat: settings.args.nfts.length },
                      immutable: false,
                    },
                    {
                      name: `${settings.args.namespace}.collectionid`,
                      value: {
                        Text: settings.args.collectionId,
                      },
                      immutable: false,
                    },
                    {
                      name: `${settings.args.namespace}.creator_principal`,
                      value: {
                        Principal: settings.args.creatorPrincipal,
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
    },
    immutable: false,
  };
}

function createClassesForResourceReferences(
  settings: StageConfigSettings,
  resourceClasses: MetadataClass[],
  libraries: LibraryFile[],
): MetadataClass[] {
  const resourceReferences: MetadataClass[] = [];

  for (let cls of resourceClasses) {
    console.log('🚀 ~ file: metadata.ts ~ line 361 ~ cls', cls);
    const libraryIdProperty = cls.Class.find((a) => a.name === 'library_id');
    if (!libraryIdProperty) {
      continue;
    }

    const libraryId: string = (libraryIdProperty.value as TextValue).Text;

    let locationType = 'canister';
    let library = libraries.find((l) => l.library_id === libraryId);
    if (!library) {
      //const collectionFiles = settings.args.files.filter((file) => file.type === 'collection');
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
      throw 'Unexpected missing properties of resource class.';
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
        createTextAttrib('read', 'public', !IMMUTABLE),
      ],
    });
  }

  return resourceReferences;
}
function getCollectionReferences(file: StageFile): string[] {
  const refs = JSON.parse(file.path);

  if (!Array.isArray(refs) || refs.length === 0) {
    const err = `Expected "${file.filename}" to contain a JSON array of file paths starting at the root of the "collection" folder.`;
    throw err;
  }

  return refs;
}
