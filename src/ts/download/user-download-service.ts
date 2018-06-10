import {ITrackDownloadResult, IUserDownloadResult} from '@src/download/download-result';
import {ITrackInfo, IUserInfo, ResourceType} from '@src/download/resource-info';
import {ResourceInfoService} from '@src/download/resource-info-service';
import {TrackDownloadService} from '@src/download/track-download-service';
import {FilenameService} from '@src/util/filename-service';
import {AsyncSubject, Observable} from 'rxjs';
import {map, timeout} from 'rxjs/operators';

export const UserDownloadService = {
  download$(userInfo: IUserInfo): Observable<IUserDownloadResult> {
    const downloadResult$: AsyncSubject<IUserDownloadResult> = new AsyncSubject();
    const downloadLocation = getDownloadLocation(userInfo);
    const trackListInfoUrl = `${userInfo.permalink_url}/tracks`;

    ResourceInfoService.getTrackInfoList$(trackListInfoUrl).pipe(
      timeout(30000),
      map((tracks: ITrackInfo[]) => tracks.map(
        (trackInfo: ITrackInfo) => TrackDownloadService.download(trackInfo, downloadLocation)
      )),
      map((tracks: ITrackDownloadResult[]) => ({
        kind: ResourceType.User,
        tracks,
        userInfo
      }))
    ).subscribe(downloadResult$);
    return downloadResult$.asObservable();
  }
};

function getDownloadLocation(userInfo: IUserInfo): string {
  return FilenameService.removeSpecialCharacters(userInfo.username);
}
