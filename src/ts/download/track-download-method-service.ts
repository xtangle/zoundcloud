import {combineLatest, Observable, of} from 'rxjs';
import {flatMap, map, withLatestFrom} from 'rxjs/operators';
import {CLIENT_ID, I1_CLIENT_ID, SC_I1_API_URL} from 'src/ts/constants';
import {ITrackInfo} from 'src/ts/download/resource/resource-info';
import {ITrackDownloadMethodInfo, TrackDownloadMethod} from 'src/ts/download/track-download-method';
import {IOptions} from 'src/ts/options/option';
import {OptionsObservables} from 'src/ts/options/options-observables';
import {XhrService} from 'src/ts/util/xhr-service';

export interface IScI1ApiTrackDownloadInfo {
  http_mp3_128_url?: string;
}

export const TrackDownloadMethodService = {
  getDownloadMethodInfo$(trackInfo: ITrackInfo): Observable<ITrackDownloadMethodInfo> {
    return combineLatest(canUseDownloadUrlMethod$(trackInfo), canUseStreamUrlMethod$(trackInfo)).pipe(
      withLatestFrom(OptionsObservables.getOptions$()),
      flatMap(([[canUseDownloadUrlMethod, canUseStreamUrlMethod], options]: [[boolean, boolean], IOptions]) => {
        if (canUseDownloadUrlMethod && shouldUseDownloadUrlMethod(trackInfo, options)) {
          return useDownloadUrlMethod$(trackInfo);
        } else if (canUseStreamUrlMethod) {
          return useStreamUrlMethod$(trackInfo);
        } else {
          return useI1ApiMethod$(trackInfo);
        }
      })
    );
  }
};

function canUseDownloadUrlMethod$(trackInfo: ITrackInfo): Observable<boolean> {
  if (!trackInfo.downloadable) {
    return of(false);
  } else {
    return XhrService.ping$(getDownloadUrl(trackInfo)).pipe(map((status) => status === 200));
  }
}

function shouldUseDownloadUrlMethod(trackInfo: ITrackInfo, options: IOptions): boolean {
  return !options.alwaysDownloadMp3 || trackInfo.original_format === 'mp3';
}

function getDownloadUrl(trackInfo: ITrackInfo): string {
  return `${trackInfo.download_url}?client_id=${CLIENT_ID}`;
}

function useDownloadUrlMethod$(trackInfo: ITrackInfo): Observable<ITrackDownloadMethodInfo> {
  return of({
    downloadMethod: TrackDownloadMethod.DownloadUrlMethod,
    format: trackInfo.original_format,
    url: getDownloadUrl(trackInfo)
  });
}

function canUseStreamUrlMethod$(trackInfo: ITrackInfo): Observable<boolean> {
  if (!trackInfo.stream_url) {
    return of(false);
  } else {
    return XhrService.ping$(getStreamUrl(trackInfo)).pipe(map((status) => status === 200));
  }
}

function getStreamUrl(trackInfo: ITrackInfo): string {
  return `${trackInfo.stream_url}?client_id=${CLIENT_ID}`;
}

function useStreamUrlMethod$(trackInfo: ITrackInfo): Observable<ITrackDownloadMethodInfo> {
  return of({
    downloadMethod: TrackDownloadMethod.StreamUrlMethod,
    format: 'mp3',
    url: getStreamUrl(trackInfo)
  });
}

function useI1ApiMethod$(trackInfo: ITrackInfo): Observable<ITrackDownloadMethodInfo> {
  const dlInfoEndpoint = `${SC_I1_API_URL}/tracks/${trackInfo.id}/streams?client_id=${I1_CLIENT_ID}`;
  return XhrService.getJSON$<IScI1ApiTrackDownloadInfo>(dlInfoEndpoint).pipe(
    map((downloadInfo: IScI1ApiTrackDownloadInfo) => {
      if (downloadInfo.http_mp3_128_url) {
        return {
          downloadMethod: TrackDownloadMethod.I1ApiMethod,
          format: 'mp3',
          url: downloadInfo.http_mp3_128_url
        };
      } else {
        throw new Error(`No download URL found in i1 api endpoint response: ${dlInfoEndpoint}`);
      }
    })
  );
}
