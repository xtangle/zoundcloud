import {Observable} from 'rxjs';
import {CLIENT_ID, SC_API_URL} from 'src/ts/constants';
import {IResourceInfo, ITrackInfo} from 'src/ts/download/resource/resource-info';
import {XhrService} from 'src/ts/util/xhr-service';

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
  return XhrService.getJSON$<T>(jsonEndpoint);
}
