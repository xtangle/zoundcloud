import {ITrackDownloadMetadata, ITrackDownloadResult} from '@src/download/download-result';
import {MetadataAdapter} from '@src/download/metadata/metadata-adapter';
import {ITrackInfo, ResourceType} from '@src/download/resource-info';
import {ITrackDownloadInfo} from '@src/download/track-download-info';
import {TrackDownloadInfoService} from '@src/download/track-download-info-service';
import {logger} from '@src/util/logger';
import {AsyncSubject} from 'rxjs';
import {switchMap, timeout} from 'rxjs/operators';

export const TrackDownloadService = {
  download(trackInfo: ITrackInfo, downloadLocation: string = ''): ITrackDownloadResult {
    const downloadMetadata$: AsyncSubject<ITrackDownloadMetadata> = new AsyncSubject();
    TrackDownloadInfoService.toDownloadInfo$(trackInfo, downloadLocation).pipe(
      switchMap(MetadataAdapter.addMetadata$),
      timeout(300000)
    ).subscribe(
      downloadTrack.bind(null, downloadMetadata$),
      onError.bind(null, downloadMetadata$, trackInfo)
    );
    return {
      kind: ResourceType.Track,
      metadata: downloadMetadata$.asObservable(),
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
      downloadMetadata$.error(chrome.runtime.lastError.message);
    }
    URL.revokeObjectURL(downloadInfo.downloadOptions.url);
  });
}

function onError(downloadMetadata$: AsyncSubject<ITrackDownloadMetadata>, trackInfo: ITrackInfo, err: any) {
  logger.error(`Cannot download track: ${trackInfo}`, err);
  downloadMetadata$.error(err);
}
