export enum TrackDownloadMethod {
  DownloadUrlMethod,
  StreamUrlMethod,
  I1ApiMethod
}

export interface ITrackDownloadMethodInfo {
  downloadMethod: TrackDownloadMethod;
  format: string;
  url: string;
}
