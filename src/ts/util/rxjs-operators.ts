import {Observable} from 'rxjs';
import {concatMap, filter, mapTo} from 'rxjs/operators';

export function concatFilter<T>(predicate: (value: T) => Observable<boolean>) {
  return concatMap((value: T) =>
    predicate(value).pipe(
      filter(Boolean),
      mapTo(value),
    ),
  );
}
