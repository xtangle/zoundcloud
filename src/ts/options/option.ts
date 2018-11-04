export interface IOptions {
  addMetadata: boolean;
  alwaysDownloadMp3: boolean;
  cleanTrackTitle: ICleanTrackTitleOption;
  overwriteExistingFiles: boolean;
}

export interface ICleanTrackTitleOption {
  enabled: boolean;
  pattern: string;
}
