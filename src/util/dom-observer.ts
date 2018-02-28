import * as $ from 'jquery';
import 'rxjs/add/observable/fromEventPattern';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';

export function elementRemoved$(elem: Node): Observable<boolean> {
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
    () => mutationObserver.disconnect()
  );
}

export function elementAdded$(test: (node: Node) => boolean): Observable<Node> {
  let mutationObserver: MutationObserver;
  return Observable.fromEventPattern<Node>(
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
