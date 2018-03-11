import 'rxjs/add/observable/fromEventPattern';
import 'rxjs/add/observable/of';
import {ITrackInfo} from '@src/service/download-info/download-info';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import DownloadOptions = chrome.downloads.DownloadOptions;

/**
 * Downloads tracks when given a download url
 */
export interface IDownloadService {
  // noinspection JSUnusedLocalSymbols
  downloadTrack(trackUrl: Observable<ITrackInfo>): Observable<number>;
}

export const DownloadService: IDownloadService = {

  downloadTrack(trackInfo$: Observable<ITrackInfo>): Observable<number> {
    const downloadId$: Subject<number> = new Subject<number>();

    trackInfo$.subscribe((trackInfo: ITrackInfo) => {
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
    });

    return downloadId$.asObservable();
  }

};

function getDownloadUrl(trackInfo: ITrackInfo): string {
  return trackInfo.download_url;
}
