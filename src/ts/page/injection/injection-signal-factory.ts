import {ZC_DL_BUTTON_CLASS} from '@src/constants';
import {ReloadContentPageMessage} from '@src/messaging/extension/reload-content-page.message';
import {ContentPageMessenger} from '@src/messaging/page/content-page-messenger';
import {elementExist$, elementExistOrAdded$} from '@src/util/dom-observer';
import * as $ from 'jquery';
import {interval, merge, Observable} from 'rxjs';
import {filter, map, switchMapTo} from 'rxjs/operators';

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
    interval(3000),
    ContentPageMessenger.onMessage$(ReloadContentPageMessage.TYPE)
  ).pipe(
    switchMapTo(elementExist$(selector))
  );
}

function toJQuery(node: Node): JQuery<HTMLElement> {
  return $(node);
}

function hasNoDownloadButton(node: JQuery<HTMLElement>): boolean {
  return node.find(`.${ZC_DL_BUTTON_CLASS}`).length === 0;
}
