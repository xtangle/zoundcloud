import DownloadOptions = chrome.downloads.DownloadOptions;
import {ITrackInfo} from 'src/ts/download/resource/resource-info';
import {TrackDownloadMethod} from 'src/ts/download/track-download-method';

export interface ITrackDownloadInfo {
  trackInfo: ITrackInfo;
  downloadOptions: DownloadOptions;
  downloadMethod: TrackDownloadMethod;
  originalUrl: string;
}
