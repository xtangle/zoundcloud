import {ITrackInfo} from '@src/download/download-info';
import {ITrackDownloadMethod} from '@src/download/track-download-method';
import {TrackDownloadMethodService} from '@src/download/track-download-method-service';
import {FilenameService} from '@src/util/filename-service';
import * as path from 'path';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isNullOrUndefined} from 'util';
import DownloadOptions = chrome.downloads.DownloadOptions;

export interface ITrackDownloadService {
  downloadTrack(trackInfo: ITrackInfo, downloadLocation?: string): Observable<number>;
}

export const TrackDownloadService: ITrackDownloadService = {
  downloadTrack(trackInfo: ITrackInfo, downloadLocation?: string): Observable<number> {
    const downloadId$: Subject<number> = new Subject<number>();
    const downloadMethod$: Observable<ITrackDownloadMethod> = TrackDownloadMethodService.getDownloadMethod(trackInfo);

    downloadMethod$
      .first()
      .timeout(10000)
      .map((downloadMethod: ITrackDownloadMethod) => ({
        filename: getFilename(trackInfo.title, downloadMethod.fileExtension, downloadLocation),
        saveAs: false,
        url: downloadMethod.url
      }))
      .subscribe((downloadOptions: DownloadOptions) => {
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

function getFilename(trackTitle: string, fileExtension: string, downloadLocation?: string): string {
  const filename = `${FilenameService.removeSpecialCharacters(trackTitle)}.${fileExtension}`;
  if (isNullOrUndefined(downloadLocation)) {
    return filename;
  } else {
    return path.join(downloadLocation, filename);
  }
}
