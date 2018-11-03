import {AsyncSubject, Observable} from 'rxjs';
import {map, timeout} from 'rxjs/operators';
import {ITrackDownloadResult, IUserDownloadResult} from 'src/ts/download/download-result';
import {ITrackInfo, IUserInfo, ResourceType} from 'src/ts/download/resource/resource-info';
import {ResourceInfoService} from 'src/ts/download/resource/resource-info-service';
import {TrackDownloadService} from 'src/ts/download/track-download-service';
import {FilenameService} from 'src/ts/util/filename-service';

export const UserDownloadService = {
  download$(userInfo: IUserInfo): Observable<IUserDownloadResult> {
    const downloadResult$: AsyncSubject<IUserDownloadResult> = new AsyncSubject();
    const downloadLocation = getDownloadLocation(userInfo);
    const trackListInfoUrl = `${userInfo.permalink_url}/tracks`;

    ResourceInfoService.getTrackInfoList$(trackListInfoUrl).pipe(
      timeout(60000),
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
