import {AsyncSubject, Observable} from 'rxjs';

export const XhrService = {
  ping$(url: string): Observable<number> {
    return pingUrl$(url);
  },
  getArrayBuffer$(url: string): Observable<ArrayBuffer> {
    return getResponse$<ArrayBuffer>('arraybuffer', url);
  },
  getJSON$<T>(url: string): Observable<T> {
    return getResponse$<T>('json', url);
  }
};

function getResponse$<T>(responseType: XMLHttpRequestResponseType, url: string): Observable<T> {
  const response$: AsyncSubject<T> = new AsyncSubject<T>();
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = responseType;
  xhr.onload = () => {
    if (xhr.status === 200) {
      response$.next(xhr.response);
      response$.complete();
    } else {
      response$.error(new Error(`Unable to get from ${url}, response is ${xhr.statusText} (${xhr.status})`));
    }
  };
  xhr.onerror = () => {
    response$.error(new Error(`Unable to get from ${url}, network error`));
  };
  xhr.send();
  return response$;
}

function pingUrl$(url: string): Observable<number> {
  const status$: AsyncSubject<number> = new AsyncSubject<number>();
  const xhr = new XMLHttpRequest();
  xhr.open('HEAD', url, true);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === xhr.HEADERS_RECEIVED) {
      status$.next(xhr.status);
      status$.complete();
      xhr.abort();
    }
  };
  xhr.onerror = () => {
    status$.next(xhr.status);
    status$.complete();
  };
  xhr.send();
  return status$;
}
