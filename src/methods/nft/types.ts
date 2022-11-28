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
};
export type StageConfigArgs = {
  environment?: string;
  collectionId: string;
  collectionDisplayName: string;
  tokenPrefix: string;
  creatorPrincipal: string;
  namespace: string;
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

export type PrincipalValue = {
  Principal: string;
};

export type ThawedArrayValue = {
  Array: { thawed: MetadataClass[] | PrincipalValue[] };
};

export type MetadataProperty = {
  name: string;
  value: TextValue | NatValue | BoolValue | PrincipalValue | ThawedArrayValue | MetadataClass;
  immutable: boolean;
};

export type MetadataClass = {
  Class: MetadataProperty[];
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