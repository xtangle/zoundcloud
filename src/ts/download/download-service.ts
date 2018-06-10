import {IDownloadResult} from '@src/download/download-result';
import {PlaylistDownloadService} from '@src/download/playlist-download-service';
import {IPlaylistInfo, IResourceInfo, ITrackInfo, IUserInfo, ResourceType} from '@src/download/resource-info';
import {ResourceInfoService} from '@src/download/resource-info-service';
import {TrackDownloadService} from '@src/download/track-download-service';
import {UserDownloadService} from '@src/download/user-download-service';
import {logger} from '@src/util/logger';
import {AsyncSubject, Observable, Subject} from 'rxjs';
import {timeout} from 'rxjs/operators';

export const DownloadService = {
  download$(resourceInfoUrl: string): Observable<IDownloadResult> {
    const downloadResult$: AsyncSubject<IDownloadResult> = new AsyncSubject();
    ResourceInfoService.getResourceInfo$(resourceInfoUrl)
      .pipe(timeout(30000))
      .subscribe(
        doDownload.bind(null, downloadResult$, resourceInfoUrl),
        onError.bind(null, downloadResult$, resourceInfoUrl)
      );
    return downloadResult$.asObservable();
  }
};

function doDownload(downloadResult$: AsyncSubject<IDownloadResult>,
                    resourceInfoUrl: string,
                    resourceInfo: IResourceInfo) {
  switch (resourceInfo.kind) {
    case ResourceType.Track: {
      const downloadResult = TrackDownloadService.download(resourceInfo as ITrackInfo);
      downloadResult$.next(downloadResult);
      downloadResult$.complete();
      break;
    }
    case ResourceType.Playlist: {
      const downloadResult = PlaylistDownloadService.download(resourceInfo as IPlaylistInfo);
      downloadResult$.next(downloadResult);
      downloadResult$.complete();
      break;
    }
    case ResourceType.User: {
      UserDownloadService.download$(resourceInfo as IUserInfo).subscribe(downloadResult$);
      break;
    }
    default: {
      const err = `Cannot download, unsupported resource type ${resourceInfo.kind} gotten from ${resourceInfoUrl}`;
      logger.error(err);
      downloadResult$.error(err);
    }
  }
}

function onError(downloadResult$: Subject<IDownloadResult>, resourceInfoUrl: string, err: any) {
  logger.error(`Cannot download, unable to get resource info from ${resourceInfoUrl}`, err);
  downloadResult$.error(err);
}
