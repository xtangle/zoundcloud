import * as path from 'path';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ITrackInfo} from 'src/ts/download/resource/resource-info';
import {ITrackDownloadInfo} from 'src/ts/download/track-download-info';
import {ITrackDownloadMethodInfo} from 'src/ts/download/track-download-method';
import {TrackDownloadMethodService} from 'src/ts/download/track-download-method-service';
import {FilenameService} from 'src/ts/util/filename-service';
import DownloadOptions = chrome.downloads.DownloadOptions;

export const TrackDownloadInfoFactory = {
  create$(trackInfo: ITrackInfo, downloadLocation: string): Observable<ITrackDownloadInfo> {
    const cleanTrackInfo = cleanTrackTitle(trackInfo);
    return TrackDownloadMethodService.getDownloadMethodInfo$(cleanTrackInfo).pipe(
      map(toDownloadInfo.bind(null, cleanTrackInfo, downloadLocation))
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

function cleanTrackTitle(trackInfo: ITrackInfo): ITrackInfo {
  const freeDlRegex = /[-_|/*! ]*[\[(]?(buy\s?=\s?)?free[\s_]?(download|dl)[\])]?\s?[-_|/*! ]*$/i;
  return {
    ...trackInfo,
    title: trackInfo.title.replace(freeDlRegex, '')
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
