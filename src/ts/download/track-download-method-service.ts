import {CLIENT_ID, I1_CLIENT_ID, SC_I1_API_URL} from '@src/constants';
import {ITrackInfo} from '@src/download/download-info';
import {ITrackDownloadMethod} from '@src/download/track-download-method';
import {XhrRequestService} from '@src/util/xhr-request-service';
import {combineLatest, Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

export interface IScI1ApiTrackDownloadInfo {
  http_mp3_128_url?: string;
}

export const TrackDownloadMethodService = {
  toDownloadMethod$(trackInfo: ITrackInfo): Observable<ITrackDownloadMethod> {
    return combineLatest(canUseDownloadUrlMethod$(trackInfo), canUseStreamUrlMethod$(trackInfo)).pipe(
      switchMap(([canUseDownloadUrlMethod, canUseStreamUrlMethod]) => {
        if (canUseDownloadUrlMethod) {
          return getDownloadUrlMethod$(trackInfo);
        } else if (canUseStreamUrlMethod) {
          return getStreamUrlMethod$(trackInfo);
        } else {
          return getScI1ApiMethod$(trackInfo);
        }
      })
    );
  }
};

function canUseDownloadUrlMethod$(trackInfo: ITrackInfo): Observable<boolean> {
  if (!trackInfo.downloadable) {
    return of(false);
  } else {
    return XhrRequestService.checkStatus$(getDownloadUrl(trackInfo)).pipe(map((status) => status === 200));
  }
}

function getDownloadUrlMethod$(trackInfo: ITrackInfo): Observable<ITrackDownloadMethod> {
  return of({
    fileExtension: trackInfo.original_format,
    trackInfo,
    url: getDownloadUrl(trackInfo)
  });
}

function getDownloadUrl(trackInfo: ITrackInfo): string {
  return `${trackInfo.download_url}?client_id=${CLIENT_ID}`;
}

function canUseStreamUrlMethod$(trackInfo: ITrackInfo): Observable<boolean> {
  if (!trackInfo.stream_url) {
    return of(false);
  } else {
    return  XhrRequestService.checkStatus$(getStreamUrl(trackInfo)).pipe(map((status) => status === 200));
  }
}

function getStreamUrlMethod$(trackInfo: ITrackInfo): Observable<ITrackDownloadMethod> {
  return of({
    fileExtension: 'mp3',
    trackInfo,
    url: getStreamUrl(trackInfo)
  });
}

function getStreamUrl(trackInfo: ITrackInfo): string {
  return `${trackInfo.stream_url}?client_id=${CLIENT_ID}`;
}

function getScI1ApiMethod$(trackInfo: ITrackInfo): Observable<ITrackDownloadMethod> {
  const dlInfoEndpoint = `${SC_I1_API_URL}/tracks/${trackInfo.id}/streams?client_id=${I1_CLIENT_ID}`;
  return XhrRequestService.getJSON$<IScI1ApiTrackDownloadInfo>(dlInfoEndpoint).pipe(
    map((downloadInfo: IScI1ApiTrackDownloadInfo) => {
      if (downloadInfo.http_mp3_128_url) {
        return {
          fileExtension: 'mp3',
          trackInfo,
          url: downloadInfo.http_mp3_128_url
        };
      } else {
        throw new Error(`No download URL found in i1 api endpoint response: ${dlInfoEndpoint}`);
      }
    })
  );
}
