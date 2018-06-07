import {ITrackInfo} from '@src/download/download-info';
import {MetadataAdapter} from '@src/download/metadata/metadata-adapter';
import {ITrackDownloadMethod} from '@src/download/track-download-method';
import {TrackDownloadMethodService} from '@src/download/track-download-method-service';
import {FilenameService} from '@src/util/filename-service';
import {logger} from '@src/util/logger';
import * as path from 'path';
import {AsyncSubject, Observable, Subject} from 'rxjs';
import {switchMap, timeout} from 'rxjs/operators';
import DownloadOptions = chrome.downloads.DownloadOptions;

export const TrackDownloadService = {
  download$(trackInfo: ITrackInfo, downloadLocation: string = ''): Observable<number> {
    const downloadId$: Subject<number> = new AsyncSubject();
    TrackDownloadMethodService.toDownloadMethod$(trackInfo).pipe(
      switchMap((downloadMethod: ITrackDownloadMethod) =>
        MetadataAdapter.addMetadata$(downloadMethod, toDownloadOptions(downloadLocation, downloadMethod))
      ),
      timeout(300000)
    ).subscribe(
      downloadTrack.bind(null, downloadId$),
      onError.bind(null, downloadId$, trackInfo)
    );
    return downloadId$;
  }
};

function downloadTrack(downloadId$: Subject<number>, downloadOptions: DownloadOptions) {
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

function onError(downloadId$: Subject<number>, trackInfo: ITrackInfo, err: any) {
  logger.error(`Cannot download track ${trackInfo.title}`, err);
  downloadId$.error(err);
}

function toDownloadOptions(downloadLocation: string, downloadMethod: ITrackDownloadMethod): DownloadOptions {
  return {
    conflictAction: 'uniquify',
    filename: getFilename(downloadMethod.trackInfo.title, downloadMethod.fileExtension, downloadLocation),
    saveAs: false,
    url: downloadMethod.url
  };
}

function getFilename(trackTitle: string, fileExtension: string, downloadLocation: string): string {
  const location = `${FilenameService.removeSpecialCharacters(downloadLocation)}`;
  const filename = `${FilenameService.removeSpecialCharacters(trackTitle)}.${fileExtension}`;
  return path.join(location, filename);
}
