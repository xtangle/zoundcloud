import {ITrackInfo} from '@src/download/download-info';

export interface ITrackDownloadMethod {
  trackInfo: ITrackInfo;
  url: string;
  fileExtension: string;
}
