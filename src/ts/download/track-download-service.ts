import {ITrackInfo} from '@src/download/download-info';
import {MetadataAdapter} from '@src/download/metadata/metadata-adapter';
import {ITrackDownloadMethod} from '@src/download/track-download-method';
import {TrackDownloadMethodService} from '@src/download/track-download-method-service';
import {FilenameService} from '@src/util/filename-service';
import * as _ from 'lodash';
import * as path from 'path';
import {Observable, Subject} from 'rxjs';
import {first, map, switchMap, timeout} from 'rxjs/operators';
import DownloadOptions = chrome.downloads.DownloadOptions;

export interface ITrackDownloadService {
  downloadTrack(trackInfo: ITrackInfo, downloadLocation?: string): Observable<number>;
}

export const TrackDownloadService: ITrackDownloadService = {
  downloadTrack(trackInfo: ITrackInfo, downloadLocation: string = ''): Observable<number> {
    const downloadId$: Subject<number> = new Subject<number>();
    const downloadMethod$: Observable<ITrackDownloadMethod> = TrackDownloadMethodService.getDownloadMethod(trackInfo);

    downloadMethod$.pipe(
      first(),
      timeout(10000),
      map(toDownloadOptions.bind(null, trackInfo, downloadLocation)),
      switchMap(MetadataAdapter.addMetadata$.bind(null, trackInfo)),
    ).subscribe(doDownload.bind(null, downloadId$));

    return downloadId$.asObservable();
  }
};

function doDownload(downloadId$: Subject<number>, downloadOptions: DownloadOptions): void {
  chrome.downloads.download(downloadOptions, (id: number) => {
    if (id !== undefined) {
      downloadId$.next(id);
      downloadId$.complete();
    } else {
      downloadId$.error(chrome.runtime.lastError.message);
    }
    URL.revokeObjectURL(downloadOptions.url);
  });
}

function toDownloadOptions(trackInfo: ITrackInfo, downloadLocation: string,
                           downloadMethod: ITrackDownloadMethod): DownloadOptions {
  return {
    filename: getFilename(trackInfo.title, downloadMethod.fileExtension, downloadLocation),
    saveAs: false,
    url: downloadMethod.url
  };
}

function getFilename(trackTitle: string, fileExtension: string, downloadLocation: string): string {
  const filename = `${FilenameService.removeSpecialCharacters(trackTitle)}.${fileExtension}`;
  if (_.isEmpty(downloadLocation)) {
    return filename;
  } else {
    return path.join(downloadLocation, filename);
  }
}
