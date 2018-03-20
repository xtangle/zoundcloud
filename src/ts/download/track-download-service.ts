import {CLIENT_ID, I1_CLIENT_ID, SC_I1_API_URL} from '@src/constants';
import {ITrackInfo} from '@src/download/download-info';
import {FilenameService} from '@src/util/filename-service';
import * as path from 'path';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isNullOrUndefined} from 'util';
import DownloadOptions = chrome.downloads.DownloadOptions;

interface IDownloadMethod {
  url: string;
  fileExtension: string;
}

export interface ITrackDownloadService {
  // noinspection JSUnusedLocalSymbols
  downloadTrack(trackInfo: ITrackInfo, downloadLocation?: string): Observable<number>;
}

export const TrackDownloadService: ITrackDownloadService = {
  downloadTrack(trackInfo: ITrackInfo, downloadLocation?: string): Observable<number> {
    const downloadId$: Subject<number> = new Subject<number>();
    const downloadMethod = getDownloadMethod(trackInfo);
    const downloadOptions: DownloadOptions = {
      filename: getFilename(trackInfo.title, downloadMethod.fileExtension, downloadLocation),
      saveAs: false,
      url: downloadMethod.url
    };

    chrome.downloads.download(downloadOptions, (id: number) => {
      if (id !== undefined) {
        downloadId$.next(id);
        downloadId$.complete();
      } else {
        downloadId$.error(chrome.runtime.lastError.message);
      }
    });

    return downloadId$.asObservable();
  }
};

function getDownloadMethod(trackInfo: ITrackInfo): IDownloadMethod {
  let url;
  let fileExtension;
  if (trackInfo.downloadable) {
    url = `${trackInfo.download_url}?client_id=${CLIENT_ID}`;
    fileExtension = trackInfo.original_format;
  } else if (trackInfo.stream_url) {
    url = `${trackInfo.stream_url}?client_id=${CLIENT_ID}`;
    fileExtension = 'mp3';
  } else {
    url = `${SC_I1_API_URL}/tracks/${trackInfo.id}/streams?client_id=${I1_CLIENT_ID}`;
    fileExtension = 'mp3';
  }
  return {url, fileExtension};
}

function getFilename(trackTitle: string, fileExtension: string, downloadLocation?: string): string {
  const filename = `${FilenameService.removeSpecialCharacters(trackTitle)}.${fileExtension}`;
  if (isNullOrUndefined(downloadLocation)) {
    return filename;
  } else {
    return path.join(downloadLocation, filename);
  }
}
