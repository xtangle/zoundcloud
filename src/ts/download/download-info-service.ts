import {CLIENT_ID, SC_API_URL} from '@src/constants';
import {IPlaylistInfo, ITrackInfo} from '@src/download/download-info';
import * as $ from 'jquery';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/first';
import {Observable} from 'rxjs/Observable';

/**
 * Fetches the download information when given a tab url
 */
export interface IDownloadInfoService {
  // noinspection JSUnusedLocalSymbols
  getTrackInfo(url: string): Observable<ITrackInfo>;

  // noinspection JSUnusedLocalSymbols
  getPlaylistInfo(url: string): Observable<IPlaylistInfo>;
}

export const DownloadInfoService: IDownloadInfoService = {
  getTrackInfo(url: string): Observable<ITrackInfo> {
    return getDownloadInfo<ITrackInfo>(url);
  },
  getPlaylistInfo(url: string): Observable<IPlaylistInfo> {
    return getDownloadInfo<IPlaylistInfo>(url);
  }
};

function getDownloadInfo<T>(url: string): Observable<T> {
  const jsonEndpoint = `${SC_API_URL}/resolve.json?url=${url}&client_id=${CLIENT_ID}`;
  return Observable.fromPromise<T>($.getJSON(jsonEndpoint));
}
