import {IDownloadInfo, IPlaylistInfo, ITrackInfo, IUserInfo} from '@src/download/download-info';
import {DownloadInfoService} from '@src/download/download-info-service';
import {PlaylistDownloadService} from '@src/download/playlist-download-service';
import {TrackDownloadService} from '@src/download/track-download-service';
import {UserDownloadService} from '@src/download/user-download-service';
import {Observable, Subject} from 'rxjs';
import {timeout} from 'rxjs/operators';

export const DownloadService = {
  download$(downloadInfoUrl: string): Observable<number> {
    const downloadId$: Subject<number> = new Subject<number>();
    DownloadInfoService.getDownloadInfo$(downloadInfoUrl)
      .pipe(timeout(30000))
      .subscribe((downloadInfo: IDownloadInfo) => {
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
            throw new Error(`Cannot download, unknown download info kind: ${downloadInfo.kind}`);
          }
        }
      });
    return downloadId$.asObservable();
  }
};
