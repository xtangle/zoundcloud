import {ITrackInfo} from '@src/download/resource-info';
import DownloadOptions = chrome.downloads.DownloadOptions;

export enum TrackDownloadMethod {
  DownloadUrlMethod,
  StreamUrlMethod,
  I1ApiMethod
}

export interface ITrackDownloadInfo {
  trackInfo: ITrackInfo;
  downloadOptions: DownloadOptions;
  downloadMethod: TrackDownloadMethod;
  originalUrl: string;
}
