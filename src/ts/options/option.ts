export interface IOptions {
  addMetadata: IAddMetadataOption;
  alwaysDownloadMp3: boolean;
  cleanTrackTitle: ICleanTrackTitleOption;
  overwriteExistingFiles: boolean;
}

export interface IAddMetadataOption {
  enabled: boolean;
  addCoverArt: boolean;
}

export interface ICleanTrackTitleOption {
  enabled: boolean;
  pattern: string;
}
