import {ITrackDownloadMetadata, ITrackDownloadResult} from '@src/download/download-result';
import {MetadataAdapter} from '@src/download/metadata/metadata-adapter';
import {ITrackInfo, ResourceType} from '@src/download/resource/resource-info';
import {ITrackDownloadInfo} from '@src/download/track-download-info';
import {TrackDownloadInfoFactory} from '@src/download/track-download-info-factory';
import {AsyncSubject} from 'rxjs';
import {switchMap, timeout} from 'rxjs/operators';
import * as VError from 'verror';

export const TrackDownloadService = {
  download(trackInfo: ITrackInfo, downloadLocation: string = ''): ITrackDownloadResult {
    const downloadMetadata$: AsyncSubject<ITrackDownloadMetadata> = new AsyncSubject();
    TrackDownloadInfoFactory.create$(trackInfo, downloadLocation).pipe(
      switchMap(MetadataAdapter.addMetadata$),
      timeout(300000)
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
