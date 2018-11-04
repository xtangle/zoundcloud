import * as path from 'path';
import {Observable} from 'rxjs';
import {flatMap, map, tap} from 'rxjs/operators';
import {ITrackInfo} from 'src/ts/download/resource/resource-info';
import {ITrackDownloadInfo} from 'src/ts/download/track-download-info';
import {ITrackDownloadMethodInfo} from 'src/ts/download/track-download-method';
import {TrackDownloadMethodService} from 'src/ts/download/track-download-method-service';
import {IOptions} from 'src/ts/options/option';
import {OptionsObservables} from 'src/ts/options/options-observables';
import {FilenameService} from 'src/ts/util/filename-service';
import DownloadOptions = chrome.downloads.DownloadOptions;

export const TrackDownloadInfoFactory = {
  create$(trackInfo: ITrackInfo, downloadLocation: string): Observable<ITrackDownloadInfo> {
    return OptionsObservables.getOptions$().pipe(
      flatMap((options: IOptions) => {
        trackInfo = options.cleanTrackTitle ? cleanTrackTitle(trackInfo) : trackInfo;
        return TrackDownloadMethodService.getDownloadMethodInfo$(trackInfo).pipe(
          map((downloadMethodInfo: ITrackDownloadMethodInfo) =>
            toDownloadInfo(trackInfo, downloadMethodInfo, downloadLocation, options)
          )
        );
      })
    );
  }
};

function toDownloadInfo(trackInfo: ITrackInfo,
                        downloadMethodInfo: ITrackDownloadMethodInfo,
                        downloadLocation: string,
                        options: IOptions): ITrackDownloadInfo {
  const filePath = getFilePath(downloadLocation, trackInfo.title, downloadMethodInfo.format);
  return {
    downloadMethod: downloadMethodInfo.downloadMethod,
    downloadOptions: getDownloadOptions(options, filePath, downloadMethodInfo.url),
    originalUrl: downloadMethodInfo.url,
    trackInfo
  };
}

function cleanTrackTitle(trackInfo: ITrackInfo): ITrackInfo {
  const freeDlRegex = /[-_|/*!\s]*[\[(\s]*(buy\s?=\s?)?free[\s_]?(download|dl).*$/i;
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

function getDownloadOptions(options: IOptions, filePath: string, url: string): DownloadOptions {
  return {
    conflictAction: options.overwriteExistingFiles ? 'overwrite' : 'uniquify',
    filename: filePath,
    saveAs: false,
    url
  };
}
