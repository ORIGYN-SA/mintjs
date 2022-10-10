export type LibraryFile = {
  library_id: string;
  library_file: StageFile;
};

export type Metrics = {
  totalFileSize: number;
};
export type StageConfigFile = {
  type: 'collection' | 'stage' | 'dapp';
  fileObj: StageFile;
};
export type StageNft = {
  quantity?: number;
  files: StageFile[];
  collectionFiles?: StageFile[];
};
export type StageFile = {
  filename: string;
  index?: number;
  path: string;
  size: number;
  type?: string;
  webFile?: File;
};

export type StageConfigArgs = {
  environment?: string;
  collectionId: string;
  collectionDisplayName: string;
  tokenPrefix: string;
  creatorPrincipal: string;
  namespace: string;
  nftCanisterId: string;
  files: StageConfigFile[];
  nfts: StageNft[];
  // string with comma delimited list of 'asset_type:file_name, ...'
  // supports the * wildcard character
  // example:  primary: 'index#.html', experience: 'index#.html', preview: 'preview#.png'
  assets: Asset[];

  //optional args, but will map to empty strings

  // if empty, defaults to NFT canister id
  nftOwnerId: string;
  // indicates if the resource urls should point at the local icx-proxy (port 3000)
  // if empty, defaults to 'false'
  useProxy?: boolean;
  // if empty, defaults to 'false'
  soulbound?: boolean;
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
export type Asset = {
  primary?: string;
  preview?: string;
  experience?: string;
  hidden?: string;
};

export type TextValue = {
  Text: string;
};

export type NatValue = {
  Nat: number;
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
