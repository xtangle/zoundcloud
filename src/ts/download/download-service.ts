import {IDownloadInfo, IPlaylistInfo, ITrackInfo, IUserInfo} from '@src/download/download-info';
import {DownloadInfoService} from '@src/download/download-info-service';
import {PlaylistDownloadService} from '@src/download/playlist-download-service';
import {TrackDownloadService} from '@src/download/track-download-service';
import {UserDownloadService} from '@src/download/user-download-service';
import {logger} from '@src/util/logger';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {timeout} from 'rxjs/operators';

export const DownloadService = {
  download$(downloadInfoUrl: string): Observable<number> {
    const downloadId$: Subject<number> = new ReplaySubject();
    DownloadInfoService.getDownloadInfo$(downloadInfoUrl)
      .pipe(timeout(30000))
      .subscribe(
        doDownload.bind(null, downloadId$),
        onError.bind(null, downloadId$)
      );
    return downloadId$.asObservable();
  }
};

function doDownload(downloadId$: Subject<number>, downloadInfo: IDownloadInfo) {
  switch (downloadInfo.kind) {
    case 'track': {
      TrackDownloadService.download$(downloadInfo as ITrackInfo).subscribe(downloadId$);
      break;
    }
    case 'playlist': {
      PlaylistDownloadService.download$(downloadInfo as IPlaylistInfo).subscribe(downloadId$);
      break;
    }
    case 'user': {
      UserDownloadService.download$(downloadInfo as IUserInfo).subscribe(downloadId$);
      break;
    }
    default: {
      const err =
        `Cannot download, unknown download info kind: ${downloadInfo.kind} from url: ${downloadInfo.permalink_url}`;
      logger.error(err);
      downloadId$.error(err);
    }
  }
}

function onError(downloadId$: Subject<number>, err: any) {
  logger.error('Cannot download, unable to get download info', err);
  downloadId$.error(err);
}
