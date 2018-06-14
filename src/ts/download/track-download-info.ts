import {ITrackInfo} from '@src/download/resource/resource-info';
import {TrackDownloadMethod} from '@src/download/track-download-method';
import DownloadOptions = chrome.downloads.DownloadOptions;

export interface ITrackDownloadInfo {
  trackInfo: ITrackInfo;
  downloadOptions: DownloadOptions;
  downloadMethod: TrackDownloadMethod;
  originalUrl: string;
}
