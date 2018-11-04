import * as $ from 'jquery';
import {fromEventPattern, merge, Observable, Observer} from 'rxjs';

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
      observeAllNodes(mutationObserver);
      return mutationObserver;
    },
    () => mutationObserver.disconnect(),
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
      observeAllNodes(mutationObserver);
      return mutationObserver;
    },
    () => mutationObserver.disconnect(),
  );
}

export function elementExist$(selector: string): Observable<Node> {
  return Observable.create((observer: Observer<Node>) => {
    const nodes = $(selector);
    nodes.each((i) => {
      observer.next(nodes[i]);
    });
    observer.complete();
  });
}

export function elementExistOrAdded$(selector: string): Observable<Node> {
  return merge(
    elementExist$(selector),
    elementAdded$((node: Node) => $(node).is(selector)),
  );
}

function observeAllNodes(mutationObserver: MutationObserver) {
  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
