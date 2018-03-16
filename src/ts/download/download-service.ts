import {CLIENT_ID, I1_CLIENT_ID, SC_I1_API_URL} from '@src/constants';
import {ITrackInfo} from '@src/download/download-info';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import DownloadOptions = chrome.downloads.DownloadOptions;

export interface IDownloadService {
  // noinspection JSUnusedLocalSymbols
  downloadTrack(trackInfo: ITrackInfo): Observable<number>;
}

export const DownloadService: IDownloadService = {

  downloadTrack(trackInfo: ITrackInfo): Observable<number> {
    const downloadId$: Subject<number> = new Subject<number>();

    const url = getDownloadUrl(trackInfo);
    const downloadOptions: DownloadOptions = {saveAs: false, url};
    chrome.downloads.download(downloadOptions, (id: number) => {
      if (id !== undefined) {
        downloadId$.next(id);
        downloadId$.complete();
      } else {
        downloadId$.error(chrome.runtime.lastError.message);
      }
    });

    return downloadId$.asObservable();
  }

};

function getDownloadUrl(trackInfo: ITrackInfo): string {
  let url;
  if (trackInfo.downloadable) {
    url = `${trackInfo.download_url}?client_id=${CLIENT_ID}`;
  } else if (trackInfo.stream_url) {
    url = `${trackInfo.stream_url}?client_id=${CLIENT_ID}`;
  } else {
    url = `${SC_I1_API_URL}/tracks/${trackInfo.id}/streams?client_id=${I1_CLIENT_ID}`;
  }
  return url;
}
