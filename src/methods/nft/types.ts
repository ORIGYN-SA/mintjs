export type LibraryFile = {
  library_id: string;
  library_file: string;
};

export type Metrics = {
  totalFileSize: number;
};
export type StageConfigFile = {
  type: 'collection' | 'stage' | 'dapp';
  path: string;
};
export type StageConfigArgs = {
  environment?: string;
  collectionId: string;
  collectionDisplayName: string;
  tokenPrefix: string;
  creatorPrincipal: string;
  namespace: string;
  files: StageConfigFile[];
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
  // string with comma delimited list of 'nft_def_number:quantity, ...'
  // example: '0:3,1:3,2:5,3:10'
  // if empty, defaults to 1 NFT per NFT definition
  nftQuantities?: string;
};
export type StageGonfigSummary = {
  totalFiles: number;
  totalFileSize: number;
  totalNftDefinitionCount: number;
  totalNftCount: number;
};
export type StageConfigSettings = {
  args: StageConfigArgs;
  nftDefinitionCount: number;
  nftQuantities: number[];
  totalNftCount: number;
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
export const ExampleStageConfig: StageConfigArgs = {
  environment: 'local',
  collectionId: 'bm',
  collectionDisplayName: 'Brain Matters',
  tokenPrefix: 'bm-',
  creatorPrincipal: 'jvdm5-xkwgc-4t2x7-ojmjd-ail2p-6agif-7m6a6-z6eok-oxueq-inzfb-zae',
  namespace: 'brain.matters',
  assets: [{ primary: 'nft*.png' }, { hidden: 'mystery-bm.gif' }],
  soulbound: false,
  nftOwnerId: 'jvdm5-xkwgc-4t2x7-ojmjd-ail2p-6agif-7m6a6-z6eok-oxueq-inzfb-zae',
  filesPath: ['/home/projects/1.jpg', '/home/projects/2.jpg'],
};
