import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

export interface IXhrRequestService {
  getArrayBuffer$(url: string): Observable<ArrayBuffer>;
  getJSON$<T extends object>(url: string): Observable<T>;
}

export const XhrRequestService: IXhrRequestService = {
  getArrayBuffer$(url: string): Observable<ArrayBuffer> {
    return getResponse$<ArrayBuffer>('arraybuffer', url);
  },
  getJSON$<T extends object>(url: string): Observable<T> {
    return getResponse$<T>('json', url);
  }
};

function getResponse$<T>(responseType: XMLHttpRequestResponseType, url: string): Observable<T> {
  const response$: Subject<T> = new Subject<T>();
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = responseType;
  xhr.onload = () => {
    if (xhr.status === 200) {
      response$.next(xhr.response);
      response$.complete();
    } else {
      response$.error(`Unable to get ${responseType || 'text'}, response is ${xhr.statusText} (${xhr.status})`);
    }
  };
  xhr.onerror = (ev: ErrorEvent) => {
    response$.error(`Unable to get ${responseType || 'text'}, network error: ${ev}`);
  };
  xhr.send();
  return response$;
}
