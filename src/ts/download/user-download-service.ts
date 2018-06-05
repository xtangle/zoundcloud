import {ITrackInfo, IUserInfo} from '@src/download/download-info';
import {DownloadInfoService} from '@src/download/download-info-service';
import {TrackDownloadService} from '@src/download/track-download-service';
import {FilenameService} from '@src/util/filename-service';
import {logger} from '@src/util/logger';
import {EMPTY, from, Observable, ReplaySubject, Subject} from 'rxjs';
import {catchError, flatMap, mergeMap, timeout} from 'rxjs/operators';

export const UserDownloadService = {
  download$(userInfo: IUserInfo): Observable<number> {
    const downloadId$: Subject<number> = new ReplaySubject<number>();
    const downloadLocation = FilenameService.removeSpecialCharacters(userInfo.username);
    const trackListInfoUrl = `${userInfo.permalink_url}/tracks`;

    DownloadInfoService.getTrackInfoList$(trackListInfoUrl).pipe(
      timeout(30000),
      flatMap((tracks: ITrackInfo[]) => from(tracks)),
      mergeMap((trackInfo: ITrackInfo) =>
        TrackDownloadService.download$(trackInfo, downloadLocation).pipe(
          catchError((err) => {
            logger.error(`Cannot download track ${trackInfo.title} from user ${userInfo.username}`, err);
            return EMPTY;
          })
        )
      )
    ).subscribe(downloadId$);
    return downloadId$.asObservable();
  }
};
