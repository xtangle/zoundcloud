export interface IOptions {
  addMetadata: boolean;
  alwaysDownloadMp3: boolean;
  cleanTrackTitle: boolean;
  overwriteExistingFiles: boolean;
}

export const defaultOptions: IOptions = {
  addMetadata: true,
  alwaysDownloadMp3: true,
  cleanTrackTitle: true,
  overwriteExistingFiles: false
};
