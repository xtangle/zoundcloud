import {AsyncSubject} from 'rxjs';
import {flatMap, tap, timeout} from 'rxjs/operators';
import {ITrackDownloadMetadata, ITrackDownloadResult} from 'src/ts/download/download-result';
import {MetadataAdapter} from 'src/ts/download/metadata/metadata-adapter';
import {ITrackInfo, ResourceType} from 'src/ts/download/resource/resource-info';
import {ITrackDownloadInfo} from 'src/ts/download/track-download-info';
import {TrackDownloadInfoFactory} from 'src/ts/download/track-download-info-factory';
import {logger} from 'src/ts/util/logger';
import * as VError from 'verror';

export const TrackDownloadService = {
  download(trackInfo: ITrackInfo, downloadLocation: string = ''): ITrackDownloadResult {
    const downloadMetadata$: AsyncSubject<ITrackDownloadMetadata> = new AsyncSubject();
    TrackDownloadInfoFactory.create$(trackInfo, downloadLocation).pipe(
      tap((downloadInfo: ITrackDownloadInfo) => logger.debug('Downloading track', downloadInfo)),
      flatMap(MetadataAdapter.addMetadata$),
      tap((downloadInfo: ITrackDownloadInfo) => logger.debug('Added metadata', downloadInfo)),
      timeout(1800000)
    ).subscribe(
      downloadTrack.bind(null, downloadMetadata$),
      onError.bind(null, downloadMetadata$, trackInfo)
    );
    return {
      kind: ResourceType.Track,
      metadata$: downloadMetadata$.asObservable(),
      trackInfo
    };
  }
};

function downloadTrack(downloadMetadata$: AsyncSubject<ITrackDownloadMetadata>, downloadInfo: ITrackDownloadInfo) {
  chrome.downloads.download(downloadInfo.downloadOptions, (downloadId: number) => {
    if (downloadId !== undefined) {
      downloadMetadata$.next({
        downloadId,
        downloadInfo
      });
      downloadMetadata$.complete();
    } else {
      downloadMetadata$.error(new Error(chrome.runtime.lastError.message));
    }
    URL.revokeObjectURL(downloadInfo.downloadOptions.url);
  });
}

function onError(downloadMetadata$: AsyncSubject<ITrackDownloadMetadata>, trackInfo: ITrackInfo, e: Error) {
  const err = new VError(e, `Cannot download track: ${trackInfo.title}`);
  downloadMetadata$.error(err);
}
