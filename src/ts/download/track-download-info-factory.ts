import * as path from 'path';
import {combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
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
    return combineLatest(
      TrackDownloadMethodService.getDownloadMethodInfo$(trackInfo),
      OptionsObservables.getOptions$(),
    ).pipe(
      map(([downloadMethodInfo, options]) => {
        trackInfo = cleanTrackTitleIfEnabled(trackInfo, options);
        return toDownloadInfo(trackInfo, downloadMethodInfo, downloadLocation, options);
      }),
    );
  },
};

function toDownloadInfo(trackInfo: ITrackInfo,
                        downloadMethodInfo: ITrackDownloadMethodInfo,
                        downloadLocation: string,
                        options: IOptions): ITrackDownloadInfo {
  const filePath = getFilePath(downloadLocation, trackInfo.title, downloadMethodInfo.format);
  return {
    downloadMethod: downloadMethodInfo.downloadMethod,
    downloadOptions: getDownloadOptions(filePath, downloadMethodInfo.url, options),
    originalUrl: downloadMethodInfo.url,
    trackInfo,
  };
}

function cleanTrackTitleIfEnabled(trackInfo: ITrackInfo, options: IOptions): ITrackInfo {
  if (!options.cleanTrackTitle.enabled) {
    return trackInfo;
  }
  const regex = new RegExp(options.cleanTrackTitle.pattern, 'i');
  const cleanedTitle = trackInfo.title.replace(regex, '').trim();
  return {
    ...trackInfo,
    // Don't use cleaned title if the pattern matched the entire title
    title: cleanedTitle === '' ? trackInfo.title : cleanedTitle,
  };
}

function getFilePath(downloadLocation: string, trackTitle: string, fileExtension: string): string {
  const location = `${FilenameService.removeSpecialCharacters(downloadLocation)}`;
  const filename = `${FilenameService.removeSpecialCharacters(trackTitle)}.${fileExtension}`;
  return path.join(location, filename);
}

function getDownloadOptions(filePath: string, url: string, options: IOptions): DownloadOptions {
  return {
    conflictAction: options.overwriteExistingFiles ? 'overwrite' : 'uniquify',
    filename: filePath,
    saveAs: false,
    url,
  };
}
