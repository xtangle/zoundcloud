import * as $ from 'jquery';
import {fromEventPattern, Observable, Observer} from 'rxjs';

export function elementRemoved$(elem: Node): Observable<any> {
  let mutationObserver: MutationObserver;
  return fromEventPattern<any>(
    (handler: () => void) => {
      mutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
        mutations.forEach((mutation: MutationRecord) => {
          const nodes = $.makeArray(mutation.removedNodes);
          if (nodes.some((node: Node) => node.contains(elem))) {
            handler();
          }
        });
      });
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
      return mutationObserver;
    },
    () => mutationObserver.disconnect()
  );
}

export function elementAdded$(test: (node: Node) => boolean): Observable<Node> {
  let mutationObserver: MutationObserver;
  return fromEventPattern<Node>(
    (handler: (signal: Node) => void) => {
      mutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
        mutations.forEach((mutation: MutationRecord) => {
          const nodes = $.makeArray(mutation.addedNodes);
          nodes.forEach((node: Node) => {
            if (test(node)) {
              handler(node);
            }
          });
        });
      });
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
      return mutationObserver;
    },
    () => mutationObserver.disconnect()
  );
}

export function elementExist$(selector: string): Observable<Node> {
  return Observable.create((observer: Observer<Node>) => {
    const node = $(selector);
    if (node.length) {
      observer.next(node[0]);
    }
    observer.complete();
  });
}
