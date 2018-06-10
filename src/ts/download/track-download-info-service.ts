import {CLIENT_ID, I1_CLIENT_ID, SC_I1_API_URL} from '@src/constants';
import {ITrackInfo} from '@src/download/resource-info';
import {ITrackDownloadInfo, TrackDownloadMethod} from '@src/download/track-download-info';
import {FilenameService} from '@src/util/filename-service';
import {XhrRequestService} from '@src/util/xhr-request-service';
import * as path from 'path';
import {combineLatest, Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import DownloadOptions = chrome.downloads.DownloadOptions;

export interface IScI1ApiTrackDownloadInfo {
  http_mp3_128_url?: string;
}

export const TrackDownloadInfoService = {
  toDownloadInfo$(trackInfo: ITrackInfo, downloadLocation: string): Observable<ITrackDownloadInfo> {
    return combineLatest(canUseDownloadUrlMethod$(trackInfo), canUseStreamUrlMethod$(trackInfo)).pipe(
      switchMap(([canUseDownloadUrlMethod, canUseStreamUrlMethod]) => {
        if (canUseDownloadUrlMethod) {
          return useDownloadUrlMethod$(trackInfo, downloadLocation);
        } else if (canUseStreamUrlMethod) {
          return useStreamUrlMethod$(trackInfo, downloadLocation);
        } else {
          return useI1ApiMethod$(trackInfo, downloadLocation);
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

function getDownloadUrl(trackInfo: ITrackInfo): string {
  return `${trackInfo.download_url}?client_id=${CLIENT_ID}`;
}

function canUseStreamUrlMethod$(trackInfo: ITrackInfo): Observable<boolean> {
  if (!trackInfo.stream_url) {
    return of(false);
  } else {
    return XhrRequestService.checkStatus$(getStreamUrl(trackInfo)).pipe(map((status) => status === 200));
  }
}

function getStreamUrl(trackInfo: ITrackInfo): string {
  return `${trackInfo.stream_url}?client_id=${CLIENT_ID}`;
}

function useDownloadUrlMethod$(trackInfo: ITrackInfo, downloadLocation: string): Observable<ITrackDownloadInfo> {
  const filePath = getFilePath(downloadLocation, trackInfo.title, trackInfo.original_format);
  const url = getDownloadUrl(trackInfo);
  return of({
    downloadMethod: TrackDownloadMethod.DownloadUrlMethod,
    downloadOptions: toDownloadOptions(filePath, url),
    originalUrl: url,
    trackInfo
  });
}

function useStreamUrlMethod$(trackInfo: ITrackInfo, downloadLocation: string): Observable<ITrackDownloadInfo> {
  const filePath = getFilePath(downloadLocation, trackInfo.title, 'mp3');
  const url = getStreamUrl(trackInfo);
  return of<ITrackDownloadInfo>({
    downloadMethod: TrackDownloadMethod.StreamUrlMethod,
    downloadOptions: toDownloadOptions(filePath, url),
    originalUrl: url,
    trackInfo
  });
}

function useI1ApiMethod$(trackInfo: ITrackInfo, downloadLocation: string): Observable<ITrackDownloadInfo> {
  const dlInfoEndpoint = `${SC_I1_API_URL}/tracks/${trackInfo.id}/streams?client_id=${I1_CLIENT_ID}`;
  return XhrRequestService.getJSON$<IScI1ApiTrackDownloadInfo>(dlInfoEndpoint).pipe(
    map((downloadInfo: IScI1ApiTrackDownloadInfo) => {
      if (downloadInfo.http_mp3_128_url) {
        const filePath = getFilePath(downloadLocation, trackInfo.title, 'mp3');
        const url = downloadInfo.http_mp3_128_url;
        return {
          downloadMethod: TrackDownloadMethod.I1ApiMethod,
          downloadOptions: toDownloadOptions(filePath, url),
          originalUrl: url,
          trackInfo
        };
      } else {
        throw new Error(`No download URL found in i1 api endpoint response: ${dlInfoEndpoint}`);
      }
    })
  );
}

function getFilePath(downloadLocation: string, trackTitle: string, fileExtension: string): string {
  const location = `${FilenameService.removeSpecialCharacters(downloadLocation)}`;
  const filename = `${FilenameService.removeSpecialCharacters(trackTitle)}.${fileExtension}`;
  return path.join(location, filename);
}

function toDownloadOptions(filePath: string, url: string): DownloadOptions {
  return {
    conflictAction: 'uniquify',
    filename: filePath,
    saveAs: false,
    url
  };
}
