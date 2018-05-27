import {ITrackInfo, IUserInfo} from '@src/download/download-info';
import {DownloadInfoService} from '@src/download/download-info-service';
import {TrackDownloadService} from '@src/download/track-download-service';
import {FilenameService} from '@src/util/filename-service';
import {Observable, Subject} from 'rxjs/index';

export const UserDownloadService = {
  download$(userInfo: IUserInfo): Observable<number> {
    const downloadId$: Subject<number> = new Subject<number>();
    const downloadLocation = FilenameService.removeSpecialCharacters(userInfo.username);
    const trackListInfoUrl = `${userInfo.permalink_url}/tracks`;

    DownloadInfoService.getTrackInfoList$(trackListInfoUrl).subscribe((trackInfoList: ITrackInfo[]) => {
      trackInfoList.forEach((trackInfo: ITrackInfo) => {
        TrackDownloadService.download$(trackInfo, downloadLocation).subscribe(downloadId$);
      });
    });
    return downloadId$.asObservable();
  }
};
