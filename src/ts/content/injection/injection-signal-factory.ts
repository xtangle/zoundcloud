import * as $ from 'jquery';
import {interval, merge, Observable} from 'rxjs';
import {filter, map, switchMapTo, take} from 'rxjs/operators';
import {ZC_DL_BUTTON_CLASS} from 'src/ts/constants';
import {ReloadContentPageMessage} from 'src/ts/messaging/extension/reload-content-page.message';
import {ContentPageMessenger} from 'src/ts/messaging/page/content-page-messenger';
import {elementExist$, elementExistOrAdded$} from 'src/ts/util/dom-observer';

export const InjectionSignalFactory = {
  create$(selector: string): Observable<JQuery<HTMLElement>> {
    return merge(
      elementExistOrAdded$(selector),
      forcefullyInjectSignal$(selector)
    ).pipe(
      map(toJQuery),
      filter(hasNoDownloadButton)
    );
  }
};

function forcefullyInjectSignal$(selector: string): Observable<Node> {
  return merge(
    ContentPageMessenger.onMessage$(ReloadContentPageMessage.TYPE).pipe(
      switchMapTo(interval(200).pipe(take(20)))
    ),
    interval(1000),
  ).pipe(
    switchMapTo(elementExist$(selector))
  );
}

function toJQuery(node: HTMLElement): JQuery<HTMLElement> {
  return $(node);
}

function hasNoDownloadButton(node: JQuery<HTMLElement>): boolean {
  return node.find(`.${ZC_DL_BUTTON_CLASS}`).length === 0;
}
