import {IPlaylistInfo} from '@src/model/playlist-info';
import {ITrackInfo} from '@src/model/track-info';
/**
 * Fetches the download information when given a tab url
 */
import {Observable} from 'rxjs/Observable';

export interface IDownloadInfoService {
  // noinspection JSUnusedLocalSymbols
  getTrackInfo(url: string): Observable<ITrackInfo>;
  getPlaylistInfo(url: string): Observable<IPlaylistInfo>;
}

export const DownloadInfoService: IDownloadInfoService = {

  getTrackInfo(url: string): Observable<ITrackInfo> =

};
