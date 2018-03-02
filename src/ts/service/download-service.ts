import 'rxjs/add/observable/fromEventPattern';
import 'rxjs/add/observable/of';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import DownloadOptions = chrome.downloads.DownloadOptions;

/**
 * Downloads tracks
 */
export interface IDownloadService {
  // noinspection JSUnusedLocalSymbols
  downloadTrack(trackUrl: string): Observable<number>;
}

export const DownloadService: IDownloadService = {

  downloadTrack(trackUrl: string): Observable<number> {
    const downloadId$: Subject<number> = new Subject<number>();
    const downloadOptions: DownloadOptions = {saveAs: false, url: trackUrl};

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
