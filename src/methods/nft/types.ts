import { CandyShared, PropertyShared } from '../../types';

export type LibraryFile = {
  library_id: string;
  library_file: StageFile;
};

export type LocationType = 'collection' | 'canister' | 'web';
export type AssetType = 'primary' | 'hidden' | 'experience' | 'preview';

export type Metrics = {
  totalFileSize: number;
};

export type CollectionLevelFile = StageFile & {
  category: 'collection' | 'stage' | 'dapp';
};

export type StageNft = {
  collectionFileReferences?: string[];
  files: StageFile[];
  quantity?: number;
};

export type StageFile = {
  assetType?: AssetType;
  filename: string;
  index?: number;
  path: string;
  rawFile?: Buffer;
  size?: number;
  type?: string;
  title?: string;
  // overrides filename, used in the location url
  // for location 'canister'
  // name of the collection's library_id
  // for location 'collection'
  libraryId?: string;
  // overrides the content type derived by the file extension
  // for location 'canister'
  contentType?: string;
  // adds com.origyn.immutable_library to the library class
  webUrl?: string;
  immutable?: boolean;
  isNewLibrary?: boolean;
  metadata?: MetadataClass;
};

export type StageConfigArgs = {
  environment?: string;
  collectionId: string;
  collectionDisplayName: string;
  tokenPrefix: string;
  creatorPrincipal: string;
  nftCanisterId: string;
  collectionFiles: CollectionLevelFile[];
  nfts: StageNft[];
  nftOwnerId: string;
  useProxy?: boolean;
  soulbound?: boolean;
  startNftIndex?: number;
};

export type StageConfigData = {
  settings: StageConfigSettings;
  summary: StageConfigSummary;
  collection: Meta;
  nfts: Meta[];
};

export type StageConfigSummary = {
  totalFiles: number;
  totalFileSize: string;
  totalNftDefinitionCount: number;
  totalNftCount: number;
};

export type StageConfigSettings = {
  args: StageConfigArgs;
  fileMap: FileInfoMap;
  collectionLibraries: LibraryFile[];
  totalFileSize: number;
};

export type FileInfo = {
  title: string;
  libraryId: string;
  resourceUrl: string;
  filePath: string;
};

export type FileInfoMap = {
  [filePath: string]: FileInfo;
};

export type TextValue = {
  Text: string;
};

export type NatValue = {
  Nat: bigint;
};

export type BoolValue = {
  Bool: boolean;
};

export type ArrayValue = {
  Array: CandyShared[];
};

export type MetadataClass = {
  Class: PropertyShared[];
};

export type Meta = {
  meta: {
    metadata: MetadataClass;
  };
  library: LibraryFile[];
};

export type ChunkUploadResult = {
  ok?: any;
  err?: any;
};
