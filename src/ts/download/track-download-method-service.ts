import {CLIENT_ID, I1_CLIENT_ID, SC_I1_API_URL} from '@src/constants';
import {ITrackInfo} from '@src/download/download-info';
import {ITrackDownloadMethod} from '@src/download/track-download-method';
import {XhrRequestService} from '@src/util/xhr-request-service';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

export interface IScI1ApiTrackDownloadInfo {
  http_mp3_128_url?: string;
}

export interface ITrackDownloadMethodService {
  getDownloadMethod(trackInfo: ITrackInfo): Observable<ITrackDownloadMethod>;
}

export const TrackDownloadMethodService: ITrackDownloadMethodService = {
  getDownloadMethod(trackInfo: ITrackInfo): Observable<ITrackDownloadMethod> {
    if (trackInfo.downloadable) {
      return getDownloadUrlMethod(trackInfo);

    } else if (trackInfo.stream_url) {
      return getStreamUrlMethod(trackInfo);

    } else {
      return getScI1ApiMethod(trackInfo);
    }
  }
};

function getDownloadUrlMethod(trackInfo: ITrackInfo): Observable<ITrackDownloadMethod> {
  return of({
    fileExtension: trackInfo.original_format,
    url: `${trackInfo.download_url}?client_id=${CLIENT_ID}`
  });
}

function getStreamUrlMethod(trackInfo: ITrackInfo): Observable<ITrackDownloadMethod> {
  return of({
    fileExtension: 'mp3',
    url: `${trackInfo.stream_url}?client_id=${CLIENT_ID}`
  });
}

function getScI1ApiMethod(trackInfo: ITrackInfo): Observable<ITrackDownloadMethod> {
  const dlInfoEndpoint = `${SC_I1_API_URL}/tracks/${trackInfo.id}/streams?client_id=${I1_CLIENT_ID}`;
  return XhrRequestService.getJSON$<IScI1ApiTrackDownloadInfo>(dlInfoEndpoint).pipe(
    map((downloadInfo: IScI1ApiTrackDownloadInfo) => {
      if (downloadInfo.http_mp3_128_url) {
        return {
          fileExtension: 'mp3',
          url: downloadInfo.http_mp3_128_url
        };
      } else {
        throw new Error('No download URL found in i1 api endpoint response');
      }
    })
  );
}
