import {ITrackInfo} from '@src/download/resource-info';
import {ITrackDownloadInfo} from '@src/download/track-download-info';
import {ITrackDownloadMethodInfo} from '@src/download/track-download-method';
import {TrackDownloadMethodService} from '@src/download/track-download-method-service';
import {FilenameService} from '@src/util/filename-service';
import * as path from 'path';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import DownloadOptions = chrome.downloads.DownloadOptions;

export const TrackDownloadInfoFactory = {
  create$(trackInfo: ITrackInfo, downloadLocation: string): Observable<ITrackDownloadInfo> {
    return TrackDownloadMethodService.getDownloadMethodInfo$(trackInfo).pipe(
      map(toDownloadInfo.bind(null, trackInfo, downloadLocation))
    );
  }
};

function toDownloadInfo(trackInfo: ITrackInfo,
                        downloadLocation: string,
                        downloadMethodInfo: ITrackDownloadMethodInfo): ITrackDownloadInfo {
  const filePath = getFilePath(downloadLocation, trackInfo.title, downloadMethodInfo.format);
  return {
    downloadMethod: downloadMethodInfo.downloadMethod,
    downloadOptions: getDownloadOptions(filePath, downloadMethodInfo.url),
    originalUrl: downloadMethodInfo.url,
    trackInfo
  };
}

function getFilePath(downloadLocation: string, trackTitle: string, fileExtension: string): string {
  const location = `${FilenameService.removeSpecialCharacters(downloadLocation)}`;
  const filename = `${FilenameService.removeSpecialCharacters(trackTitle)}.${fileExtension}`;
  return path.join(location, filename);
}

function getDownloadOptions(filePath: string, url: string): DownloadOptions {
  return {
    conflictAction: 'uniquify',
    filename: filePath,
    saveAs: false,
    url
  };
}
