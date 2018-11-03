import {AsyncSubject, Observable, Subject} from 'rxjs';
import {timeout} from 'rxjs/operators';
import {IDownloadResult} from 'src/ts/download/download-result';
import {PlaylistDownloadService} from 'src/ts/download/playlist-download-service';
import {
  IPlaylistInfo,
  IResourceInfo,
  ITrackInfo,
  IUserInfo,
  ResourceType
} from 'src/ts/download/resource/resource-info';
import {ResourceInfoService} from 'src/ts/download/resource/resource-info-service';
import {TrackDownloadService} from 'src/ts/download/track-download-service';
import {UserDownloadService} from 'src/ts/download/user-download-service';
import * as VError from 'verror';

export const DownloadService = {
  download$(resourceInfoUrl: string): Observable<IDownloadResult> {
    const downloadResult$: AsyncSubject<IDownloadResult> = new AsyncSubject();
    ResourceInfoService.getResourceInfo$(resourceInfoUrl)
      .pipe(timeout(60000))
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
      const err = new Error(
        `Cannot download, unsupported resource type '${resourceInfo.kind}' gotten from ${resourceInfoUrl}`);
      downloadResult$.error(err);
    }
  }
}

function onError(downloadResult$: Subject<IDownloadResult>, resourceInfoUrl: string, e: Error) {
  const err = new VError(e, `Cannot download, unable to get resource info from ${resourceInfoUrl}`);
  downloadResult$.error(err);
}
