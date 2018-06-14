import {CLIENT_ID, SC_API_URL} from '@src/constants';
import {IResourceInfo, ITrackInfo} from '@src/download/resource/resource-info';
import {XhrRequestService} from '@src/util/xhr-request-service';
import {Observable} from 'rxjs';

/**
 * Fetches the resource metadata information from SoundCloud when given the url
 */
export const ResourceInfoService = {
  getResourceInfo$(url: string): Observable<IResourceInfo> {
    return getResource$<IResourceInfo>(url);
  },
  getTrackInfoList$(url: string): Observable<ITrackInfo[]> {
    return getResource$<ITrackInfo[]>(url);
  }
};

function getResource$<T>(url: string): Observable<T> {
  const jsonEndpoint = `${SC_API_URL}/resolve.json?url=${url}&client_id=${CLIENT_ID}`;
  return XhrRequestService.getJSON$<T>(jsonEndpoint);
}
