import * as $ from 'jquery';
import 'rxjs/add/observable/fromEventPattern';
import {Observable} from 'rxjs/Observable';

export function domElementRemoved$(elem: Node): Observable<boolean> {
  let mutationObserver: MutationObserver;
  return Observable.fromEventPattern<boolean>(
    (handler: (signal: boolean) => void) => {
      mutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
        mutations.forEach((mutation: MutationRecord) => {
          const nodes = $.makeArray(mutation.removedNodes);
          if (nodes.some((node: Node) => node.contains(elem))) {
            handler(true);
          }
        });
      });
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
      return mutationObserver;
    },
    () => {
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
    }
  );
}
