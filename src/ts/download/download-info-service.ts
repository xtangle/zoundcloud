import {CLIENT_ID, SC_API_URL} from '@src/constants';
import {IDownloadInfo, ITrackInfo} from '@src/download/download-info';
import {XhrRequestService} from '@src/util/xhr-request-service';
import {Observable} from 'rxjs';

/**
 * Fetches the download information when given a tab url
 */
export const DownloadInfoService = {
  getDownloadInfo$(url: string): Observable<IDownloadInfo> {
    return getResource$<IDownloadInfo>(url);
  },
  getTrackInfoList$(url: string): Observable<ITrackInfo[]> {
    return getResource$<ITrackInfo[]>(url);
  }
};

function getResource$<T>(url: string): Observable<T> {
  const jsonEndpoint = `${SC_API_URL}/resolve.json?url=${url}&client_id=${CLIENT_ID}`;
  return XhrRequestService.getJSON$<T>(jsonEndpoint);
}
